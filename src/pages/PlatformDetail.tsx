import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Sale, PlatformType } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DateRangePicker } from '../components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import toast from 'react-hot-toast';

const PLATFORM_NAMES = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  n11: 'N11',
  amazon: 'Amazon',
  ciceksepeti: 'Çiçeksepeti',
  pttavm: 'PttAVM',
  manual: 'Manuel',
};

interface SaleDetails extends Sale {
  product: {
    name: string;
    imei: string;
  };
}

export default function PlatformDetail() {
  const { platform } = useParams<{ platform: PlatformType }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sales, setSales] = useState<SaleDetails[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProfit: 0,
    averageOrderValue: 0,
    totalCommission: 0,
    totalShipping: 0,
    totalServiceFee: 0,
  });

  useEffect(() => {
    if (platform) {
      fetchPlatformData();
    }
  }, [platform, dateRange]);

  const fetchPlatformData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sales')
        .select(`
          *,
          product:products (
            name,
            imei
          )
        `)
        .eq('platform', platform);

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const salesData = data as SaleDetails[];
      setSales(salesData);

      // İstatistikleri hesapla
      const newStats = salesData.reduce((acc, sale) => ({
        totalSales: acc.totalSales + Number(sale.sale_price),
        totalOrders: acc.totalOrders + 1,
        totalProfit: acc.totalProfit + Number(sale.net_profit),
        totalCommission: acc.totalCommission + Number(sale.commission_amount),
        totalShipping: acc.totalShipping + Number(sale.shipping_cost),
        totalServiceFee: acc.totalServiceFee + Number(sale.service_fee),
        averageOrderValue: 0,
      }), {
        totalSales: 0,
        totalOrders: 0,
        totalProfit: 0,
        totalCommission: 0,
        totalShipping: 0,
        totalServiceFee: 0,
        averageOrderValue: 0,
      });

      newStats.averageOrderValue = newStats.totalOrders > 0 
        ? newStats.totalSales / newStats.totalOrders 
        : 0;

      setStats(newStats);

    } catch (error: any) {
      console.error('Error fetching platform data:', error);
      toast.error('Platform verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!platform) {
    return <div>Platform bulunamadı</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/finance')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Geri Dön
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{PLATFORM_NAMES[platform]} Detayları</h1>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Toplam Satış</div>
            <div className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Net Kâr</div>
            <div className="text-2xl font-semibold mt-1 text-green-600">{formatCurrency(stats.totalProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Sipariş Sayısı</div>
            <div className="text-2xl font-semibold mt-1">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Ortalama Sipariş</div>
            <div className="text-2xl font-semibold mt-1">{formatCurrency(stats.averageOrderValue)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Siparişler</TabsTrigger>
          <TabsTrigger value="financial">Finansal Detaylar</TabsTrigger>
          <TabsTrigger value="products">Satılan Ürünler</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <div className="rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IMEI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış Tutarı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Kâr
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sale.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.product.imei}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(sale.sale_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(sale.net_profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium">Komisyon Detayları</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Toplam Komisyon</div>
                    <div className="text-xl font-medium">{formatCurrency(stats.totalCommission)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Komisyon Oranı</div>
                    <div className="text-xl font-medium">
                      {((stats.totalCommission / stats.totalSales) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium">Kargo Detayları</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Toplam Kargo</div>
                    <div className="text-xl font-medium">{formatCurrency(stats.totalShipping)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ortalama Kargo</div>
                    <div className="text-xl font-medium">
                      {formatCurrency(stats.totalShipping / stats.totalOrders)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium">Hizmet Bedeli</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Toplam Hizmet Bedeli</div>
                    <div className="text-xl font-medium">{formatCurrency(stats.totalServiceFee)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ortalama Hizmet Bedeli</div>
                    <div className="text-xl font-medium">
                      {formatCurrency(stats.totalServiceFee / stats.totalOrders)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış Adedi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Satış
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Kâr
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(
                  sales.reduce((acc, sale) => {
                    const productName = sale.product.name;
                    if (!acc[productName]) {
                      acc[productName] = {
                        name: productName,
                        count: 0,
                        totalSales: 0,
                        totalProfit: 0,
                      };
                    }
                    acc[productName].count += 1;
                    acc[productName].totalSales += Number(sale.sale_price);
                    acc[productName].totalProfit += Number(sale.net_profit);
                    return acc;
                  }, {} as Record<string, { name: string; count: number; totalSales: number; totalProfit: number }>)
                ).map((product) => (
                  <tr key={product.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(product.totalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 