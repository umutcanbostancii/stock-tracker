-- Drop existing type check constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Update type check constraint with Turkish values
ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('stok_giris', 'stok_cikis', 'pazaryeri_satis', 'elden_satis', 'pazaryeri_iade', 'elden_iade'));

-- Add user_id constraint
ALTER TABLE transactions
ALTER COLUMN user_id SET NOT NULL;