import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { ok, badRequest, internalError } from '@/lib/responses'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()
    const userId = DEFAULT_USER_ID

    let body: unknown
    try { body = await request.json() } catch {
      return badRequest('Request body must be valid JSON')
    }

    const { item_id, collected } = body as Record<string, unknown>
    if (!item_id || typeof item_id !== 'string') return badRequest('item_id is required')
    if (typeof collected !== 'boolean') return badRequest('collected must be a boolean')

    const { data, error } = await supabase
      .from('user_items')
      .upsert(
        { user_id: userId, item_id, collected, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,item_id' }
      )
      .select('id, item_id, collected')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return internalError(`Failed to update collection: ${error.message}`)
    }
    return ok(data)
  } catch (err) {
    console.error('[POST /api/collection/toggle]', err)
    return internalError()
  }
}
