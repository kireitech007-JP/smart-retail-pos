import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase, getSupabaseConfig } from './supabaseClient';

// Interface untuk Supabase client
interface SupabaseClient {
  channel: (name: string) => RealtimeChannel;
}

// Interface untuk konfigurasi Supabase
interface SupabaseConfig {
  url: string;
  key: string;
}

// Fungsi untuk membuat Supabase client
const createSupabaseClient = () => {
  const config = getSupabaseConfig();
  const url = config.url || 'https://placeholder.supabase.co';
  const key = config.key || 'placeholder';
  
  // Import Supabase dynamically
  return import('@supabase/supabase-js').then(({ createClient }) => {
    return createClient(url, key);
  });
};

// Fungsi untuk setup real-time subscriptions
export const setupRealtimeSubscriptions = async (
  onDataChange: (table: string, payload: any) => void
) => {
  try {
    const config = getSupabaseConfig();
    
    if (!config.url || !config.key || !config.url.startsWith('http')) {
      console.warn('Supabase not configured correctly, skipping realtime setup');
      return null;
    }

    console.log('Setting up Supabase realtime subscriptions...');
    
    // Subscribe to all table changes
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: '*' },
        (payload) => {
          console.log('Realtime change received:', payload);
          onDataChange(payload.table, payload);
          
          // Show notification for data changes
          const eventType = payload.eventType;
          const tableName = payload.table;
          
          switch (eventType) {
            case 'INSERT':
              toast.success(`Data baru ditambahkan ke ${tableName}`);
              break;
            case 'UPDATE':
              toast.info(`Data diperbarui di ${tableName}`);
              break;
            case 'DELETE':
              toast.warning(`Data dihapus dari ${tableName}`);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active');
          toast.success('Real-time sync aktif');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error');
          toast.error('Gagal mengaktifkan real-time sync');
        } else if (status === 'TIMED_OUT') {
          console.error('Realtime subscription timeout');
          toast.error('Real-time sync timeout');
        } else if (status === 'CLOSED') {
          console.warn('Realtime subscription closed');
          toast.warning('Real-time sync ditutup');
        }
      });

    return channel;
  } catch (error) {
    console.error('Error setting up realtime subscriptions:', error);
    toast.error('Gagal setup real-time subscriptions');
    return null;
  }
};

// Fungsi untuk subscribe ke table spesifik
export const subscribeToTable = async (
  tableName: string,
  callback: (payload: any) => void
) => {
  try {
    const supabase = await createSupabaseClient();
    
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        },
        callback
      )
      .subscribe();

    return channel;
  } catch (error) {
    console.error(`Error subscribing to ${tableName}:`, error);
    return null;
  }
};

// Fungsi untuk unsubscribe
export const unsubscribeFromChannel = (channel: RealtimeChannel | null) => {
  if (channel) {
    supabase.removeChannel(channel);
  }
};

// Fungsi untuk sync data dari Supabase ke localStorage
export const syncDataFromSupabase = async () => {
  try {
    const config = getSupabaseConfig();
    if (!config.url || !config.key) {
      throw new Error('Supabase config not found');
    }

    const tables = [
      'kategori',
      'satuan', 
      'unit',
      'pengguna',
      'produk',
      'transaksi',
      'transaksi_items',
      'piutang',
      'kas_masuk',
      'pengeluaran',
      'sessions'
    ];

    const syncPromises = tables.map(async (table) => {
      try {
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
          // Simpan ke localStorage dengan key yang sesuai
          const localStorageKey = getLocalStorageKey(table);
          localStorage.setItem(localStorageKey, JSON.stringify(data));
          console.log(`Synced ${data.length} records from ${table}`);
        }
      } catch (error) {
        console.error(`Error syncing ${table}:`, error);
      }
    });

    await Promise.all(syncPromises);
    toast.success('Data berhasil disinkronkan dari Supabase');
    
    // Trigger custom event untuk memberitahu komponen lain
    window.dispatchEvent(new CustomEvent('data-synced'));
    
  } catch (error) {
    console.error('Error syncing data from Supabase:', error);
    toast.error('Gagal sinkronisasi data');
  }
};

// Helper function untuk mapping table name ke localStorage key
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

// Fungsi untuk test koneksi realtime
export const testRealtimeConnection = async (): Promise<boolean> => {
  try {
    const supabase = await createSupabaseClient();
    const channel = supabase.channel('test-connection');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      channel
        .on('system', {}, (payload) => {
          clearTimeout(timeout);
          resolve(true);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            resolve(true);
          }
        });
    });
  } catch (error) {
    console.error('Error testing realtime connection:', error);
    return false;
  }
};
