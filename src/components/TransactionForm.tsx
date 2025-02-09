import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Product, Transaction } from '../types';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransactionForm({ onClose, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'out',
    quantity: 1,
    platform: 'manual',
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
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
      if (formData.type === 'out' && selectedProduct.quantity < formData.quantity) {
        throw new Error('Yetersiz stok miktarı');
      }

      // İşlemi kaydet
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          ...formData,
          user_id: user.id
        }]);

      if (transactionError) throw transactionError;

      // Stok miktarını güncelle
      const newQuantity = formData.type === 'out'
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      İşlem Ekle
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                            Ürün
                          </label>
                          <select
                            id="product"
                            name="product"
                            required
                            value={formData.product_id}
                            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="">Ürün seçin</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {product.brand} {product.model} (Stok: {product.quantity})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            İşlem Tipi
                          </label>
                          <select
                            id="type"
                            name="type"
                            required
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'in' | 'out' })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="in">Stok Girişi</option>
                            <option value="out">Stok Çıkışı</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                            Platform
                          </label>
                          <select
                            id="platform"
                            name="platform"
                            required
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="manual">Manuel</option>
                            <option value="Trendyol">Trendyol</option>
                            <option value="Hepsiburada">Hepsiburada</option>
                            <option value="Amazon">Amazon</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notlar (İsteğe bağlı)
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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