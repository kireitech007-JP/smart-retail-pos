import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';

// Interface untuk Supabase response
interface SupabaseResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Interface untuk backup data
interface BackupData {
  kategori?: any[];
  satuan?: any[];
  produk?: any[];
  pengguna?: any[];
  unit?: any[];
  transaksi?: any[];
  transaksiItems?: any[];
  piutang?: any[];
  kasMasuk?: any[];
  pengeluaran?: any[];
  laporan?: any[];
  sessions?: any[];
}

// Fungsi untuk mendapatkan Supabase config dari settings
const getSupabaseConfig = () => {
  const storeSettings = localStorage.getItem('storeSettings');
  if (storeSettings) {
    const settings = JSON.parse(storeSettings);
    return {
      url: settings.supabaseUrl || '',
      key: settings.supabaseKey || ''
    };
  }
  return { url: '', key: '' };
};

// Fungsi untuk mengirim request ke Supabase
const sendToSupabase = async (action: string, data?: any): Promise<SupabaseResponse> => {
  const config = getSupabaseConfig();
  
  if (!config.url || !config.key) {
    toast.error('URL Supabase atau API Key belum diatur. Silakan atur di halaman Pengaturan.');
    return { success: false, error: 'Supabase config not configured' };
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    toast.success('Data berhasil dikirim ke Supabase Cloud');
    return { success: true, data: result, message: 'Data berhasil dikirim ke Supabase Cloud' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal terhubung ke Supabase: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi untuk mengambil data dari Supabase
const fetchFromSupabase = async (table: string): Promise<SupabaseResponse> => {
  const config = getSupabaseConfig();
  
  if (!config.url || !config.key) {
    toast.error('URL Supabase atau API Key belum diatur. Silakan atur di halaman Pengaturan.');
    return { success: false, error: 'Supabase config not configured' };
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/${table}?select=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    toast.success(`Data ${table} berhasil diambil dari Supabase Cloud`);
    return { success: true, data: result, message: `Data ${table} berhasil diambil` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal mengambil data dari Supabase: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi backup semua data ke Supabase
export const backupAllDataToSupabase = async (data: BackupData): Promise<SupabaseResponse> => {
  const results = [];
  
  // Backup setiap table
  if (data.kategori && data.kategori.length > 0) {
    await sendToSupabase('kategori', data.kategori);
  }
  if (data.satuan && data.satuan.length > 0) {
    await sendToSupabase('satuan', data.satuan);
  }
  if (data.produk && data.produk.length > 0) {
    await sendToSupabase('produk', data.produk);
  }
  if (data.pengguna && data.pengguna.length > 0) {
    await sendToSupabase('pengguna', data.pengguna);
  }
  if (data.unit && data.unit.length > 0) {
    await sendToSupabase('unit', data.unit);
  }
  if (data.transaksi && data.transaksi.length > 0) {
    await sendToSupabase('transaksi', data.transaksi);
  }
  if (data.transaksiItems && data.transaksiItems.length > 0) {
    await sendToSupabase('transaksi_items', data.transaksiItems);
  }
  if (data.piutang && data.piutang.length > 0) {
    await sendToSupabase('piutang', data.piutang);
  }
  if (data.kasMasuk && data.kasMasuk.length > 0) {
    await sendToSupabase('kas_masuk', data.kasMasuk);
  }
  if (data.pengeluaran && data.pengeluaran.length > 0) {
    await sendToSupabase('pengeluaran', data.pengeluaran);
  }
  if (data.sessions && data.sessions.length > 0) {
    await sendToSupabase('sessions', data.sessions);
  }
  
  return { success: true, message: 'Semua data berhasil di-backup ke Supabase Cloud' };
};

// Fungsi restore semua data dari Supabase
export const restoreAllDataFromSupabase = async (): Promise<SupabaseResponse> => {
  const allData: BackupData = {};
  
  // Ambil data dari setiap table
  const kategoriResult = await fetchFromSupabase('kategori');
  if (kategoriResult.success) allData.kategori = kategoriResult.data;
  
  const satuanResult = await fetchFromSupabase('satuan');
  if (satuanResult.success) allData.satuan = satuanResult.data;
  
  const produkResult = await fetchFromSupabase('produk');
  if (produkResult.success) allData.produk = produkResult.data;
  
  const penggunaResult = await fetchFromSupabase('pengguna');
  if (penggunaResult.success) allData.pengguna = penggunaResult.data;
  
  const unitResult = await fetchFromSupabase('unit');
  if (unitResult.success) allData.unit = unitResult.data;
  
  const transaksiResult = await fetchFromSupabase('transaksi');
  if (transaksiResult.success) allData.transaksi = transaksiResult.data;
  
  const transaksiItemsResult = await fetchFromSupabase('transaksi_items');
  if (transaksiItemsResult.success) allData.transaksiItems = transaksiItemsResult.data;
  
  const piutangResult = await fetchFromSupabase('piutang');
  if (piutangResult.success) allData.piutang = piutangResult.data;
  
  const kasMasukResult = await fetchFromSupabase('kas_masuk');
  if (kasMasukResult.success) allData.kasMasuk = kasMasukResult.data;
  
  const pengeluaranResult = await fetchFromSupabase('pengeluaran');
  if (pengeluaranResult.success) allData.pengeluaran = pengeluaranResult.data;
  
  const sessionsResult = await fetchFromSupabase('sessions');
  if (sessionsResult.success) allData.sessions = sessionsResult.data;
  
  // Simpan data ke localStorage
  localStorage.setItem('supabase_backup_data', JSON.stringify(allData));
  
  return { success: true, data: allData, message: 'Semua data berhasil di-restore dari Supabase Cloud' };
};

// Fungsi backup individual
export const backupKategoriToSupabase = async (kategori: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('kategori', kategori);
};

export const backupSatuanToSupabase = async (satuan: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('satuan', satuan);
};

export const backupProdukToSupabase = async (produk: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('produk', produk);
};

export const backupPenggunaToSupabase = async (pengguna: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('pengguna', pengguna);
};

export const backupUnitToSupabase = async (unit: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('unit', unit);
};

export const backupTransaksiToSupabase = async (transaksi: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('transaksi', transaksi);
};

export const backupTransaksiItemsToSupabase = async (items: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('transaksi_items', items);
};

export const backupPiutangToSupabase = async (piutang: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('piutang', piutang);
};

export const backupKasMasukToSupabase = async (kasMasuk: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('kas_masuk', kasMasuk);
};

export const backupPengeluaranToSupabase = async (pengeluaran: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('pengeluaran', pengeluaran);
};

export const backupSessionsToSupabase = async (sessions: any[]): Promise<SupabaseResponse> => {
  return sendToSupabase('sessions', sessions);
};

// Fungsi restore individual
export const restoreKategoriFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('kategori');
};

export const restoreSatuanFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('satuan');
};

export const restoreProdukFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('produk');
};

export const restorePenggunaFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('pengguna');
};

export const restoreUnitFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('unit');
};

export const restoreTransaksiFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('transaksi');
};

export const restoreTransaksiItemsFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('transaksi_items');
};

export const restorePiutangFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('piutang');
};

export const restoreKasMasukFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('kas_masuk');
};

export const restorePengeluaranFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('pengeluaran');
};

export const restoreSessionsFromSupabase = async (): Promise<SupabaseResponse> => {
  return fetchFromSupabase('sessions');
};

// Fungsi test koneksi Supabase
export const testSupabaseConnection = async (): Promise<SupabaseResponse> => {
  const config = getSupabaseConfig();
  
  if (!config.url || !config.key) {
    toast.error('URL Supabase atau API Key belum diatur. Silakan atur di halaman Pengaturan.');
    return { success: false, error: 'Supabase config not configured' };
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`
      }
    });

    if (response.ok) {
      toast.success('Koneksi Supabase berhasil!');
      return { success: true, message: 'Koneksi Supabase berhasil!' };
    } else {
      throw new Error(`Connection failed: ${response.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal terhubung ke Supabase: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};
