import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { PlatformType, OwnerType, Sale, PlatformStats } from '../types';
import toast from 'react-hot-toast';
import {
  BanknotesIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CalculatorIcon,
  DocumentTextIcon,
  ClockIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { DateRangePicker } from '../components/DateRangePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DateRange } from 'react-day-picker';

const PLATFORM_COLORS: Record<PlatformType, string> = {
  trendyol: 'bg-orange-100 text-orange-800 ring-orange-600/20',
  hepsiburada: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  n11: 'bg-red-100 text-red-800 ring-red-600/20',
  amazon: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  ciceksepeti: 'bg-pink-100 text-pink-800 ring-pink-600/20',
  pttavm: 'bg-purple-100 text-purple-800 ring-purple-600/20',
  manual: 'bg-gray-100 text-gray-800 ring-gray-600/20',
};

const PLATFORM_NAMES: Record<PlatformType, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  n11: 'N11',
  amazon: 'Amazon',
  ciceksepeti: 'Çiçeksepeti',
  pttavm: 'PttAVM',
  manual: 'Manuel',
};

interface OrderDetails {
  id: string;
  platform: PlatformType;
  orderNumber: string;
  orderDate: string;
  productName: string;
  salePrice: number;
  commission: number;
  shipping: number;
  serviceFee: number;
  netProfit: number;
  status: string;
}

type PlatformData = Record<PlatformType, PlatformStats>;

