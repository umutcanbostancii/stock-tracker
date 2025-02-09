import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Transaction } from '../types';

interface MarketplaceSummary {
  orders: number;
  stock: number;
  revenue: number;
}

interface DashboardData {
  totalProducts: number;
  totalStockValue: number;
  recentTransactions: Transaction[];
  marketplaces: {
    trendyol: MarketplaceSummary;
    hepsiburada: MarketplaceSummary;
    amazon: MarketplaceSummary;
  };
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalProducts: 0,
    totalStockValue: 0,
    recentTransactions: [],
    marketplaces: {
      trendyol: { orders: 0, stock: 0, revenue: 0 },
      hepsiburada: { orders: 0, stock: 0, revenue: 0 },
      amazon: { orders: 0, stock: 0, revenue: 0 }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateStockValue = (products: Product[], transactions: Transaction[]): number => {
    const productStocks = new Map<string, number>();

    // İlk olarak ürünlerin başlangıç stoklarını set et
    products.forEach(product => {
      productStocks.set(product.id, product.quantity);
    });

    // Tüm işlemleri işle
    transactions.forEach(transaction => {
      const currentStock = productStocks.get(transaction.product_id) || 0;
      const quantity = transaction.quantity;

      switch (transaction.type) {
        case 'stok_giris':
          productStocks.set(transaction.product_id, currentStock + quantity);
          break;
        case 'stok_cikis':
        case 'pazaryeri_satis':
        case 'elden_satis':
          productStocks.set(transaction.product_id, currentStock - quantity);
          break;
        case 'pazaryeri_iade':
        case 'elden_iade':
          productStocks.set(transaction.product_id, currentStock + quantity);
          break;
      }
    });

    // Toplam stok değerini hesapla
    let totalValue = 0;
    products.forEach(product => {
      const currentStock = productStocks.get(product.id) || 0;
      totalValue += currentStock * product.price;
    });

    return totalValue;
  };

  const calculateMarketplaceSummaries = (transactions: Transaction[], products: Product[]) => {
    const summaries = {
      trendyol: { orders: 0, stock: 0, revenue: 0 },
      hepsiburada: { orders: 0, stock: 0, revenue: 0 },
      amazon: { orders: 0, stock: 0, revenue: 0 }
    };

    // Her platform için stok ve sipariş sayılarını hesapla
    transactions.forEach(transaction => {
      const platform = transaction.platform.toLowerCase();
      if (platform === 'trendyol' || platform === 'hepsiburada' || platform === 'amazon') {
        const product = products.find(p => p.id === transaction.product_id);
        if (!product) return;

        const summary = summaries[platform as keyof typeof summaries];
        
        if (transaction.type === 'pazaryeri_satis') {
          summary.orders += 1;
          summary.stock -= transaction.quantity;
          summary.revenue += product.price * transaction.quantity;
        } else if (transaction.type === 'pazaryeri_iade') {
          summary.orders -= 1;
          summary.stock += transaction.quantity;
          summary.revenue -= product.price * transaction.quantity;
        }
      }
    });

    return summaries;
  };

  const fetchDashboardData = async () => {
    try {
      const [productsRes, transactionsRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('transactions').select(`
          *,
          product:products (
            id,
            name,
            brand,
            model
          )
        `)
      ]);

      if (productsRes.error) throw productsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      const products = productsRes.data;
      const transactions = transactionsRes.data;
      const totalStockValue = calculateStockValue(products, transactions);
      const marketplaceSummaries = calculateMarketplaceSummaries(transactions, products);

      setData({
        totalProducts: products.length,
        totalStockValue,
        recentTransactions: transactions.slice(0, 5), // Son 5 işlem
        marketplaces: marketplaceSummaries
      });
    } catch (error: any) {
      console.error('Dashboard verisi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'stok_giris': return 'Stok Girişi';
      case 'stok_cikis': return 'Stok Çıkışı';
      case 'pazaryeri_satis': return 'Pazaryeri Satışı';
      case 'elden_satis': return 'Elden Satış';
      case 'pazaryeri_iade': return 'Pazaryeri İadesi';
      case 'elden_iade': return 'Elden İade';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ana metrikler */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Toplam Ürün</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.totalProducts}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Toplam Stok Değeri</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₺{data.totalStockValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</dd>
          </div>
        </div>
      </div>

      {/* Pazaryeri Kartları */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Trendyol */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-[#FF6000]">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Trendyol</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Bekleyen Sipariş</dt>
                <dd className="text-sm font-semibold text-gray-900">{data.marketplaces.trendyol.orders}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Stok</dt>
                <dd className="text-sm font-semibold text-gray-900">{data.marketplaces.trendyol.stock}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Ciro</dt>
                <dd className="text-sm font-semibold text-gray-900">₺{data.marketplaces.trendyol.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Hepsiburada */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-[#FF6B00]">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Hepsiburada</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Bekleyen Sipariş</dt>
                <dd className="text-sm font-semibold text-gray-900">{data.marketplaces.hepsiburada.orders}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Stok</dt>
                <dd className="text-sm font-semibold text-gray-900">{data.marketplaces.hepsiburada.stock}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Ciro</dt>
                <dd className="text-sm font-semibold text-gray-900">₺{data.marketplaces.hepsiburada.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Amazon */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-[#FF9900]">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Amazon</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Bekleyen Sipariş</dt>
                <dd className="text-sm font-semibold text-gray-900">{data.marketplaces.amazon.orders}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Stok</dt>
                <dd className="text-sm font-semibold text-gray-900">{data.marketplaces.amazon.stock}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Ciro</dt>
                <dd className="text-sm font-semibold text-gray-900">₺{data.marketplaces.amazon.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Son İşlemler */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Son İşlemler</h3>
          <div className="mt-4">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem Tipi</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.recentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.product ? (
                              `${transaction.product.name} - ${transaction.product.brand} ${transaction.product.model}`
                            ) : (
                              'Ürün bulunamadı'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={classNames(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              transaction.type.includes('cikis') || transaction.type.includes('satis') 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            )}>
                              {getTransactionTypeDisplay(transaction.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.platform}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}