import { createServerClient } from '@/lib/supabase'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { internalError } from '@/lib/responses'

/**
 * GET /api/export/collection
 *
 * Streams a CSV file of the user's full collection.
 * Includes catalogue item details alongside collection metadata.
 */
export async function GET(): Promise<Response> {
  try {
    const supabase = await createServerClient()
    const userId = DEFAULT_USER_ID

    const { data, error } = await supabase
      .from('user_items')
      .select(
        `
        condition,
        boxed_status,
        purchase_price,
        item:items (
          name,
          manufacturer,
          reference_number,
          scale,
          rarity,
          status,
          release_year,
          description,
          image_url
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      return internalError('Failed to fetch collection for export')
    }

    interface UserItemExport {
      name: string
      manufacturer: string
      reference_number: string
      scale: string
      rarity: string
      status: string
      release_year: string | number
      description: string
      image_url: string
      condition: string
      boxed_status: string
      purchase_price: string | number
    }

    interface UserItemRow {
      condition: string | null
      boxed_status: string | null
      purchase_price: number | null
      item: {
        name: string
        manufacturer: string
        reference_number: string
        scale: string
        rarity: string
        status: string
        release_year: number | null
        description: string | null
        image_url: string | null
      } | null
    }

    const rows: UserItemExport[] = ((data as unknown as UserItemRow[] | null) ?? []).map((entry) => {
      const item = entry.item
      return {
        name: item?.name ?? '',
        manufacturer: item?.manufacturer ?? '',
        reference_number: item?.reference_number ?? '',
        scale: item?.scale ?? '',
        rarity: item?.rarity ?? '',
        status: item?.status ?? '',
        release_year: item?.release_year ?? '',
        description: item?.description ?? '',
        image_url: item?.image_url ?? '',
        condition: entry.condition ?? '',
        boxed_status: entry.boxed_status ?? '',
        purchase_price: entry.purchase_price ?? '',
      }
    })

    const csv = buildCsv(rows as unknown as Record<string, unknown>[])

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mini-freds-collection-${Date.now()}.csv"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/export/collection]', err)
    return internalError()
  }
}

function escapeCsvField(value: unknown): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return 'name,manufacturer,reference_number,scale,rarity,status,release_year,description,image_url,condition,boxed_status,purchase_price\n'
  }

  const headers = Object.keys(rows[0])
  const headerLine = headers.join(',')

  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvField(row[h])).join(',')
  )

  return [headerLine, ...dataLines].join('\n') + '\n'
}
