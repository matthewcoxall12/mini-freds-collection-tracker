import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { paginated, internalError } from '@/lib/responses'

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

/**
 * GET /api/missing
 *
 * Returns catalogue items that the authenticated user has not yet collected.
 * Uses a left join approach: fetches all catalogue items, then excludes those
 * that exist in the user's collection_entries with is_collected = true.
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()

    const authResult = await requireAuth(supabase)
    if (authResult instanceof Response) return authResult

    const { userId } = authResult

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10))
    )
    const series = searchParams.get('series')
    const offset = (page - 1) * limit

    // Fetch all collected item_ids for this user
    const { data: collectedEntries, error: collectedError } = await supabase
      .from('user_items')
      .select('item_id')
      .eq('user_id', userId)
      .eq('is_collected', true)

    if (collectedError) {
      return internalError('Failed to fetch collection data')
    }

    const collectedIds = (collectedEntries ?? []).map((e) => e.item_id)

    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .order('series', { ascending: true })
      .order('series_number', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (collectedIds.length > 0) {
      query = query.not('id', 'in', `(${collectedIds.join(',')})`)
    }

    if (series) {
      query = query.eq('series', series)
    }

    const { data, error, count } = await query

    if (error) {
      return internalError('Failed to fetch missing items')
    }

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch (err) {
    console.error('[GET /api/missing]', err)
    return internalError()
  }
}
