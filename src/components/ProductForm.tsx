import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Product, OwnerType } from '../types';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    model: product?.model || '',
    imei: product?.imei || '',
    quantity: product?.quantity || 0,
    cost_price: typeof product?.cost_price === 'number' ? product.cost_price.toString() : '0',
    sale_price: typeof product?.sale_price === 'number' ? product.sale_price.toString() : '0',
    price: typeof product?.price === 'number' ? product.price.toString() : '0',
    owner: product?.owner || 'sirket' as OwnerType,
    stock_entry_date: product?.stock_entry_date || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const productData = {
        ...formData,
        cost_price: parseFloat(String(formData.cost_price).replace(/[^0-9.,]/g, '').replace(',', '.')),
        sale_price: parseFloat(String(formData.sale_price).replace(/[^0-9.,]/g, '').replace(',', '.')),
        price: parseFloat(String(formData.sale_price).replace(/[^0-9.,]/g, '').replace(',', '.')),
        quantity: parseInt(String(formData.quantity)),
        user_id: user.id
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Ürün başarıyla güncellendi');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Ürün başarıyla eklendi');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Ürün kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
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
                      {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Kategori
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                            Marka
                          </label>
                          <input
                            type="text"
                            name="brand"
                            id="brand"
                            required
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                            Model
                          </label>
                          <input
                            type="text"
                            name="model"
                            id="model"
                            required
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="imei" className="block text-sm font-medium text-gray-700">
                            IMEI (Opsiyonel)
                          </label>
                          <input
                            type="text"
                            name="imei"
                            id="imei"
                            value={formData.imei}
                            onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                            Stok Miktarı
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            required
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700">
                            Maliyet Fiyatı
                          </label>
                          <div className="mt-2">
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₺</span>
                              </div>
                              <input
                                type="text"
                                name="cost_price"
                                id="cost_price"
                                required
                                value={typeof formData.cost_price === 'string' ? formData.cost_price : formData.cost_price.toString()}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9.,]/g, '');
                                  setFormData(prev => ({ ...prev, cost_price: value }));
                                }}
                                className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700">
                            Satış Fiyatı
                          </label>
                          <div className="mt-2">
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₺</span>
                              </div>
                              <input
                                type="text"
                                name="sale_price"
                                id="sale_price"
                                required
                                value={typeof formData.sale_price === 'string' ? formData.sale_price : formData.sale_price.toString()}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9.,]/g, '');
                                  setFormData(prev => ({ ...prev, sale_price: value }));
                                }}
                                className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                            Sahip
                          </label>
                          <select
                            id="owner"
                            name="owner"
                            required
                            value={formData.owner}
                            onChange={(e) => setFormData({ ...formData, owner: e.target.value as OwnerType })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="umutcan">Umutcan</option>
                            <option value="levent">Levent</option>
                            <option value="sirket">Şirket</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="stock_entry_date" className="block text-sm font-medium text-gray-700">
                            Stok Giriş Tarihi
                          </label>
                          <input
                            type="date"
                            name="stock_entry_date"
                            id="stock_entry_date"
                            required
                            value={formData.stock_entry_date}
                            onChange={(e) => setFormData({ ...formData, stock_entry_date: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
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
                          {loading ? 'Kaydediliyor...' : (product ? 'Güncelle' : 'Ekle')}
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