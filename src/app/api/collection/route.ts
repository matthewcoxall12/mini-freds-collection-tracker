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
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('user_items')
      .select(
        `
        *,
        item:items (
          id,
          name,
          manufacturer,
          range_name,
          reference_number,
          scale,
          livery,
          description,
          image_url,
          release_year,
          rarity,
          status
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .eq('collected', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return internalError('Failed to fetch collection')
    }

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch (err) {
    console.error('[GET /api/collection]', err)
    return internalError()
  }
}
