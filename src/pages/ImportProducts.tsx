import { useState } from 'react';
import { ArrowUpTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import type { ProductFormData } from '../types';

export default function ImportProducts() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Lütfen bir dosya seçin');
      return;
    }

    setLoading(true);
    try {
      const data = await readExcelFile(file);
      const products = validateProducts(data);

      const batchSize = 50;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        const { error } = await supabase
          .from('products')
          .insert(batch)
          .select();

        if (error) throw error;
      }

      toast.success(`${products.length} ürün başarıyla içe aktarıldı`);
      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('İçe aktarma hatası:', error);
      toast.error('Ürünler içe aktarılamadı. Lütfen dosya formatını kontrol edin ve tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const validateProducts = (data: any[]): ProductFormData[] => {
    return data.map((row) => ({
      name: String(row.name || ''),
      brand: String(row.brand || ''),
      model: String(row.model || ''),
      imei: row.imei ? String(row.imei) : undefined,
      quantity: parseInt(row.quantity) || 0,
      price: parseFloat(row.price) || 0,
    }));
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['name', 'brand', 'model', 'imei', 'quantity', 'price'],
      ['iPhone 13', 'Apple', 'A2482', '123456789012345', 10, 999.99],
      ['Galaxy S21', 'Samsung', 'SM-G991B', '987654321098765', 5, 799.99],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    XLSX.writeFile(wb, 'urun_import_sablonu.xlsx');
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Ürün İçe Aktarma</h1>
          <p className="mt-2 text-sm text-gray-700">
            Excel dosyasından toplu ürün içe aktarın. Doğru format için şablonu indirin.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Şablon İndir
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Excel Dosya Formatı</h3>
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-4">Excel dosyanız aşağıdaki sütunları içermelidir:</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900">Zorunlu Alanlar:</h4>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>name:</strong> Ürün adı (metin)</li>
                  <li><strong>brand:</strong> Marka (metin)</li>
                  <li><strong>model:</strong> Model kodu/adı (metin)</li>
                  <li><strong>quantity:</strong> Stok miktarı (tam sayı)</li>
                  <li><strong>price:</strong> Birim fiyat (ondalık)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">İsteğe Bağlı Alanlar:</h4>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>imei:</strong> IMEI numarası (metin)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900">Önemli Notlar:</h4>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Sütun isimleri yukarıda gösterildiği gibi olmalıdır (küçük harf)</li>
                <li>Miktar pozitif tam sayı olmalıdır</li>
                <li>Fiyat ondalık sayı olabilir (örn: 999.99)</li>
                <li>IMEI isteğe bağlıdır ve boş bırakılabilir</li>
                <li>Excel dosyasının ilk sayfası kullanılacaktır</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label htmlFor="file-upload" className="block text-sm font-medium leading-6 text-gray-900">
                  Excel dosyası
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-teal-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 hover:text-teal-500"
                      >
                        <span>Dosya seç</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".xlsx,.xls"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">veya sürükle bırak</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">Sadece Excel dosyaları (.xlsx, .xls)</p>
                  </div>
                </div>
                {file && (
                  <div className="mt-4 flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md">
                    <span className="text-sm text-gray-500">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            disabled={!file || loading}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
          </button>
        </div>
      </form>
    </div>
  );
}