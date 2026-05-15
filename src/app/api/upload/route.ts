import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { ok, badRequest, internalError } from '@/lib/responses'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const STORAGE_BUCKET = 'item-images'

/**
 * POST /api/upload
 *
 * Accepts multipart/form-data with a single `file` field.
 * Admin-only. Returns the public URL of the uploaded image.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()

    const authResult = await requireAdmin(supabase)
    if (authResult instanceof Response) return authResult

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return badRequest('Request must be multipart/form-data')
    }

    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return badRequest('A file field is required')
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return badRequest(
        `File type not allowed. Permitted types: ${ALLOWED_MIME_TYPES.join(', ')}`
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return badRequest(`File size exceeds the 5 MB limit`)
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`
    const path = `items/${filename}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[POST /api/upload] storage upload error:', uploadError)
      return internalError('Failed to upload file')
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    return ok({ url: urlData.publicUrl, path })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return internalError()
  }
}
