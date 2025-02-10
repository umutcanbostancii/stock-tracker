export type OwnerType = 'umutcan' | 'levent' | 'sirket';

export type PlatformType = 'manual' | 'trendyol' | 'hepsiburada' | 'n11' | 'amazon' | 'ciceksepeti' | 'pttavm';

export type TransactionType = 'stok_giris' | 'stok_cikis' | 'pazaryeri_satis' | 'elden_satis' | 'pazaryeri_iade' | 'elden_iade';

export type SortField = 'name' | 'brand' | 'model' | 'quantity' | 'cost_price' | 'sale_price' | 'stock_entry_date' | 'days_in_stock';

export interface Product {
  id?: string;
  user_id?: string;
  name: string;
  brand: string;
  model: string;
  imei?: string;
  quantity: number;
  cost_price: number;
  sale_price: number;
  owner: OwnerType;
  stock_entry_date: string;
  days_in_stock?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id?: string;
  user_id: string;
  product_id: string;
  type: TransactionType;
  quantity: number;
  platform: PlatformType;
  owner: OwnerType;
  sale_price: number;
  sale_date: string;
  imei?: string;
  notes?: string;
  created_at?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
}

export interface Sale {
  id: string;
  product_id: string;
  platform: PlatformType;
  sale_price: number;
  net_profit: number;
  owner_type: OwnerType;
  created_at: string;
  commission_amount?: number;
  shipping_cost?: number;
  service_fee?: number;
}

export interface SaleDetails extends Sale {
  product_name: string;
  brand: string;
  model: string;
}

export interface FinancialSummary {
  totalSales: number;
  totalProfit: number;
  averageProfit: number;
}

export interface ExcelRow {
  name: string;
  brand: string;
  model: string;
  imei?: string;
  quantity: number;
  cost_price: number;
  sale_price: number;
  owner: OwnerType;
  stock_entry_date: string;
} 