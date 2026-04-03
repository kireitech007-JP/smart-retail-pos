import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  setupRealtimeSubscriptions, 
  syncDataFromSupabase, 
  testRealtimeConnection,
  unsubscribeFromChannel 
} from '@/lib/supabaseRealtime';
import { getSupabaseConfig } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';

// Helper function to map Supabase table names to localStorage keys
const getLocalStorageKey = (table: string): string => {
  const keyMap: { [key: string]: string } = {
    'kategori': 'categories',
    'satuan': 'units',
    'unit': 'storeUnits',
    'pengguna': 'users',
    'produk': 'products',
    'transaksi': 'transactions',
    'transaksi_items': 'transactionItems',
    'piutang': 'debts',
    'kas_masuk': 'cashIn',
    'pengeluaran': 'expenses',
    'sessions': 'sessions'
  };
  
  return keyMap[table] || table;
};

interface UseSupabaseRealtimeOptions {
  enableAutoSync?: boolean;
  syncInterval?: number;
  tables?: string[];
}

export const useSupabaseRealtime = (options: UseSupabaseRealtimeOptions = {}) => {
  const {
    enableAutoSync = true,
    syncInterval = 30000, // 30 seconds
    tables = []
  } = options;

  const { setProducts, setTransactions, setDebts, setExpenses, setCashIn } = useApp();
  const channelRef = useRef<any>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle data changes from realtime subscriptions
  const handleDataChange = useCallback(async (table: string, payload: any) => {
    console.log(`Realtime change in ${table}:`, payload);

    try {
      // Sync data dari Supabase untuk table yang berubah
      const config = getSupabaseConfig();
      if (!config.url || !config.key) return;

      const response = await fetch(`${config.url}/rest/v1/${table}?select=*`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const localStorageKey = getLocalStorageKey(table);
        localStorage.setItem(localStorageKey, JSON.stringify(data));

        // Update state di AppContext berdasarkan table
        switch (table) {
          case 'produk':
            setProducts(data);
            break;
          case 'transaksi':
            setTransactions(data);
            break;
          case 'piutang':
            setDebts(data);
            break;
          case 'pengeluaran':
            setExpenses(data);
            break;
          case 'kas_masuk':
            setCashIn(data);
            break;
        }

        // Trigger custom event untuk komponen lain
        window.dispatchEvent(new CustomEvent('data-changed', { 
          detail: { table, data, payload } 
        }));
      }
    } catch (error) {
      console.error(`Error handling realtime change for ${table}:`, error);
      toast.error(`Gagal memperbarui data ${table}`);
    }
  }, [setProducts, setTransactions, setDebts, setExpenses, setCashIn]);

  // Setup realtime subscriptions
  const setupRealtime = useCallback(async () => {
    try {
      // Test koneksi dulu
      const isConnected = await testRealtimeConnection();
      if (!isConnected) {
        toast.error('Tidak dapat terhubung ke Supabase Realtime');
        return;
      }

      // Setup subscriptions
      const channel = await setupRealtimeSubscriptions(handleDataChange);
      if (channel) {
        channelRef.current = channel;
        console.log('Realtime subscriptions setup complete');
      }
    } catch (error) {
      console.error('Error setting up realtime:', error);
      toast.error('Gagal setup real-time subscriptions');
    }
  }, [handleDataChange]);

  // Setup periodic sync sebagai fallback
  const setupPeriodicSync = useCallback(() => {
    if (!enableAutoSync) return;

    syncIntervalRef.current = setInterval(async () => {
      try {
        await syncDataFromSupabase();
        console.log('Periodic sync completed');
      } catch (error) {
        console.error('Error in periodic sync:', error);
      }
    }, syncInterval);
  }, [enableAutoSync, syncInterval]);

  // Manual sync function
  const manualSync = useCallback(async () => {
    try {
      await syncDataFromSupabase();
      toast.success('Data berhasil disinkronkan secara manual');
      
      // Refresh data di state
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const debts = JSON.parse(localStorage.getItem('debts') || '[]');
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const cashIn = JSON.parse(localStorage.getItem('cashIn') || '[]');

      setProducts(products);
      setTransactions(transactions);
      setDebts(debts);
      setExpenses(expenses);
      setCashIn(cashIn);
    } catch (error) {
      console.error('Error in manual sync:', error);
      toast.error('Gagal sinkronisasi manual');
    }
  }, [setProducts, setTransactions, setDebts, setExpenses, setCashIn]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Check if Supabase is configured
      const config = getSupabaseConfig();
      if (!config.url || !config.key) {
        console.warn('Supabase not configured, skipping realtime setup');
        return;
      }

      // Setup realtime subscriptions
      await setupRealtime();

      // Setup periodic sync
      setupPeriodicSync();

      // Initial sync
      await syncDataFromSupabase();
    };

    init();

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [setupRealtime, setupPeriodicSync]);

  // Listen for custom events
  useEffect(() => {
    const handleDataSynced = () => {
      // Refresh semua state dari localStorage
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const debts = JSON.parse(localStorage.getItem('debts') || '[]');
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const cashIn = JSON.parse(localStorage.getItem('cashIn') || '[]');

      setProducts(products);
      setTransactions(transactions);
      setDebts(debts);
      setExpenses(expenses);
      setCashIn(cashIn);
    };

    window.addEventListener('data-synced', handleDataSynced);
    window.addEventListener('data-changed', handleDataSynced);

    return () => {
      window.removeEventListener('data-synced', handleDataSynced);
      window.removeEventListener('data-changed', handleDataSynced);
    };
  }, [setProducts, setTransactions, setDebts, setExpenses, setCashIn]);

  return {
    manualSync,
    isConnected: !!channelRef.current,
    setupRealtime,
    unsubscribe: () => {
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }
  };
};
