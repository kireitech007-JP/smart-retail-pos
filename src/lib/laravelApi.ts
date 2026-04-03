const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Generic fetch wrapper for Laravel API
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Request failed: ${response.statusText}`);
  }

  return response.json();
}

// --- Kategori ---
export const fetchKategori = () => request<any[]>('kategori');
export const createKategori = (data: any) => request<any>('kategori', { method: 'POST', body: JSON.stringify(data) });
export const updateKategori = (id: string, data: any) => request<any>(`kategori/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteKategori = (id: string) => request<any>(`kategori/${id}`, { method: 'DELETE' });

// --- Satuan ---
export const fetchSatuan = () => request<any[]>('satuan');
export const createSatuan = (data: any) => request<any>('satuan', { method: 'POST', body: JSON.stringify(data) });
export const updateSatuan = (id: string, data: any) => request<any>(`satuan/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSatuan = (id: string) => request<any>(`satuan/${id}`, { method: 'DELETE' });

// --- Unit ---
export const fetchUnit = () => request<any[]>('unit');
export const createUnit = (data: any) => request<any>('unit', { method: 'POST', body: JSON.stringify(data) });
export const updateUnit = (id: string, data: any) => request<any>(`unit/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUnit = (id: string) => request<any>(`unit/${id}`, { method: 'DELETE' });

// --- Produk ---
export const fetchProduk = () => request<any[]>('produk');
export const createProduk = (data: any) => request<any>('produk', { method: 'POST', body: JSON.stringify(data) });
export const updateProduk = (id: string, data: any) => request<any>(`produk/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduk = (id: string) => request<any>(`produk/${id}`, { method: 'DELETE' });

// --- Transaksi ---
export const fetchTransaksi = () => request<any[]>('transaksi');
export const createTransaksi = (data: any) => request<any>('transaksi', { method: 'POST', body: JSON.stringify(data) });

// --- Piutang ---
export const fetchPiutang = () => request<any[]>('piutang');
export const createPiutang = (data: any) => request<any>('piutang', { method: 'POST', body: JSON.stringify(data) });
export const updatePiutang = (id: string, data: any) => request<any>(`piutang/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// --- Kas Masuk ---
export const fetchKasMasuk = () => request<any[]>('kas-masuk');
export const createKasMasuk = (data: any) => request<any>('kas-masuk', { method: 'POST', body: JSON.stringify(data) });

// --- Pengeluaran ---
export const fetchPengeluaran = () => request<any[]>('pengeluaran');
export const createPengeluaran = (data: any) => request<any>('pengeluaran', { method: 'POST', body: JSON.stringify(data) });

// --- Sessions ---
export const fetchSessions = () => request<any[]>('sessions');
export const createSession = (data: any) => request<any>('sessions', { method: 'POST', body: JSON.stringify(data) });
export const updateSession = (id: string, data: any) => request<any>(`sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// --- Laporan ---
export const fetchLaporan = () => request<any[]>('laporan');
export const createLaporan = (data: any) => request<any>('laporan', { method: 'POST', body: JSON.stringify(data) });
