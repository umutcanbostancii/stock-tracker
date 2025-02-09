/*
  # Disable Authentication and RLS

  1. Changes
    - Disable RLS on all tables
    - Remove all RLS policies
    - Allow public access to tables
*/

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;

-- Disable RLS on all tables
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Make user_id optional
ALTER TABLE products ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE transactions ALTER COLUMN user_id DROP NOT NULL;

-- Grant public access
GRANT ALL ON products TO anon;
GRANT ALL ON transactions TO anon;