import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { paginated, internalError } from '@/lib/responses'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_PAGE_SIZE = 200
const MAX_PAGE_SIZE = 500

type MarketplaceListingRow = {
  provider: string
  item_id: string
  price: number | null
  currency: string | null
  last_seen_at: string
  image_url: string | null
  item_web_url: string
  matched_status: string | null
  listing_status: string | null
}

type MarketplaceSummary = {
  ebay_count: number
  vinted_count: number
  total_count: number
  lowest_price: number | null
  lowest_price_currency: string | null
  last_seen_at: string | null
  best_image_url: string | null
  best_listing_url: string | null
}

function emptySummary(): MarketplaceSummary {
  return {
    ebay_count: 0, vinted_count: 0, total_count: 0,
    lowest_price: null, lowest_price_currency: null,
    last_seen_at: null, best_image_url: null, best_listing_url: null,
  }
}

function aggregateListings(rows: MarketplaceListingRow[]): Map<string, MarketplaceSummary> {
  const map = new Map<string, MarketplaceSummary>()
  for (const r of rows) {
    if (!r.item_id) continue
    const existing = map.get(r.item_id) ?? emptySummary()
    if (r.provider === 'ebay') existing.ebay_count += 1
    if (r.provider === 'vinted') existing.vinted_count += 1
    existing.total_count += 1
    if (r.price != null && (existing.lowest_price == null || r.price < existing.lowest_price)) {
      existing.lowest_price = r.price
      existing.lowest_price_currency = r.currency
      existing.best_listing_url = r.item_web_url
    }
    if (r.last_seen_at && (!existing.last_seen_at || r.last_seen_at > existing.last_seen_at)) {
      existing.last_seen_at = r.last_seen_at
    }
    if (r.image_url && !existing.best_image_url) {
      existing.best_image_url = r.image_url
    }
    map.set(r.item_id, existing)
  }
  return map
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()
    const userId = DEFAULT_USER_ID

    const sp = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10))
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(sp.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10)))
    const offset = (page - 1) * limit

    const [collectedResult, userItemsResult] = await Promise.all([
      supabase.from('user_items').select('item_id').eq('user_id', userId).eq('collected', true),
      supabase.from('user_items').select('item_id, priority_wanted, watch_url, id').eq('user_id', userId),
    ])

    if (collectedResult.error) return internalError('Failed to fetch collection data')

    const collectedIds = (collectedResult.data ?? []).map((e) => e.item_id)
    const userItemMap = new Map((userItemsResult.data ?? []).map((ui) => [ui.item_id, ui]))

    let query = supabase
      .from('items')
      .select('id, name, manufacturer, range_name, reference_number, scale, rarity, status, image_url', { count: 'exact' })
      .order('manufacturer', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (collectedIds.length > 0) {
      query = query.not('id', 'in', `(${collectedIds.join(',')})`)
    }

    const { data: items, error, count } = await query
    if (error) return internalError('Failed to fetch missing items')

    const itemIds = (items ?? []).map((i) => i.id)
    let marketplaceMap = new Map<string, MarketplaceSummary>()

    if (itemIds.length > 0) {
      const { data: listings } = await supabase
        .from('marketplace_listings')
        .select('provider, item_id, price, currency, last_seen_at, image_url, item_web_url, matched_status, listing_status')
        .in('item_id', itemIds)
        .in('matched_status', ['matched', 'possible_match'])
        .eq('listing_status', 'active')

      marketplaceMap = aggregateListings((listings ?? []) as MarketplaceListingRow[])
    }

    const enriched = (items ?? []).map((item) => ({
      ...item,
      user_item: userItemMap.get(item.id) ?? null,
      marketplace: marketplaceMap.get(item.id) ?? emptySummary(),
    }))

    return paginated(enriched, count ?? 0, page, limit)
  } catch (err) {
    console.error('[GET /api/missing]', err)
    return internalError()
  }
}
