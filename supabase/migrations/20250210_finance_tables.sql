-- Platform türleri için enum
CREATE TYPE platform_type AS ENUM ('trendyol', 'hepsiburada', 'n11', 'amazon', 'ciceksepeti', 'pttavm', 'manual');

-- Satış detayları tablosu
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    platform platform_type NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) NOT NULL,
    sale_kdv_rate DECIMAL(5,2) NOT NULL,
    sale_kdv_amount DECIMAL(10,2) NOT NULL,
    purchase_kdv_rate DECIMAL(5,2) NOT NULL,
    purchase_kdv_amount DECIMAL(10,2) NOT NULL,
    net_profit DECIMAL(10,2) NOT NULL,
    owner_type owner_type NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kâr paylaşım tablosu
CREATE TABLE profit_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    share_type VARCHAR(50) NOT NULL, -- 'umutcan', 'levent', 'sirket'
    share_percentage DECIMAL(5,2) NOT NULL,
    share_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Finansal özet tablosu (günlük/aylık özet için)
CREATE TABLE financial_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    owner_type owner_type NOT NULL,
    summary_date DATE NOT NULL,
    total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_purchases DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_commission DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_service_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_sale_kdv DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_purchase_kdv DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_profit DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, owner_type, summary_date)
);

-- Stok yaşı takibi için products tablosuna ek alanlar
ALTER TABLE products
ADD COLUMN last_sale_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN days_in_stock INTEGER GENERATED ALWAYS AS 
    (EXTRACT(DAY FROM (CURRENT_TIMESTAMP - purchase_date))) STORED;

-- Tetikleyici fonksiyonu: updated_at alanını güncelle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tetikleyicileri ekle
CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_summaries_updated_at
    BEFORE UPDATE ON financial_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS politikaları
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales"
    ON sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
    ON sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
    ON sales FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profit shares"
    ON profit_shares FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own financial summaries"
    ON financial_summaries FOR SELECT
    USING (auth.uid() = user_id);

-- İndeksler
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_platform ON sales(platform);
CREATE INDEX idx_sales_owner_type ON sales(owner_type);
CREATE INDEX idx_profit_shares_sale_id ON profit_shares(sale_id);
CREATE INDEX idx_profit_shares_user_id ON profit_shares(user_id);
CREATE INDEX idx_financial_summaries_user_date ON financial_summaries(user_id, summary_date); 