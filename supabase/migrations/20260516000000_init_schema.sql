-- Mini Freds Collection Tracker: Supabase Schema
-- Production-grade database design with RLS, indexes, and triggers

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE item_scale AS ENUM (
  '1:43',
  '1:64',
  '1:76'
);

CREATE TYPE item_rarity AS ENUM (
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
);

CREATE TYPE item_status AS ENUM (
  'confirmed',
  'duplicate',
  'uncertain',
  'kit',
  'non-1:43'
);

CREATE TYPE collection_condition AS ENUM (
  'mint',
  'near-mint',
  'good',
  'fair',
  'poor'
);

CREATE TYPE collection_boxed_status AS ENUM (
  'boxed',
  'unboxed',
  'damaged-box',
  'unknown'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Catalogue: Master list of all known Austin A35 van models
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  range_name TEXT,
  reference_number TEXT,
  scale item_scale DEFAULT '1:43' NOT NULL,
  category TEXT,
  livery TEXT,
  description TEXT,
  image_url TEXT,
  release_year SMALLINT CHECK (release_year >= 1950 AND release_year <= 2100),
  rarity item_rarity DEFAULT 'common',
  status item_status DEFAULT 'confirmed',
  notes TEXT,
  source_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_name_trgm ON items USING GIN (name gin_trgm_ops);
CREATE INDEX idx_items_manufacturer_trgm ON items USING GIN (manufacturer gin_trgm_ops);
CREATE INDEX idx_items_livery_trgm ON items USING GIN (livery gin_trgm_ops);
CREATE INDEX idx_items_reference_number ON items (reference_number);

-- User's personal collection
CREATE TABLE user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  collected BOOLEAN DEFAULT FALSE,
  personal_notes TEXT,
  condition TEXT,
  boxed_status TEXT,
  purchase_price NUMERIC(10, 2),
  purchase_date DATE,
  storage_location TEXT,
  priority_wanted BOOLEAN DEFAULT FALSE,
  watch_url TEXT,
  personal_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_user_items_user_id ON user_items(user_id);
CREATE INDEX idx_user_items_collected ON user_items(user_id, collected) WHERE collected = true;

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY items_select_public ON items FOR SELECT USING (true);
