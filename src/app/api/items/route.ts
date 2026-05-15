import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { validateCreateItem } from '@/lib/validation'
import { created, paginated, badRequest, internalError } from '@/lib/responses'

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10))
    )
    const manufacturersParam = searchParams.get('manufacturers')
    const scalesParam = searchParams.get('scales')
    const statusesParam = searchParams.get('statuses')
    const raritiesParam = searchParams.get('rarities')
    const query = searchParams.get('query')
    const sortField = searchParams.get('sort') ?? 'manufacturer'
    const sortDir = searchParams.get('dir') ?? 'asc'
    const offset = (page - 1) * limit

    const validSortFields = ['manufacturer', 'name', 'reference_number', 'rarity', 'status', 'updated_at']
    const orderField = validSortFields.includes(sortField) ? sortField : 'manufacturer'

    let dbQuery = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .order(orderField, { ascending: sortDir !== 'desc' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (manufacturersParam) {
      const mfrs = manufacturersParam.split(',').filter(Boolean)
      if (mfrs.length > 0) dbQuery = dbQuery.in('manufacturer', mfrs)
    }
    if (scalesParam) {
      const scales = scalesParam.split(',').filter(Boolean)
      if (scales.length > 0) dbQuery = dbQuery.in('scale', scales)
    }
    if (statusesParam) {
      const statuses = statusesParam.split(',').filter(Boolean)
      if (statuses.length > 0) dbQuery = dbQuery.in('status', statuses)
    }
    if (raritiesParam) {
      const rarities = raritiesParam.split(',').filter(Boolean)
      if (rarities.length > 0) dbQuery = dbQuery.in('rarity', rarities)
    }
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,manufacturer.ilike.%${query}%,reference_number.ilike.%${query}%,livery.ilike.%${query}%`)
    }

    const { data, error, count } = await dbQuery

    if (error) {
      return internalError('Failed to fetch items')
    }

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch (err) {
    console.error('[GET /api/items]', err)
    return internalError()
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()

    const authResult = await requireAdmin(supabase)
    if (authResult instanceof Response) return authResult

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Request body must be valid JSON')
    }

    const validation = validateCreateItem(body)
    if (!validation.valid || !validation.data) {
      return badRequest('Validation failed', validation.errors)
    }

    const { data, error } = await supabase
      .from('items')
      .insert(validation.data)
      .select()
      .single()

    if (error) {
      return internalError('Failed to create item')
    }

    return created(data)
  } catch (err) {
    console.error('[POST /api/items]', err)
    return internalError()
  }
}
