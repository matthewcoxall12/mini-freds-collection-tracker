import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { validateUpdateItem } from '@/lib/validation'
import { ok, badRequest, notFound, internalError } from '@/lib/responses'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const authResult = await requireAdmin(supabase)
    if (authResult instanceof Response) return authResult

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Request body must be valid JSON')
    }

    const validation = validateUpdateItem(body)
    if (!validation.valid || !validation.data) {
      return badRequest('Validation failed', validation.errors)
    }

    if (Object.keys(validation.data).length === 0) {
      return badRequest('No valid fields provided for update')
    }

    const { data: existing, error: fetchError } = await supabase
      .from('items')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return notFound('Item')
    }

    const { data, error } = await supabase
      .from('items')
      .update({ ...validation.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return internalError('Failed to update item')
    }

    return ok(data)
  } catch (err) {
    console.error('[PATCH /api/items/[id]]', err)
    return internalError()
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const authResult = await requireAdmin(supabase)
    if (authResult instanceof Response) return authResult

    const { data: existing, error: fetchError } = await supabase
      .from('items')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return notFound('Item')
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) {
      return internalError('Failed to delete item')
    }

    return ok({ id, deleted: true })
  } catch (err) {
    console.error('[DELETE /api/items/[id]]', err)
    return internalError()
  }
}
