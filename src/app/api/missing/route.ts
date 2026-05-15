import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { paginated, internalError } from '@/lib/responses'

const DEFAULT_PAGE_SIZE = 200
const MAX_PAGE_SIZE = 500

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()
    const userId = DEFAULT_USER_ID

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10))
    )
    const offset = (page - 1) * limit

    const [collectedResult, userItemsResult] = await Promise.all([
      supabase
        .from('user_items')
        .select('item_id')
        .eq('user_id', userId)
        .eq('collected', true),
      supabase
        .from('user_items')
        .select('item_id, priority_wanted, watch_url, id')
        .eq('user_id', userId),
    ])

    if (collectedResult.error) return internalError('Failed to fetch collection data')

    const collectedIds = (collectedResult.data ?? []).map((e) => e.item_id)

    const userItemMap = new Map(
      (userItemsResult.data ?? []).map((ui) => [ui.item_id, ui])
    )

    let query = supabase
      .from('items')
      .select('id, name, manufacturer, range_name, reference_number, scale, rarity, status, image_url', { count: 'exact' })
      .order('manufacturer', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (collectedIds.length > 0) {
      query = query.not('id', 'in', `(${collectedIds.join(',')})`)
    }

    const { data, error, count } = await query

    if (error) return internalError('Failed to fetch missing items')

    const enriched = (data ?? []).map((item) => ({
      ...item,
      user_item: userItemMap.get(item.id) ?? null,
    }))

    return paginated(enriched, count ?? 0, page, limit)
  } catch (err) {
    console.error('[GET /api/missing]', err)
    return internalError()
  }
}
