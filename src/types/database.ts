export type ItemCondition = 'mint' | 'near-mint' | 'good' | 'fair' | 'poor'
export type BoxedStatus = 'boxed' | 'unboxed' | 'unknown'

export interface Item {
  id: string
  name: string
  manufacturer: string
  reference_number: string
  scale: string
  livery: string | null
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  status: 'confirmed' | 'rumoured' | 'duplicate' | 'reissue'
  release_year: number | null
  description: string | null
  notes: string | null
  image_url: string | null
  range_name: string | null
  category: string | null
  source_notes: string | null
  created_at: string
  updated_at: string
}

export interface UserItem {
  id: string
  user_id: string
  item_id: string
  condition: ItemCondition | null
  boxed_status: BoxedStatus | null
  purchase_price: number | null
  created_at: string
  updated_at: string
}

export interface CreateItemBody {
  name: string
  manufacturer: string
  reference_number: string
  scale: string
  livery?: string | null
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  status: 'confirmed' | 'rumoured' | 'duplicate' | 'reissue'
  release_year?: number | null
  description?: string | null
  notes?: string | null
  image_url?: string | null
}

export interface UpdateItemBody {
  name?: string
  manufacturer?: string
  reference_number?: string
  scale?: string
  livery?: string | null
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  status?: 'confirmed' | 'rumoured' | 'duplicate' | 'reissue'
  release_year?: number | null
  description?: string | null
  notes?: string | null
  image_url?: string | null
}

export interface UpdateUserItemBody {
  condition?: ItemCondition | null
  boxed_status?: BoxedStatus | null
  purchase_price?: number | null
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}

export interface ImportCatalogueRow {
  name: string
  manufacturer: string
  reference_number: string
  scale: string
  livery?: string | null
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  status: 'confirmed' | 'rumoured' | 'duplicate' | 'reissue'
  release_year?: number | null
  description?: string | null
  notes?: string | null
  image_url?: string | null
}

export interface ImportUserItemRow {
  item_id: string
  condition?: ItemCondition | null
  boxed_status?: BoxedStatus | null
  purchase_price?: number | null
}
