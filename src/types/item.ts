export type ItemCondition = 'mint' | 'near-mint' | 'good' | 'fair' | 'poor'
export type BoxedStatus = 'boxed' | 'unboxed' | 'unknown'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type ItemStatus = 'confirmed' | 'rumoured' | 'duplicate' | 'reissue'
export type ItemScale = string

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

export interface ItemWithCollection extends Item {
  user_item: UserItem | null
}
