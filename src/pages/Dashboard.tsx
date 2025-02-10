import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DashboardStats, Sale, FinancialSummary, OwnerType } from '../types';
import toast from 'react-hot-toast';
import {
  CubeIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  BellIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  message: string;
  type: string;
  created_at: string;
}

interface Note {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

interface OwnerStats {
  totalSales: number;
  totalOrders: number;
  totalProfit: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [platformStats, setPlatformStats] = useState<Record<string, { orders: number, revenue: number, profit: number }>>({
    trendyol: { orders: 0, revenue: 0, profit: 0 },
    hepsiburada: { orders: 0, revenue: 0, profit: 0 },
    n11: { orders: 0, revenue: 0, profit: 0 },
    amazon: { orders: 0, revenue: 0, profit: 0 },
    ciceksepeti: { orders: 0, revenue: 0, profit: 0 },
    pttavm: { orders: 0, revenue: 0, profit: 0 }
  });
  const [ownerStats, setOwnerStats] = useState<Record<OwnerType, OwnerStats>>({
    umutcan: { totalSales: 0, totalOrders: 0, totalProfit: 0 },
    levent: { totalSales: 0, totalOrders: 0, totalProfit: 0 },
    sirket: { totalSales: 0, totalOrders: 0, totalProfit: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    fetchNotes();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Platform istatistiklerini hesapla
      const platformData = { ...platformStats };
      const ownerData = { ...ownerStats };

      sales?.forEach((sale: Sale) => {
        const platform = sale.platform.toLowerCase();
        if (platformData[platform]) {
          platformData[platform].orders += 1;
          platformData[platform].revenue += Number(sale.sale_price);
          platformData[platform].profit += Number(sale.net_profit);
        }

        // Sahip istatistiklerini güncelle
        const owner = sale.owner_type;
        if (ownerData[owner]) {
          ownerData[owner].totalOrders += 1;
          ownerData[owner].totalSales += Number(sale.sale_price);
          ownerData[owner].totalProfit += Number(sale.net_profit);
        }
      });

      setPlatformStats(platformData);
      setOwnerStats(ownerData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { error } = await supabase
        .from('notes')
        .insert([{ content: newNote, user_id: user.id }]);

      if (error) throw error;

      setNewNote('');
      fetchNotes();
      toast.success('Not başarıyla eklendi');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Not eklenirken hata oluştu');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Satış Kanalları */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Satış Kanalları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(platformStats).map(([platform, stats]) => (
            <div key={platform} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-medium capitalize mb-2">{platform}</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Sipariş</p>
                  <p className="font-medium">{stats.orders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ciro</p>
                  <p className="font-medium">{formatCurrency(stats.revenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kâr</p>
                  <p className="font-medium">{formatCurrency(stats.profit)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kullanıcı İstatistikleri */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Kullanıcı İstatistikleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(ownerStats).map(([owner, stats]) => (
            <div key={owner} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-medium capitalize mb-2">
                {owner === 'umutcan' ? 'Umutcan' : owner === 'levent' ? 'Levent' : 'Şirket'}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Sipariş</p>
                  <p className="font-medium">{stats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ciro</p>
                  <p className="font-medium">{formatCurrency(stats.totalSales)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kâr</p>
                  <p className="font-medium">{formatCurrency(stats.totalProfit)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bildirimler */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <BellIcon className="h-5 w-5 mr-2" />
              Bildirimler
            </h2>
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Bildirim bulunmuyor</p>
            )}
          </div>
        </div>

        {/* Notlar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Notlar
            </h2>
          </div>
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Yeni not ekle..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                onClick={handleAddNote}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Ekle
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(note.created_at)}</p>
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Not bulunmuyor</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}