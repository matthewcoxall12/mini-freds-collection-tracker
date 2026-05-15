import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { paginated, internalError } from '@/lib/responses'

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

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
    const isCollected = searchParams.get('collected')
    const series = searchParams.get('series')
    const offset = (page - 1) * limit

    let query = supabase
      .from('user_items')
      .select(
        `
        *,
        catalogue_item:catalogue_items (
          id,
          name,
          series,
          series_number,
          description,
          image_url,
          release_year,
          is_limited
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (isCollected !== null) {
      query = query.eq('is_collected', isCollected === 'true')
    }

    if (series) {
      query = query.eq('catalogue_items.series', series)
    }

    const { data, error, count } = await query

    if (error) {
      return internalError('Failed to fetch collection')
    }

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch (err) {
    console.error('[GET /api/collection]', err)
    return internalError()
  }
}
