import { toast } from 'sonner';

// Interface untuk Google Sheets response
interface GoogleSheetsResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  debug?: any;
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

// Fungsi untuk mendapatkan Apps Script URL dari settings
const getAppsScriptUrl = (): string => {
  const storeSettings = localStorage.getItem('storeSettings');
  if (storeSettings) {
    const settings = JSON.parse(storeSettings);
    return settings.appsScriptUrl || '';
  }
  return '';
};

// Fungsi untuk mengirim request ke Google Apps Script
const sendToGoogleSheets = async (action: string, data?: any): Promise<GoogleSheetsResponse> => {
  const appsScriptUrl = getAppsScriptUrl();
  
  if (!appsScriptUrl) {
    toast.error('URL Google Apps Script belum diatur. Silakan atur di halaman Pengaturan.');
    return { success: false, error: 'Apps Script URL not configured' };
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      toast.success(result.message || 'Operasi berhasil');
      return result;
    } else {
      toast.error(result.error || 'Operasi gagal');
      return result;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal terhubung ke Google Sheets: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi backup semua data
export const backupAllData = async (data: BackupData): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupAllData', data);
};

// Fungsi backup data individual
export const backupKategori = async (kategori: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupKategori', { kategori });
};

export const backupSatuan = async (satuan: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupSatuan', { satuan });
};

export const backupProduk = async (produk: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupProduk', { produk });
};

export const backupPengguna = async (pengguna: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupPengguna', { pengguna });
};

export const backupUnit = async (unit: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupUnit', { unit });
};

export const backupTransaksi = async (transaksi: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupTransaksi', { transaksi });
};

export const backupTransaksiItems = async (items: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupTransaksiItems', { items });
};

export const backupPiutang = async (piutang: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupPiutang', { piutang });
};

export const backupKasMasuk = async (kasMasuk: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupKasMasuk', { kasMasuk });
};

export const backupStockHistory = async (stockHistory: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupStockHistory', { stockHistory });
};

export const backupPengeluaran = async (pengeluaran: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupPengeluaran', { pengeluaran });
};

export const backupLaporan = async (laporan: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupLaporan', { laporan });
};

export const backupSessions = async (sessions: any[]): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('backupSessions', { sessions });
};

// Fungsi restore data
export const restoreAllData = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('restoreAllData');
};

export const getKategori = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getKategori');
};

export const getSatuan = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getSatuan');
};

export const getProduk = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getProduk');
};

export const getPengguna = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getPengguna');
};

export const getUnit = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getUnit');
};

export const getTransaksi = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getTransaksi');
};

export const getPiutang = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getPiutang');
};

export const getKasMasuk = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getKasMasuk');
};

export const getPengeluaran = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getPengeluaran');
};

export const getLaporan = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getLaporan');
};

export const getSessions = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('getSessions');
};

// Fungsi test koneksi
export const testConnection = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('testBackupConnection');
};

// Fungsi clear data (untuk testing)
export const clearAllData = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('clearAllData');
};

// Fungsi debug request
export const debugRequest = async (data: any): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets('debugRequest', data);
};

// Fungsi auto-sync data ke Google Sheets (tombol sheet)
export const autoSyncToSheets = async (): Promise<GoogleSheetsResponse> => {
  try {
    // Ambil semua data dari localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const debts = JSON.parse(localStorage.getItem('debts') || '[]');
    const cashIn = JSON.parse(localStorage.getItem('cashIn') || '[]');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const units = JSON.parse(localStorage.getItem('units') || '[]');
    const storeUnits = JSON.parse(localStorage.getItem('storeUnits') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');

    const allData = {
      products,
      transactions,
      debts,
      cashIn,
      expenses,
      categories,
      units,
      storeUnits,
      users,
      sessions
    };

    return sendToGoogleSheets('autoSyncAllData', allData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal auto-sync: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi sync data spesifik ke Google Sheets
export const syncDataToSheets = async (dataType: string, data: any[]): Promise<GoogleSheetsResponse> => {
  try {
    const payload = {
      type: dataType,
      data: data
    };

    return sendToGoogleSheets('syncSpecificData', payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal sync ${dataType}: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi sync transaksi real-time
export const syncTransactionToSheets = async (transaction: any): Promise<GoogleSheetsResponse> => {
  try {
    return sendToGoogleSheets('syncTransaction', { transaction });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal sync transaksi: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi sync produk real-time
export const syncProductToSheets = async (product: any): Promise<GoogleSheetsResponse> => {
  try {
    return sendToGoogleSheets('syncProduct', { product });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal sync produk: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi sync piutang real-time
export const syncDebtToSheets = async (debt: any): Promise<GoogleSheetsResponse> => {
  try {
    return sendToGoogleSheets('syncDebt', { debt });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal sync piutang: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi sync kas masuk real-time
export const syncCashInToSheets = async (cashIn: any): Promise<GoogleSheetsResponse> => {
  try {
    return sendToGoogleSheets('syncCashIn', { cashIn });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal sync kas masuk: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

// Fungsi sync pengeluaran real-time
export const syncExpenseToSheets = async (expense: any): Promise<GoogleSheetsResponse> => {
  try {
    return sendToGoogleSheets('syncExpense', { expense });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(`Gagal sync pengeluaran: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};
