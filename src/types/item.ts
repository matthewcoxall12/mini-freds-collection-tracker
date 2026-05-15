export type ItemCondition = 'mint' | 'near-mint' | 'good' | 'fair' | 'poor'
export type BoxedStatus = 'boxed' | 'unboxed' | 'unknown'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type ItemStatus = 'confirmed' | 'uncertain' | 'duplicate' | 'kit' | 'non-1:43'
export type ItemScale = string

export interface Item {
  id: string
  name: string
  manufacturer: string
  reference_number: string
  scale: string
  livery: string | null
  rarity: ItemRarity
  status: ItemStatus
  release_year: number | null
  description: string | null
  notes: string | null
  image_url: string | null
  image_source_url: string | null
  image_source_name: string | null
  image_verified: boolean
  image_verified_at: string | null
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
  collected: boolean
  condition: ItemCondition | null
  boxed_status: BoxedStatus | null
  purchase_price: number | null
  purchase_date: string | null
  personal_notes: string | null
  priority_wanted: boolean
  storage_location: string | null
  watch_url: string | null
  created_at: string
  updated_at: string
}

export interface ItemWithCollection extends Item {
  user_item: UserItem | null
}
