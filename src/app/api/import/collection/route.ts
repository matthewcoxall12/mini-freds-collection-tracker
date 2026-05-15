import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { ok, badRequest, internalError } from '@/lib/responses'
import { type ItemCondition, type BoxedStatus } from '@/types/database'

const MAX_ROWS = 500
const VALID_CONDITIONS: ItemCondition[] = ['mint', 'near-mint', 'good', 'fair', 'poor']
const VALID_BOXED_STATUS: BoxedStatus[] = ['boxed', 'unboxed', 'unknown']

/**
 * POST /api/import/collection
 *
 * Allows bulk-import of collection data.
 * Matches each row to a catalogue item by name.
 * Creates or updates user_items entries for the user.
 *
 * Body: Array of objects with item_name, condition, boxed_status, purchase_price.
 * Returns: { processed, matched, unmatched, errors }
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createServerClient()
    const userId = DEFAULT_USER_ID

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Request body must be valid JSON')
    }

    if (!Array.isArray(body)) {
      return badRequest('Request body must be a JSON array')
    }

    if (body.length === 0) {
      return badRequest('Array must not be empty')
    }

    if (body.length > MAX_ROWS) {
      return badRequest(`Maximum ${MAX_ROWS} rows per import request`)
    }

    const validRows: Array<{
      item_name: string
      condition?: ItemCondition | null
      boxed_status?: BoxedStatus | null
      purchase_price?: number | null
    }> = []
    const rowErrors: Array<{ row: number; message: string }> = []

    for (let i = 0; i < body.length; i++) {
      const row = body[i]

      if (!row || typeof row !== 'object') {
        rowErrors.push({ row: i, message: 'Row must be an object' })
        continue
      }

      const r = row as Record<string, unknown>

      if (!r.item_name || typeof r.item_name !== 'string' || r.item_name.trim().length === 0) {
        rowErrors.push({ row: i, message: 'item_name is required' })
        continue
      }

      const condition = r.condition as string | undefined
      if (condition !== undefined && !VALID_CONDITIONS.includes(condition as ItemCondition)) {
        rowErrors.push({
          row: i,
          message: `condition must be one of: ${VALID_CONDITIONS.join(', ')}`,
        })
        continue
      }

      const boxedStatus = r.boxed_status as string | undefined
      if (boxedStatus !== undefined && !VALID_BOXED_STATUS.includes(boxedStatus as BoxedStatus)) {
        rowErrors.push({
          row: i,
          message: `boxed_status must be one of: ${VALID_BOXED_STATUS.join(', ')}`,
        })
        continue
      }

      const purchasePrice = r.purchase_price
      if (purchasePrice !== undefined && (typeof purchasePrice !== 'number' || purchasePrice < 0)) {
        rowErrors.push({ row: i, message: 'purchase_price must be a non-negative number' })
        continue
      }

      validRows.push({
        item_name: r.item_name.trim(),
        condition: condition as ItemCondition | undefined,
        boxed_status: boxedStatus as BoxedStatus | undefined,
        purchase_price: purchasePrice as number | undefined,
      })
    }

    if (validRows.length === 0) {
      return badRequest('No valid rows found', rowErrors.map((e) => ({
        field: `row[${e.row}]`,
        message: e.message,
      })))
    }

    // Build lookup map of items by name
    const uniqueNames = [...new Set(validRows.map((r) => r.item_name))]
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, name')
      .in('name', uniqueNames)

    if (itemsError) {
      return internalError('Failed to look up items')
    }

    const itemLookup = new Map<string, string>()
    for (const item of items ?? []) {
      itemLookup.set(item.name, item.id)
    }

    const upsertPayload: Array<{
      user_id: string
      item_id: string
      condition: ItemCondition | null
      boxed_status: BoxedStatus | null
      purchase_price: number | null
      updated_at: string
    }> = []
    const unmatched: string[] = []

    for (const row of validRows) {
      const itemId = itemLookup.get(row.item_name)

      if (!itemId) {
        unmatched.push(row.item_name)
        continue
      }

      upsertPayload.push({
        user_id: userId,
        item_id: itemId,
        condition: row.condition ?? null,
        boxed_status: row.boxed_status ?? null,
        purchase_price: row.purchase_price ?? null,
        updated_at: new Date().toISOString(),
      })
    }

    let processed = 0
    if (upsertPayload.length > 0) {
      const { data: upserted, error: upsertError } = await supabase
        .from('user_items')
        .upsert(upsertPayload, {
          onConflict: 'user_id,item_id',
          ignoreDuplicates: false,
        })
        .select('id')

      if (upsertError) {
        console.error('[POST /api/import/collection] upsert error:', upsertError)
        return internalError('Failed to import collection data')
      }

      processed = upserted?.length ?? 0
    }

    return ok({
      processed,
      matched: upsertPayload.length,
      unmatched,
      row_errors: rowErrors,
    })
  } catch (err) {
    console.error('[POST /api/import/collection]', err)
    return internalError()
  }
}
