import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSupabaseConfig, supabase } from '@/lib/supabaseClient';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const SupabaseDebug: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [showSecrets, setShowSecrets] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const storeSettings = localStorage.getItem('storeSettings');
      if (storeSettings) {
        const settings = JSON.parse(storeSettings);
        setConfig(settings);
      } else {
        setConfig({ error: 'No storeSettings found' });
      }
    } catch (error) {
      setConfig({ error: 'Failed to parse storeSettings' });
    }
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setTestResults(null);
    
    try {
      console.log('Testing Supabase connection...');
      
      // Test 1: Basic connection
      const { data, error } = await supabase.from('produk').select('count').single();
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        setConnectionStatus('error');
        setTestResults({
          success: false,
          error: error.message,
          details: error
        });
        toast.error(`Koneksi gagal: ${error.message}`);
      } else {
        console.log('Supabase connection successful:', data);
        setConnectionStatus('connected');
        setTestResults({
          success: true,
          data: data,
          message: 'Koneksi berhasil'
        });
        toast.success('Koneksi Supabase berhasil!');
      }
      
      // Test 2: Realtime subscription
      try {
        const channel = supabase
          .channel('test-connection')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'produk' }, 
            (payload) => {
              console.log('Realtime test received:', payload);
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
            if (status === 'SUBSCRIBED') {
              toast.success('Real-time subscription aktif!');
            }
          });
          
        // Cleanup after 5 seconds
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 5000);
        
      } catch (realtimeError) {
        console.error('Realtime test failed:', realtimeError);
        toast.error('Real-time subscription gagal');
      }
      
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Test koneksi gagal');
    }
  };

  const updateConfig = (key: string, value: string) => {
    try {
      const storeSettings = localStorage.getItem('storeSettings');
      const settings = storeSettings ? JSON.parse(storeSettings) : {};
      settings[key] = value;
      localStorage.setItem('storeSettings', JSON.stringify(settings));
      loadConfig();
      toast.success('Konfigurasi diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui konfigurasi');
    }
  };

  const resetConfig = () => {
    localStorage.removeItem('storeSettings');
    setConfig(null);
    setConnectionStatus('idle');
    setTestResults(null);
    toast.success('Konfigurasi direset');
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-yellow-600" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Supabase Connection Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">Status Koneksi</span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Configuration */}
          {config && !config.error && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Supabase URL:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {showSecrets 
                      ? config.supabaseUrl 
                      : config.supabaseUrl ? '***.supabase.co' : 'Not set'
                    }
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Supabase Key:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {showSecrets 
                      ? config.supabaseKey?.substring(0, 20) + '...' 
                      : config.supabaseKey ? '***configured***' : 'Not set'
                    }
                  </code>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Google Apps Script:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {config.appsScriptUrl ? '***configured***' : 'Not set'}
                </code>
              </div>
            </div>
          )}

          {config?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Configuration Error</span>
              </div>
              <p className="text-xs text-red-600 mt-1">{config.error}</p>
            </div>
          )}

          {/* Test Results */}
          {testResults && (
            <div className={`p-3 rounded-lg border ${
              testResults.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {testResults.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  testResults.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  Test Results
                </span>
              </div>
              
              {testResults.success ? (
                <p className="text-xs text-green-600">{testResults.message}</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-red-600 font-medium">Error: {testResults.error}</p>
                  {testResults.details && (
                    <details className="text-xs text-red-500">
                      <summary className="cursor-pointer">View Details</summary>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {JSON.stringify(testResults.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
              {connectionStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={loadConfig}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Config
            </Button>
            
            <Button variant="outline" onClick={resetConfig}>
              <Settings className="w-4 h-4 mr-2" />
              Reset Config
            </Button>
          </div>

          {/* Manual Configuration */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Manual Configuration</h4>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Supabase URL"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={config?.supabaseUrl || ''}
                onChange={(e) => updateConfig('supabaseUrl', e.target.value)}
              />
              
              <input
                type="password"
                placeholder="Supabase Anon Key"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={config?.supabaseKey || ''}
                onChange={(e) => updateConfig('supabaseKey', e.target.value)}
              />
              
              <input
                type="text"
                placeholder="Google Apps Script URL"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={config?.appsScriptUrl || ''}
                onChange={(e) => updateConfig('appsScriptUrl', e.target.value)}
              />
            </div>
          </div>

          {/* Debug Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Debug Information</h4>
            <div className="text-xs space-y-1 bg-muted p-3 rounded">
              <div>Browser: {navigator.userAgent}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
              <div>Local Storage Available: {typeof Storage !== 'undefined' ? 'Yes' : 'No'}</div>
              <div>Store Settings: {localStorage.getItem('storeSettings') ? 'Present' : 'Missing'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDebug;
