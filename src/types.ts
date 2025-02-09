export type TransactionType = 'stok_giris' | 'stok_cikis' | 'pazaryeri_satis' | 'elden_satis' | 'pazaryeri_iade' | 'elden_iade';

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  quantity: number;
  price: number;
  created_at: string;
  user_id: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  product_id: string;
  quantity: number;
  platform: string;
  notes: string;
  created_at: string;
  user_id: string;
  product?: Product;
}

export interface TransactionFormData {
  product_id: string;
  type: TransactionType;
  quantity: number;
  platform: string;
  notes: string;
} 