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
    const manufacturer = searchParams.get('manufacturer')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .order('manufacturer', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (manufacturer) {
      query = query.eq('manufacturer', manufacturer)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query

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