export default function Finance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<OwnerType | 'all'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [platformData, setPlatformData] = useState<PlatformData>({
    trendyol: { platform: 'trendyol', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
    hepsiburada: { platform: 'hepsiburada', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
    n11: { platform: 'n11', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
    amazon: { platform: 'amazon', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
    ciceksepeti: { platform: 'ciceksepeti', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
    pttavm: { platform: 'pttavm', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
    manual: { platform: 'manual', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 }
  });

  useEffect(() => {
    fetchFinancialData();
  }, [selectedOwner, dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('sales')
        .select<any, Sale>(`
          platform,
          sale_price,
          commission_amount,
          shipping_cost,
          service_fee,
          net_profit,
          owner_type
        `);

      // Tarih filtresi
      if (dateRange && dateRange.from && dateRange.to) {
        query = query.gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      // Sahip filtresi
      if (selectedOwner !== 'all') {
        query = query.eq('owner_type', selectedOwner);
      }

      const { data: sales, error } = await query;

      if (error) {
        throw error;
      }

      console.log('Fetched sales data:', sales);

      // Platform verilerini sıfırla
      const newPlatformData: PlatformData = {
        trendyol: { platform: 'trendyol', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
        hepsiburada: { platform: 'hepsiburada', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
        n11: { platform: 'n11', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
        amazon: { platform: 'amazon', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
        ciceksepeti: { platform: 'ciceksepeti', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
        pttavm: { platform: 'pttavm', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 },
        manual: { platform: 'manual', totalOrders: 0, totalSales: 0, totalCommission: 0, totalShipping: 0, totalServiceFee: 0, totalProfit: 0, averageOrderValue: 0 }
      };

      // Satış verilerini işle
      sales?.forEach((sale: Sale) => {
        const platform = sale.platform as PlatformType;
        newPlatformData[platform].totalOrders += 1;
        newPlatformData[platform].totalSales += Number(sale.sale_price);
        newPlatformData[platform].totalCommission += Number(sale.commission_amount);
        newPlatformData[platform].totalShipping += Number(sale.shipping_cost);
        newPlatformData[platform].totalServiceFee += Number(sale.service_fee);
        newPlatformData[platform].totalProfit += Number(sale.net_profit);
        newPlatformData[platform].averageOrderValue = newPlatformData[platform].totalSales / newPlatformData[platform].totalOrders;
      });

      setPlatformData(newPlatformData);
      console.log('Updated platform data:', newPlatformData);

    } catch (error: any) {
      console.error('Error fetching financial data:', error);
      setError(error.message);
      toast.error('Finansal veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformOrders = async (platform: PlatformType) => {
    try {
      setLoading(true);
      setSelectedPlatform(platform);

      const { data: orders, error } = await supabase
        .from('sales')
        .select<any, Sale & { products: { name: string } }>(`
          id,
          platform,
          sale_price,
          commission_amount,
          shipping_cost,
          service_fee,
          net_profit,
          status,
          created_at,
          products:products!inner (name)
        `)
        .eq('platform', platform)
        .gte('created_at', dateRange?.from?.toISOString() || '')
        .lte('created_at', dateRange?.to?.toISOString() || '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(orders.map(order => ({
        id: order.id,
        platform: order.platform,
        orderNumber: order.id.slice(0, 8).toUpperCase(),
        orderDate: new Date(order.created_at).toLocaleDateString('tr-TR'),
        productName: order.products?.name || 'İsimsiz Ürün',
        salePrice: order.sale_price,
        commission: order.commission_amount,
        shipping: order.shipping_cost,
        serviceFee: order.service_fee,
        netProfit: order.net_profit,
        status: order.status
      })));

    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Siparişler yüklenirken hata oluştu');
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

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const handlePlatformClick = (platform: PlatformType) => {
    navigate(`/finance/${platform}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">
          <p>Hata oluştu: {error}</p>
          <button
            onClick={() => fetchFinancialData()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Finansal Gösterge Paneli</h1>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Tarih Aralığı Seçin"
            />
          </div>
          
          <div className="w-full sm:w-64">
            <Select value={selectedOwner} onValueChange={(value) => setSelectedOwner(value as OwnerType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm Sahipler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sahipler</SelectItem>
                <SelectItem value="umutcan">Umutcan</SelectItem>
                <SelectItem value="levent">Levent</SelectItem>
                <SelectItem value="sirket">Şirket</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(platformData).map(([platform, stats]) => (
          <Card 
            key={platform}
            className={`relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
              PLATFORM_COLORS[platform as PlatformType].replace('text-', 'bg-').split(' ')[0]
            }`}
            onClick={() => handlePlatformClick(platform as PlatformType)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {PLATFORM_NAMES[platform as PlatformType]}
                  </h3>
                  <div className="mt-4 space-y-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalSales)}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      Net Kâr: {formatCurrency(stats.totalProfit)}
                    </p>
                    <div className="text-sm text-gray-600">
                      <p>Komisyon: {formatCurrency(stats.totalCommission)}</p>
                      <p>Kargo: {formatCurrency(stats.totalShipping)}</p>
                      <p>Hizmet Bedeli: {formatCurrency(stats.totalServiceFee)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
                    {stats.totalOrders} Sipariş
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Kartları */}
      {!selectedPlatform ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {platformStats.map((stat) => (
            <div
              key={stat.platform}
              onClick={() => fetchPlatformOrders(stat.platform)}
              className="relative group rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 space-y-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-x-3">
                <div className={`p-2 rounded-lg ${PLATFORM_COLORS[stat.platform]}`}>
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">
                  {PLATFORM_NAMES[stat.platform]}
                </h3>
              </div>
              
              <div className="flex flex-col gap-y-2">
                <div>
                  <p className="text-xs text-gray-500">Toplam Satış</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrency(stat.totalSales)}</p>
                </div>
                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-gray-500">Sipariş Sayısı</p>
                    <p className="font-medium">{stat.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ort. Sipariş</p>
                    <p className="font-medium">{formatCurrency(stat.averageOrderValue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net Kâr</p>
                    <p className="font-medium">{formatCurrency(stat.totalProfit)}</p>
                  </div>
                </div>
              </div>

              <ChevronRightIcon 
                className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-gray-500" 
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Platform Detay Sayfası */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setSelectedPlatform(null)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronRightIcon className="h-5 w-5 rotate-180 mr-1" />
              Geri Dön
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {PLATFORM_NAMES[selectedPlatform]} Siparişleri
            </h2>
          </div>

          {/* Sipariş Tablosu */}
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Sipariş No
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Tarih
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Ürün
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Satış Tutarı
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Net Kâr
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Durum
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Detay</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {order.orderNumber}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.orderDate}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.productName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(order.salePrice)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(order.netProfit)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Detay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sipariş Detay Modal */}
      <Transition.Root show={showOrderDetails} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowOrderDetails}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => setShowOrderDetails(false)}
                      >
                        <span className="sr-only">Kapat</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Sipariş Detayı - {selectedOrder?.orderNumber}
                      </Dialog.Title>
                      <div className="mt-4 space-y-4">
                        <div className="border-t border-gray-200 pt-4">
                          <dl className="divide-y divide-gray-200">
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Sipariş Tarihi</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                {selectedOrder?.orderDate}
                              </dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Ürün</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                {selectedOrder?.productName}
                              </dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Satış Tutarı</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                {selectedOrder && formatCurrency(selectedOrder.salePrice)}
                              </dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Komisyon</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                {selectedOrder && formatCurrency(selectedOrder.commission)}
                              </dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Kargo Ücreti</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                {selectedOrder && formatCurrency(selectedOrder.shipping)}
                              </dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Hizmet Bedeli</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                {selectedOrder && formatCurrency(selectedOrder.serviceFee)}
                              </dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Net Kâr</dt>
                              <dd className="mt-1 text-sm font-semibold text-gray-900 sm:col-span-2 sm:mt-0">
                                {selectedOrder && formatCurrency(selectedOrder.netProfit)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
} 