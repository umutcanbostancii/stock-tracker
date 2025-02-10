export type PlatformType = 'trendyol' | 'hepsiburada' | 'n11' | 'amazon' | 'ciceksepeti' | 'pttavm' | 'manual';

export type OwnerType = 'umutcan' | 'levent' | 'sirket';

export interface ExcelRow {
  'Ürün Adı': string;
  'Marka': string;
  'Model': string;
  'IMEI'?: string;
  'Stok Miktarı': number | string;
  'Maliyet Fiyatı': number | string;
  'Satış Fiyatı': number | string;
  'Fiyat': number | string;
  'Satın Alım Tarihi'?: string;
  'Stok Giriş Tarihi'?: string;
}

export interface Product {
  id?: string;
  name: string;
  brand: string;
  model: string;
  imei?: string;
  quantity: number;
  cost_price: number;
  sale_price: number;
  price: number;
  owner: OwnerType;
  stock_entry_date: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  days_in_stock?: number;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'days_in_stock'>;

export type SortField = 'name' | 'brand' | 'model' | 'quantity' | 'cost_price' | 'sale_price' | 'stock_entry_date' | 'days_in_stock';
export type SortOrder = 'asc' | 'desc';

export interface Transaction {
  id: string;
  user_id: string;
  product_id: string;
  type: 'stok_giris' | 'stok_cikis' | 'pazaryeri_satis' | 'elden_satis' | 'pazaryeri_iade' | 'elden_iade';
  quantity: number;
  platform: PlatformType;
  notes?: string;
  created_at: string;
  product: Product;
}

export interface TransactionFormData {
  product_id: string;
  type: 'stok_giris' | 'stok_cikis' | 'pazaryeri_satis' | 'elden_satis' | 'pazaryeri_iade' | 'elden_iade';
  quantity: number;
  platform: PlatformType;
  notes?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  totalSales: number;
  totalProfit: number;
  recentTransactions: Transaction[];
  financialSummaries: FinancialSummary[];
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

export interface Sale {
  id: string;
  platform: PlatformType;
  sale_price: number;
  commission_amount: number;
  shipping_cost: number;
  service_fee: number;
  net_profit: number;
  owner_type: OwnerType;
  created_at: string;
  status: string;
}

export interface ProfitShare {
  id: string;
  sale_id: string;
  user_id: string;
  share_type: 'umutcan' | 'levent' | 'sirket';
  share_percentage: number;
  share_amount: number;
  created_at: string;
}

export interface FinancialSummary {
  id: string;
  user_id: string;
  owner_type: OwnerType;
  summary_date: string;
  total_sales: number;
  total_purchases: number;
  total_commission: number;
  total_shipping: number;
  total_service_fee: number;
  total_sale_kdv: number;
  total_purchase_kdv: number;
  total_profit: number;
  created_at: string;
  updated_at: string;
  platform: PlatformType;
  totalOrders: number;
  totalSales: number;
  totalCommission: number;
  totalShipping: number;
  totalServiceFee: number;
  totalProfit: number;
  averageOrderValue: number;
}

export interface SaleFormData {
  product_id: string;
  platform: PlatformType;
  sale_price: number;
  commission_rate: number;
  shipping_cost: number;
  service_fee: number;
  sale_kdv_rate: number;
  payment_due_date?: string;
}

export interface FinancialStats {
  totalSales: number;
  totalPurchases: number;
  totalProfit: number;
  totalCommission: number;
  totalShipping: number;
  totalServiceFee: number;
  totalSaleKdv: number;
  totalPurchaseKdv: number;
  profitMargin: number;
  averageOrderValue: number;
  oldestInventoryDays: number;
  inventoryValue: number;
}

export interface PlatformStats {
  platform: PlatformType;
  totalOrders: number;
  totalSales: number;
  totalCommission: number;
  totalShipping: number;
  totalServiceFee: number;
  totalProfit: number;
  averageOrderValue: number;
}