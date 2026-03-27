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

      <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
        <Save className="w-5 h-5" /> Simpan Pengaturan
      </button>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Backup & Restore Google Sheets</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleBackupAll} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              {isLoading ? 'Membackup...' : 'Backup Semua Data'}
            </button>
            <button 
              onClick={handleRestoreAll} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {isLoading ? 'Mengembalikan...' : 'Restore Semua Data'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleTestConnection} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              <TestTube className="w-4 h-4" />
              {isLoading ? 'Menguji...' : 'Test Koneksi'}
            </button>
            <button 
              onClick={handleClearData} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isLoading ? 'Menghapus...' : 'Hapus Data Sheets'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Backup Data Individual</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button 
              onClick={() => handleBackupIndividual('kategori', kategori, backupKategori)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Kategori
            </button>
            <button 
              onClick={() => handleBackupIndividual('satuan', satuan, backupSatuan)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Satuan
            </button>
            <button 
              onClick={() => handleBackupIndividual('produk', produk, backupProduk)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Produk
            </button>
            <button 
              onClick={() => handleBackupIndividual('pengguna', pengguna, backupPengguna)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Pengguna
            </button>
            <button 
              onClick={() => handleBackupIndividual('unit', unit, backupUnit)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Unit
            </button>
            <button 
              onClick={() => handleBackupIndividual('transaksi', transactions, backupTransaksi)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Transaksi
            </button>
            <button 
              onClick={() => handleBackupIndividual('piutang', debts, backupPiutang)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Piutang
            </button>
            <button 
              onClick={() => handleBackupIndividual('kasMasuk', kasMasuk, backupKasMasuk)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Kas Masuk
            </button>
            <button 
              onClick={() => handleBackupIndividual('pengeluaran', pengeluaran, backupPengeluaran)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Pengeluaran
            </button>
            <button 
              onClick={() => handleBackupIndividual('sessions', sessions, backupSessions)} 
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="w-3 h-3" />
              Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
