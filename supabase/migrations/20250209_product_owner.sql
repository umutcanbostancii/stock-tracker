-- Ürün sahiplik tipi için enum oluştur
CREATE TYPE owner_type AS ENUM ('umutcan', 'levent', 'sirket');

-- Products tablosuna yeni alanlar ekle
ALTER TABLE products
ADD COLUMN owner owner_type NOT NULL DEFAULT 'sirket',
ADD COLUMN purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP; 