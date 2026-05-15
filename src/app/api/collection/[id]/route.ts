import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { validateUpdateUserItem } from '@/lib/validation'
import { ok, badRequest, notFound, forbidden, internalError } from '@/lib/responses'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const userId = DEFAULT_USER_ID

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Request body must be valid JSON')
    }

    const validation = validateUpdateUserItem(body)
    if (!validation.valid || !validation.data) {
      return badRequest('Validation failed', validation.errors)
    }

    if (Object.keys(validation.data).length === 0) {
      return badRequest('No valid fields provided for update')
    }

    const { data: existing, error: fetchError } = await supabase
      .from('user_items')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return notFound('Collection entry')
    }

    if (existing.user_id !== userId) {
      return forbidden()
    }

    const updatePayload: Record<string, unknown> = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_items')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select(
        `
        *,
        item:items (
          id,
          name,
          manufacturer,
          reference_number,
          image_url
        )
      `
      )
      .single()

    if (error) {
      return internalError('Failed to update collection entry')
    }

    return ok(data)
  } catch (err) {
    console.error('[PATCH /api/collection/[id]]', err)
    return internalError()
  }
}
