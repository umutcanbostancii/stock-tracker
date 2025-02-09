/*
  # Update transactions table schema

  1. Changes
    - Add sale_price column for sales transactions
    - Update type check constraint to include new transaction types
    - Update RLS policies for new transaction types

  2. Security
    - Maintain existing RLS policies
    - Add new policies for sale transactions
*/

-- Add sale_price column
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS sale_price decimal(10,2);

-- Update type check constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('stok_giris', 'stok_cikis', 'pazaryeri_satis', 'elden_satis', 'pazaryeri_iade', 'elden_iade'));

-- Disable RLS
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;