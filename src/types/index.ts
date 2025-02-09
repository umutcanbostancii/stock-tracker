export type OwnerType = 'umutcan' | 'levent' | 'sirket';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  model: string;
  imei: string | null;
  quantity: number;
  price: number;
  owner: OwnerType;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  platform: 'Trendyol' | 'Hepsiburada' | 'Amazon' | 'manual';
  notes?: string;
  created_at: string;
}

export type ProductFormData = Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface TransactionFormData {
  product_id: string;
  type: 'stok_giris' | 'stok_cikis' | 'pazaryeri_satis' | 'elden_satis' | 'pazaryeri_iade' | 'elden_iade';
  quantity: number;
  platform: 'Trendyol' | 'Hepsiburada' | 'Amazon' | 'manual';
  notes?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalTransactions: number;
  totalStock: number;
  totalValue: number;
  recentTransactions: Transaction[];
  lowStockProducts: Product[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  created_at: string;
}

export interface ImportFormData {
  file: File;
  owner: OwnerType;
}

export interface ExcelRow {
  'Ürün Adı': string;
  'Marka': string;
  'Model': string;
  'IMEI'?: string;
  'Stok Miktarı': string | number;
  'Fiyat': string | number;
  'Alış Tarihi'?: string | Date;
}