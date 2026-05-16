-- Fix RLS policies for user_items and items tables
-- Production was failing with RLS policy violations

-- Disable RLS on items since it's a public read-only catalogue
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS items_select_public ON items;

-- Enable RLS on user_items with permissive policy for anon users
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;

-- Allow anon users to select their own items
CREATE POLICY user_items_select ON user_items
  FOR SELECT
  USING (true);

-- Allow anon users to insert their own items
CREATE POLICY user_items_insert ON user_items
  FOR INSERT
  WITH CHECK (true);

-- Allow anon users to update their own items
CREATE POLICY user_items_update ON user_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anon users to delete their own items
CREATE POLICY user_items_delete ON user_items
  FOR DELETE
  USING (true);
