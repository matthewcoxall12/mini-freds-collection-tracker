import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { ok, badRequest, internalError } from '@/lib/responses'
import { type ImportCatalogueRow } from '@/types/database'

const MAX_ROWS = 1000

/**
 * POST /api/import/catalogue
 *
 * Bulk imports catalogue items from a JSON array body.
 * Admin-only. Uses the service role client for the insert to bypass RLS.
 *
 * Body: Array of ImportCatalogueRow objects.
 * Returns: { inserted, skipped, errors }
 */
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

    if (!Array.isArray(body)) {
      return badRequest('Request body must be a JSON array of catalogue items')
    }

    if (body.length === 0) {
      return badRequest('Array must not be empty')
    }

    if (body.length > MAX_ROWS) {
      return badRequest(`Maximum ${MAX_ROWS} rows per import request`)
    }

    const validRows: ImportCatalogueRow[] = []
    const rowErrors: Array<{ row: number; message: string }> = []

    for (let i = 0; i < body.length; i++) {
      const row = body[i]

      if (!row || typeof row !== 'object') {
        rowErrors.push({ row: i, message: 'Row must be an object' })
        continue
      }

      const r = row as Record<string, unknown>

      if (!r.name || typeof r.name !== 'string' || r.name.trim().length === 0) {
        rowErrors.push({ row: i, message: 'name is required' })
        continue
      }

      if (!r.manufacturer || typeof r.manufacturer !== 'string' || r.manufacturer.trim().length === 0) {
        rowErrors.push({ row: i, message: 'manufacturer is required' })
        continue
      }

      if (!r.reference_number || typeof r.reference_number !== 'string' || r.reference_number.trim().length === 0) {
        rowErrors.push({ row: i, message: 'reference_number is required' })
        continue
      }

      if (!r.scale || typeof r.scale !== 'string' || r.scale.trim().length === 0) {
        rowErrors.push({ row: i, message: 'scale is required' })
        continue
      }

      if (!r.rarity || !['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(String(r.rarity))) {
        rowErrors.push({ row: i, message: 'rarity must be one of: common, uncommon, rare, epic, legendary' })
        continue
      }

      if (!r.status || !['confirmed', 'rumoured', 'duplicate', 'reissue'].includes(String(r.status))) {
        rowErrors.push({ row: i, message: 'status must be one of: confirmed, rumoured, duplicate, reissue' })
        continue
      }

      validRows.push({
        name: (r.name as string).trim(),
        manufacturer: (r.manufacturer as string).trim(),
        reference_number: (r.reference_number as string).trim(),
        scale: (r.scale as string).trim(),
        livery: r.livery ? String(r.livery).trim() : undefined,
        rarity: r.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
        status: r.status as 'confirmed' | 'rumoured' | 'duplicate' | 'reissue',
        description: r.description ? String(r.description).trim() : undefined,
        image_url: r.image_url ? String(r.image_url) : undefined,
        release_year:
          r.release_year !== undefined ? Number(r.release_year) : undefined,
        notes: r.notes ? String(r.notes).trim() : undefined,
      })
    }

    if (validRows.length === 0) {
      return badRequest('No valid rows found', rowErrors.map((e) => ({
        field: `row[${e.row}]`,
        message: e.message,
      })))
    }

    // Use admin client for bulk insert to bypass RLS
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('items')
      .upsert(validRows, {
        onConflict: 'name,series',
        ignoreDuplicates: false,
      })
      .select('id')

    if (error) {
      console.error('[POST /api/import/catalogue] upsert error:', error)
      return internalError('Failed to import catalogue items')
    }

    return ok({
      inserted: data?.length ?? 0,
      skipped: body.length - validRows.length,
      row_errors: rowErrors,
    })
  } catch (err) {
    console.error('[POST /api/import/catalogue]', err)
    return internalError()
  }
}
