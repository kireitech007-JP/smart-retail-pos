import React, { useState, useEffect } from 'react';
import { Cloud, Database, Wifi, WifiOff, RefreshCw, Check, X, AlertTriangle, Settings, Key, Globe } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSync?: string;
}

export default function Settings() {
  console.log('Settings component mounted');
  const { storeSettings, updateStoreSettings } = useApp();
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load saved Supabase config from localStorage
    const savedConfig = localStorage.getItem('supabaseConfig');
    if (savedConfig) {
      setSupabaseConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSaveConfig = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      toast.error('URL dan Anon Key Supabase harus diisi!');
      return;
    }

    setIsConnecting(true);
    setSyncStatus('syncing');

    try {
      // Test connection to Supabase
      const response = await fetch(`${supabaseConfig.url}/rest/v1/`, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`
        }
      });

      if (response.ok) {
        const config = { ...supabaseConfig, isConnected: true, lastSync: new Date().toISOString() };
        setSupabaseConfig(config);
        localStorage.setItem('supabaseConfig', JSON.stringify(config));
        toast.success('Koneksi Supabase berhasil!');
        setSyncStatus('success');
        
        // Initialize Supabase tables
        await initializeSupabaseTables();
      } else {
        throw new Error('Koneksi gagal');
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
      toast.error('Koneksi Supabase gagal! Periksa URL dan API Key.');
      setSyncStatus('error');
      setSupabaseConfig(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsConnecting(false);
    }
  };

  const initializeSupabaseTables = async () => {
    // This would create necessary tables in Supabase
    // In a real implementation, you would use Supabase client or SQL
    console.log('Initializing Supabase tables...');
  };

  const handleSyncToCloud = async () => {
    if (!supabaseConfig.isConnected) {
      toast.error('Hubungkan ke Supabase terlebih dahulu!');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // Get all data from localStorage
      const appData = {
        storeSettings: localStorage.getItem('storeSettings'),
        products: localStorage.getItem('products'),
        units: localStorage.getItem('units'),
        users: localStorage.getItem('users'),
        transactions: localStorage.getItem('transactions'),
        cashierSessions: localStorage.getItem('cashierSessions'),
        expenses: localStorage.getItem('expenses'),
        debts: localStorage.getItem('debts'),
        cashIns: localStorage.getItem('cashIns')
      };

      // Sync to Supabase
      const response = await fetch(`${supabaseConfig.url}/rest/v1/app_data`, {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'main_config',
          data: appData,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        const config = { ...supabaseConfig, lastSync: new Date().toISOString() };
        setSupabaseConfig(config);
        localStorage.setItem('supabaseConfig', JSON.stringify(config));
        toast.success('Data berhasil disinkronkan ke cloud!');
        setSyncStatus('success');
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sinkronisasi gagal!');
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFromCloud = async () => {
    if (!supabaseConfig.isConnected) {
      toast.error('Hubungkan ke Supabase terlebih dahulu!');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // Get data from Supabase
      const response = await fetch(`${supabaseConfig.url}/rest/v1/app_data?id=eq.main_config`, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const cloudData = data[0].data;
          
          // Restore data to localStorage
          Object.keys(cloudData).forEach(key => {
            if (cloudData[key]) {
              localStorage.setItem(key, cloudData[key]);
            }
          });

          toast.success('Data berhasil diunduh dari cloud!');
          setSyncStatus('success');
          
          // Reload page to apply changes
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          toast.info('Tidak ada data di cloud. Sinkronkan data terlebih dahulu.');
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Pengunduhan data gagal!');
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    const config = { ...supabaseConfig, isConnected: false };
    setSupabaseConfig(config);
    localStorage.setItem('supabaseConfig', JSON.stringify(config));
    toast.info('Koneksi Supabase terputus.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Pengaturan</h2>
      </div>

      {/* Cloud Sync Settings */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              supabaseConfig.isConnected ? 'bg-success/10' : 'bg-muted'
            }`}>
              {supabaseConfig.isConnected ? (
                <Cloud className="w-5 h-5 text-success" />
              ) : (
                <Cloud className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground">Sinkronisasi Cloud</h3>
              <p className="text-sm text-muted-foreground">
                Supabase - {supabaseConfig.isConnected ? 'Terhubung' : 'Tidak Terhubung'}
              </p>
            </div>
            <div className="ml-auto">
              {supabaseConfig.isConnected ? (
                <div className="flex items-center gap-1 text-success">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-xs font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <WifiOff className="w-3 h-3" />
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Supabase Configuration */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Supabase URL
              </label>
              <input
                type="url"
                value={supabaseConfig.url}
                onChange={(e) => setSupabaseConfig(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={supabaseConfig.isConnected}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Anon Key
              </label>
              <input
                type="password"
                value={supabaseConfig.anonKey}
                onChange={(e) => setSupabaseConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={supabaseConfig.isConnected}
              />
            </div>

            {!supabaseConfig.isConnected ? (
              <button
                onClick={handleSaveConfig}
                disabled={isConnecting || !supabaseConfig.url || !supabaseConfig.anonKey}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4" />
                    Hubungkan ke Supabase
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="w-full py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2"
              >
                <WifiOff className="w-4 h-4" />
                Putuskan Koneksi
              </button>
            )}
          </div>

          {/* Sync Actions */}
          {supabaseConfig.isConnected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Sinkronisasi Terakhir</p>
                  <p className="text-xs text-muted-foreground">
                    {supabaseConfig.lastSync 
                      ? new Date(supabaseConfig.lastSync).toLocaleString('id-ID')
                      : 'Belum pernah sinkronisasi'
                    }
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  syncStatus === 'success' ? 'bg-success/10' : 
                  syncStatus === 'error' ? 'bg-destructive/10' : 
                  syncStatus === 'syncing' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {syncStatus === 'success' ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : syncStatus === 'error' ? (
                    <X className="w-4 h-4 text-destructive" />
                  ) : syncStatus === 'syncing' ? (
                    <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSyncToCloud}
                  disabled={isSyncing}
                  className="py-2.5 bg-info text-info-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  Upload ke Cloud
                </button>
                <button
                  onClick={handleSyncFromCloud}
                  disabled={isSyncing}
                  className="py-2.5 bg-warning text-warning-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Download dari Cloud
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Cara Setup Supabase
                </p>
                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Buat akun di <a href="https://supabase.com" target="_blank" rel="noopener" className="underline">supabase.com</a></li>
                  <li>Buat project baru</li>
                  <li>Copy Project URL dan Anon Key dari Settings → API</li>
                  <li>Masukkan URL dan Anon Key di form di atas</li>
                  <li>Klik "Hubungkan ke Supabase"</li>
                  <li>Upload/download data untuk sinkronisasi</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Settings */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-foreground">Pengaturan Toko</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Nama Toko</label>
            <input
              type="text"
              value={storeSettings?.storeName || ''}
              onChange={(e) => updateStoreSettings({ storeName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nama Toko"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Alamat</label>
            <textarea
              value={storeSettings?.address || ''}
              onChange={(e) => updateStoreSettings({ address: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Alamat Toko"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Telepon</label>
            <input
              type="tel"
              value={storeSettings?.phone || ''}
              onChange={(e) => updateStoreSettings({ phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nomor Telepon"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
