import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, internalError } from '@/lib/responses'

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()
    const authResult = await requireAuth(supabase)
    if (authResult instanceof Response) return authResult

    const { userId } = authResult

    let body: unknown
    try { body = await request.json() } catch {
      return badRequest('Request body must be valid JSON')
    }

    const { item_id, priority_wanted } = body as Record<string, unknown>
    if (!item_id || typeof item_id !== 'string') return badRequest('item_id is required')
    if (typeof priority_wanted !== 'boolean') return badRequest('priority_wanted must be a boolean')

    const { data, error } = await supabase
      .from('user_items')
      .upsert(
        { user_id: userId, item_id, priority_wanted, collected: false, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,item_id' }
      )
      .select('id, item_id, priority_wanted')
      .single()

    if (error) return internalError('Failed to update priority')
    return ok(data)
  } catch (err) {
    console.error('[POST /api/collection/priority]', err)
    return internalError()
  }
}
