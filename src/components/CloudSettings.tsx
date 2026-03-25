import React, { useState, useEffect } from 'react';
import { Cloud, Database, Wifi, WifiOff, RefreshCw, Check, X, AlertTriangle, Key, Globe, Mail, Save, Link } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSync?: string;
}

export default function CloudSettings() {
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

  const handleDisconnect = () => {
    const config = { ...supabaseConfig, isConnected: false };
    setSupabaseConfig(config);
    localStorage.setItem('supabaseConfig', JSON.stringify(config));
    toast.info('Koneksi Supabase terputus.');
  };

  const handleSaveSettings = () => {
    toast.success('Pengaturan cloud berhasil disimpan!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Cloud className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Pengaturan Cloud</h2>
      </div>

      {/* Google Sheets Configuration */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Link className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Google Sheets Integration</h3>
              <p className="text-sm text-muted-foreground">Sinkronisasi data ke Google Sheets</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Link className="w-4 h-4" />
              URL Google Sheets
            </label>
            <input
              type="url"
              value={storeSettings?.appsScriptUrl || ''}
              onChange={(e) => updateStoreSettings({ appsScriptUrl: e.target.value })}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-2">URL Web App dari Google Apps Script untuk sinkronisasi data</p>
          </div>
        </div>
      </div>

      {/* Gmail Configuration */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Gmail Integration</h3>
              <p className="text-sm text-muted-foreground">Email untuk reset password</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Gmail Reset Password
            </label>
            <input
              type="email"
              value={storeSettings?.recoveryEmail || ''}
              onChange={(e) => updateStoreSettings({ recoveryEmail: e.target.value })}
              placeholder="admin@gmail.com"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-2">Email untuk fitur lupa password</p>
          </div>
        </div>
      </div>

      {/* Supabase Configuration */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              supabaseConfig.isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {supabaseConfig.isConnected ? (
                <Database className="w-5 h-5 text-green-600" />
              ) : (
                <Database className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground">Supabase Database</h3>
              <p className="text-sm text-muted-foreground">
                Supabase - {supabaseConfig.isConnected ? 'Terhubung' : 'Tidak Terhubung'}
              </p>
            </div>
            <div className="ml-auto">
              {supabaseConfig.isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                  <span className="text-xs font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-500">
                  <WifiOff className="w-3 h-3" />
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
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
              Supabase Anon Key
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
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Panduan Setup Cloud
            </p>
            <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Google Sheets: Buat Apps Script dan deploy sebagai Web App</li>
              <li>Gmail: Masukkan email admin untuk reset password</li>
              <li>Supabase: Buat project di supabase.com dan copy URL + Anon Key</li>
              <li>Klik "Hubungkan ke Supabase" untuk mengaktifkan sinkronisasi</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSaveSettings} className="flex items-center gap-2 px-6 py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
        <Save className="w-5 h-5" /> Simpan Pengaturan Cloud
      </button>
    </div>
  );
}
