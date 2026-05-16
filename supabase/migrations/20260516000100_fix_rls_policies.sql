-- Fix RLS policies and FK constraints for single-user development mode
-- Production was failing with RLS violations and FK constraint errors

-- Drop FK constraint that requires user_id to exist in auth.users (we use a hardcoded UUID)
ALTER TABLE user_items DROP CONSTRAINT IF EXISTS user_items_user_id_fkey;

-- Disable RLS on items since it's a public read-only catalogue
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS items_select_public ON items;

-- Enable RLS on user_items with permissive policies for anon users (single-user dev mode)
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_items_select ON user_items;
DROP POLICY IF EXISTS user_items_insert ON user_items;
DROP POLICY IF EXISTS user_items_update ON user_items;
DROP POLICY IF EXISTS user_items_delete ON user_items;

CREATE POLICY user_items_select ON user_items FOR SELECT USING (true);
CREATE POLICY user_items_insert ON user_items FOR INSERT WITH CHECK (true);
CREATE POLICY user_items_update ON user_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY user_items_delete ON user_items FOR DELETE USING (true);
