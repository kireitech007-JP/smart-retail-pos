import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Settings, Store, Link, Mail, Save, Download, Upload, Database, TestTube, Trash2, Cloud, CloudOff } from 'lucide-react';
import { toast } from 'sonner';
import { 
  backupAllData, 
  restoreAllData, 
  testConnection, 
  clearAllData,
  backupKategori,
  backupSatuan,
  backupProduk,
  backupPengguna,
  backupUnit,
  backupTransaksi,
  backupTransaksiItems,
  backupPiutang,
  backupKasMasuk,
  backupPengeluaran,
  backupLaporan,
  backupSessions
} from '@/lib/googleSheets';
import {
  backupAllDataToSupabase,
  restoreAllDataFromSupabase,
  testSupabaseConnection,
  backupKategoriToSupabase,
  backupSatuanToSupabase,
  backupProdukToSupabase,
  backupPenggunaToSupabase,
  backupUnitToSupabase,
  backupTransaksiToSupabase,
  backupTransaksiItemsToSupabase,
  backupPiutangToSupabase,
  backupKasMasukToSupabase,
  backupPengeluaranToSupabase,
  backupSessionsToSupabase
} from '@/lib/supabaseBackup';

export default function AdminSettings() {
  const { storeSettings, updateStoreSettings, kategori, satuan, produk, pengguna, unit, transactions, debts, kasMasuk, pengeluaran, sessions } = useApp();
  const [form, setForm] = useState(storeSettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    updateStoreSettings(form);
    toast.success('Pengaturan berhasil disimpan');
  };

  const handleBackupAll = async () => {
    setIsLoading(true);
    try {
      const backupData = {
        kategori,
        satuan,
        produk,
        pengguna,
        unit,
        transaksi: transactions,
        transaksiItems: transactions.flatMap(tx => tx.items || []),
        piutang: debts,
        kasMasuk,
        pengeluaran,
        laporan: [],
        sessions
      };
      await backupAllData(backupData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAll = async () => {
    if (!confirm('Apakah Anda yakin ingin restore semua data? Data yang ada akan ditimpat!')) {
      return;
    }
    setIsLoading(true);
    try {
      await restoreAllData();
      toast.success('Data berhasil di-restore. Silakan refresh halaman.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      await testConnection();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua data di Google Sheets? Tindakan ini tidak dapat dibatalkan!')) {
      return;
    }
    setIsLoading(true);
    try {
      await clearAllData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupIndividual = async (type: string, data: any[], backupFn: any) => {
    setIsLoading(true);
    try {
      await backupFn(data);
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase functions
  const handleBackupAllToSupabase = async () => {
    setIsLoading(true);
    try {
      const backupData = {
        kategori,
        satuan,
        produk,
        pengguna,
        unit,
        transaksi: transactions,
        transaksiItems: transactions.flatMap(tx => tx.items || []),
        piutang: debts,
        kasMasuk,
        pengeluaran,
        laporan: [],
        sessions
      };
      await backupAllDataToSupabase(backupData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAllFromSupabase = async () => {
    if (!confirm('Apakah Anda yakin ingin restore semua data dari Supabase Cloud? Data yang ada akan ditimpat!')) {
      return;
    }
    setIsLoading(true);
    try {
      await restoreAllDataFromSupabase();
      toast.success('Data berhasil di-restore dari Supabase Cloud. Silakan refresh halaman.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSupabaseConnection = async () => {
    setIsLoading(true);
    try {
      await testSupabaseConnection();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupIndividualToSupabase = async (type: string, data: any[], backupFn: any) => {
    setIsLoading(true);
    try {
      await backupFn(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Store className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Informasi Toko</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Nama Toko</label>
            <input value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Nomor Telepon</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+62..."
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Alamat</label>
            <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={3}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Link className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Integrasi Google Sheets</h3>
        </div>
        <div className="p-6">
          <label className="text-sm font-medium text-foreground mb-1 block">Apps Script URL</label>
          <input value={form.appsScriptUrl} onChange={e => setForm(f => ({ ...f, appsScriptUrl: e.target.value }))} 
            placeholder="https://script.google.com/macros/s/..."
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <p className="text-xs text-muted-foreground mt-2">URL Web App dari Google Apps Script untuk sinkronisasi data</p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Cloud className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Integrasi Supabase Cloud</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Supabase URL</label>
            <input value={form.supabaseUrl} onChange={e => setForm(f => ({ ...f, supabaseUrl: e.target.value }))} 
              placeholder="https://your-project.supabase.co"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            <p className="text-xs text-muted-foreground mt-2">URL project Supabase Anda</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Supabase API Key</label>
            <input value={form.supabaseKey} onChange={e => setForm(f => ({ ...f, supabaseKey: e.target.value }))} 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            <p className="text-xs text-muted-foreground mt-2">API Key anonim dari project Supabase</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Integrasi Email</h3>
        </div>
        <div className="p-6">
          <label className="text-sm font-medium text-foreground mb-1 block">Email Pemulihan (Gmail)</label>
          <input value={form.recoveryEmail} onChange={e => setForm(f => ({ ...f, recoveryEmail: e.target.value }))} 
            placeholder="admin@gmail.com" type="email"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <p className="text-xs text-muted-foreground mt-2">Email untuk fitur lupa password</p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Cloud className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Backup & Restore Supabase Cloud</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleBackupAllToSupabase} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <Cloud className="w-4 h-4" />
              {isLoading ? 'Mengirim...' : 'Kirim ke Cloud'}
            </button>
            <button 
              onClick={handleRestoreAllFromSupabase} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <CloudOff className="w-4 h-4" />
              {isLoading ? 'Mengambil...' : 'Tarik dari Cloud'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleTestSupabaseConnection} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              <TestTube className="w-4 h-4" />
              {isLoading ? 'Menguji...' : 'Test Koneksi Cloud'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Cloud className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Backup Cloud Individual</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button 
              onClick={() => handleBackupIndividualToSupabase('kategori', kategori, backupKategoriToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Kategori
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('satuan', satuan, backupSatuanToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Satuan
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('produk', produk, backupProdukToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Produk
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('pengguna', pengguna, backupPenggunaToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Pengguna
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('unit', unit, backupUnitToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Unit
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('transaksi', transactions, backupTransaksiToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Transaksi
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('piutang', debts, backupPiutangToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Piutang
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('kasMasuk', kasMasuk, backupKasMasukToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Kas Masuk
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('pengeluaran', pengeluaran, backupPengeluaranToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Pengeluaran
            </button>
            <button 
              onClick={() => handleBackupIndividualToSupabase('sessions', sessions, backupSessionsToSupabase)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Cloud className="w-3 h-3" />
              Sessions
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
        <Save className="w-5 h-5" /> Simpan Pengaturan
      </button>
    </div>
  );
}
