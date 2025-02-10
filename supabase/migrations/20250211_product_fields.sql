-- Ürünler tablosuna yeni alanlar ekle
ALTER TABLE products
ADD COLUMN cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN stock_entry_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN days_in_stock INTEGER GENERATED ALWAYS AS 
  (EXTRACT(DAY FROM (CURRENT_TIMESTAMP - stock_entry_date))) STORED;

-- RLS politikalarını güncelle
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products"
    ON products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
    ON products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
    ON products FOR UPDATE
    USING (auth.uid() = user_id);

-- İndeksler
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_stock_entry_date ON products(stock_entry_date);
CREATE INDEX idx_products_quantity ON products(quantity);
CREATE INDEX idx_products_owner ON products(owner);

-- Eski alanları kaldır
ALTER TABLE products
DROP COLUMN IF EXISTS purchase_date; 