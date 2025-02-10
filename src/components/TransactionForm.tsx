import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Product, Transaction, OwnerType, PlatformType, TransactionType } from '../types';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface GroupedProducts {
  [category: string]: {
    [brand: string]: Product[];
  };
}

export default function TransactionForm({ onClose, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<Product[]>([]);
  
  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    product_id: '',
    type: 'stok_cikis' as TransactionType,
    quantity: 1,
    platform: 'manual' as PlatformType,
    owner: 'sirket' as OwnerType,
    sale_price: 0,
    sale_date: new Date().toISOString().split('T')[0],
    imei: '',
    notes: ''
  });

  useEffect(() => {
    // Supabase realtime subscription
    const channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    fetchProducts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const grouped = products.reduce<GroupedProducts>((acc, product) => {
        if (!acc[product.name]) {
          acc[product.name] = {};
        }
        if (!acc[product.name][product.brand]) {
          acc[product.name][product.brand] = [];
        }
        acc[product.name][product.brand].push(product);
        return acc;
      }, {});

      setGroupedProducts(grouped);
      setCategories(Object.keys(grouped).sort());
    }
  }, [products]);

  useEffect(() => {
    if (formData.category && groupedProducts[formData.category]) {
      setBrands(Object.keys(groupedProducts[formData.category]).sort());
      setFormData(prev => ({ ...prev, brand: '', product_id: '' }));
    } else {
      setBrands([]);
    }
  }, [formData.category]);

  useEffect(() => {
    if (formData.category && formData.brand && groupedProducts[formData.category]?.[formData.brand]) {
      setModels(groupedProducts[formData.category][formData.brand].sort((a, b) => a.model.localeCompare(b.model)));
      setFormData(prev => ({ ...prev, product_id: '' }));
    } else {
      setModels([]);
    }
  }, [formData.brand]);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .gt('quantity', 0)
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Ürünler yüklenirken hata oluştu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      // Seçilen ürünü bul
      const selectedProduct = products.find(p => p.id === formData.product_id);
      if (!selectedProduct) {
        throw new Error('Ürün bulunamadı');
      }

      // Stok kontrolü
      if (formData.type === 'stok_cikis' && selectedProduct.quantity < formData.quantity) {
        throw new Error('Yetersiz stok miktarı');
      }

      // İşlemi kaydet
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          product_id: formData.product_id,
          type: formData.type,
          quantity: formData.quantity,
          platform: formData.platform as PlatformType,
          owner: formData.owner,
          sale_price: formData.sale_price,
          sale_date: formData.sale_date,
          imei: formData.imei,
          notes: formData.notes,
          user_id: user.id
        }]);

      if (transactionError) throw transactionError;

      // Stok miktarını güncelle
      const newQuantity = formData.type === 'stok_cikis'
        ? selectedProduct.quantity - formData.quantity
        : selectedProduct.quantity + formData.quantity;

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', formData.product_id);

      if (updateError) throw updateError;

      toast.success('İşlem başarıyla kaydedildi');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('İşlem hatası:', error);
      toast.error(error.message || 'İşlem kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Kapat</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 mb-6">
                      İşlem Ekle
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-6">
                        {/* Ürün Seçimi Bölümü */}
                        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                          <h4 className="font-medium text-gray-700">Ürün Bilgileri</h4>
                          
                          <div>
                            <label htmlFor="category" className="block text-sm font-normal text-gray-600">
                              Ürün Kategorisi
                            </label>
                            <select
                              id="category"
                              name="category"
                              required
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                            >
                              <option value="">Kategori seçin</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>

                          {formData.category && (
                            <div>
                              <label htmlFor="brand" className="block text-sm font-normal text-gray-600">
                                Marka
                              </label>
                              <select
                                id="brand"
                                name="brand"
                                required
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                              >
                                <option value="">Marka seçin</option>
                                {brands.map((brand) => (
                                  <option key={brand} value={brand}>
                                    {brand}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {formData.brand && (
                            <div>
                              <label htmlFor="model" className="block text-sm font-normal text-gray-600">
                                Model
                              </label>
                              <select
                                id="product_id"
                                name="product_id"
                                required
                                value={formData.product_id}
                                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                              >
                                <option value="">Model seçin</option>
                                {models.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.model} (Stok: {product.quantity})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* İşlem Detayları Bölümü */}
                        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                          <h4 className="font-medium text-gray-700">İşlem Detayları</h4>
                          
                          <div>
                            <label htmlFor="type" className="block text-sm font-normal text-gray-600">
                              İşlem Tipi
                            </label>
                            <select
                              id="type"
                              name="type"
                              required
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                            >
                              <option value="stok_giris">Stok Girişi</option>
                              <option value="stok_cikis">Stok Çıkışı</option>
                              <option value="pazaryeri_satis">Pazar Yeri Satışı</option>
                              <option value="elden_satis">Elden Satış</option>
                              <option value="pazaryeri_iade">Pazar Yeri İade</option>
                              <option value="elden_iade">Elden İade</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="quantity" className="block text-sm font-normal text-gray-600">
                              Miktar
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              required
                              min="1"
                              value={formData.quantity}
                              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                            />
                          </div>

                          <div>
                            <label htmlFor="platform" className="block text-sm font-normal text-gray-600">
                              Platform
                            </label>
                            <select
                              id="platform"
                              name="platform"
                              required
                              value={formData.platform}
                              onChange={(e) => setFormData({ ...formData, platform: e.target.value as PlatformType })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                            >
                              <option value="manual">Manuel</option>
                              <option value="trendyol">Trendyol</option>
                              <option value="hepsiburada">Hepsiburada</option>
                              <option value="n11">N11</option>
                              <option value="amazon">Amazon</option>
                              <option value="ciceksepeti">Çiçeksepeti</option>
                              <option value="pttavm">PttAVM</option>
                            </select>
                          </div>
                        </div>

                        {/* Satış Detayları Bölümü */}
                        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                          <h4 className="font-medium text-gray-700">Satış Detayları</h4>
                          
                          <div>
                            <label htmlFor="sale_price" className="block text-sm font-normal text-gray-600">
                              Satış Fiyatı
                            </label>
                            <div className="relative mt-1">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₺</span>
                              </div>
                              <input
                                type="text"
                                name="sale_price"
                                id="sale_price"
                                required
                                value={formData.sale_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9,]/g, '');
                                  const numberValue = parseFloat(value.replace(',', '.')) || 0;
                                  setFormData({ ...formData, sale_price: numberValue });
                                }}
                                onFocus={(e) => e.target.select()}
                                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                                placeholder="0,00"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="sale_date" className="block text-sm font-normal text-gray-600">
                              Satış Tarihi
                            </label>
                            <input
                              type="date"
                              name="sale_date"
                              id="sale_date"
                              required
                              value={formData.sale_date}
                              onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                            />
                          </div>

                          <div>
                            <label htmlFor="owner" className="block text-sm font-normal text-gray-600">
                              İşlemi Yapan
                            </label>
                            <select
                              id="owner"
                              name="owner"
                              required
                              value={formData.owner}
                              onChange={(e) => setFormData({ ...formData, owner: e.target.value as OwnerType })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                            >
                              <option value="umutcan">Umutcan</option>
                              <option value="levent">Levent</option>
                              <option value="sirket">Şirket</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="imei" className="block text-sm font-normal text-gray-600">
                              IMEI (Opsiyonel)
                            </label>
                            <input
                              type="text"
                              name="imei"
                              id="imei"
                              value={formData.imei}
                              onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* İşlem Notu */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <label htmlFor="notes" className="block text-sm font-normal text-gray-600">
                          İşlem Notu
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-600"
                        />
                      </div>

                      <div className="mt-6 flex justify-end gap-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 