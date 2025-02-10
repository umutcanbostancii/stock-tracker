import { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import type { OwnerType, ExcelRow } from '../types';

export default function Import() {
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState<OwnerType>('sirket');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      // Excel dosyasını oku
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

          // Her bir satır için ürün oluştur
          for (const row of jsonData) {
            const product = {
              name: row['Ürün Adı'],
              brand: row['Marka'],
              model: row['Model'],
              imei: row['IMEI'] || null,
              quantity: typeof row['Stok Miktarı'] === 'number' ? row['Stok Miktarı'] : parseInt(row['Stok Miktarı']) || 0,
              price: typeof row['Fiyat'] === 'number' ? row['Fiyat'] : parseFloat(row['Fiyat']) || 0,
              owner,
              purchase_date: row['Alış Tarihi'] 
                ? new Date(row['Alış Tarihi']).toISOString()
                : new Date().toISOString(),
              user_id: user.id
            };

            // Zorunlu alanları kontrol et
            if (!product.name || !product.brand || !product.model) {
              throw new Error('Eksik zorunlu alanlar: Ürün Adı, Marka ve Model alanları zorunludur');
            }

            // Ürünü veritabanına ekle
            const { error } = await supabase
              .from('products')
              .insert([product]);

            if (error) throw error;
          }

          toast.success('Ürünler başarıyla içe aktarıldı');
          event.target.value = ''; // Dosya seçimini sıfırla
        } catch (error: any) {
          console.error('Excel okuma hatası:', error);
          toast.error(error.message || 'Excel dosyası işlenirken hata oluştu');
        }
      };

      reader.onerror = () => {
        toast.error('Dosya okuma hatası');
      };

      reader.readAsBinaryString(file);
    } catch (error: any) {
      console.error('İçe aktarma hatası:', error);
      toast.error(error.message || 'İçe aktarma sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Ürün İçe Aktarma</h1>
          <p className="mt-2 text-sm text-gray-700">
            Excel dosyasından toplu ürün içe aktarma işlemlerini buradan yapabilirsiniz.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="space-y-6 max-w-xl">
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
              Ürün Sahibi
            </label>
            <select
              id="owner"
              name="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value as OwnerType)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="umutcan">Umutcan</option>
              <option value="levent">Levent</option>
              <option value="sirket">Şirket</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Excel Dosyası</label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
              <div className="space-y-1 text-center">
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Dosya seç</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      className="sr-only"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                  </label>
                  <p className="pl-1">veya sürükle bırak</p>
                </div>
                <p className="text-xs text-gray-500">Excel (.xlsx, .xls)</p>
                {loading && (
                  <div className="mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">İçe aktarılıyor...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Excel Dosya Formatı</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Excel dosyanız aşağıdaki sütunları içermelidir:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Ürün Adı (zorunlu)</li>
                    <li>Marka (zorunlu)</li>
                    <li>Model (zorunlu)</li>
                    <li>IMEI (opsiyonel)</li>
                    <li>Stok Miktarı</li>
                    <li>Fiyat</li>
                    <li>Alış Tarihi (opsiyonel)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 