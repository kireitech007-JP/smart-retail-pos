import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Upload,
  Database,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { 
  autoSyncToSheets, 
  syncTransactionToSheets,
  syncProductToSheets,
  syncDebtToSheets,
  syncCashInToSheets,
  syncExpenseToSheets,
  testConnection
} from '@/lib/googleSheets';

interface SheetSyncButtonProps {
  mode?: 'auto' | 'transaction' | 'product' | 'debt' | 'cashin' | 'expense';
  data?: any;
  className?: string;
  showStatus?: boolean;
  openSheetAfterSync?: boolean;
}

const SheetSyncButton: React.FC<SheetSyncButtonProps> = ({ 
  mode = 'auto', 
  data, 
  className = '',
  showStatus = true,
  openSheetAfterSync = false
}) => {
  const { storeSettings } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');

  const handleOpenSheet = () => {
    if (storeSettings.spreadsheetUrl) {
      window.open(storeSettings.spreadsheetUrl, '_blank');
    } else {
      toast.error('URL Spreadsheet belum diatur di Pengaturan');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      let result;
      
      switch (mode) {
        case 'auto':
          result = await autoSyncToSheets();
          break;
        case 'transaction':
          if (!data) {
            toast.error('Data transaksi tidak tersedia');
            return;
          }
          result = await syncTransactionToSheets(data);
          break;
        case 'product':
          if (!data) {
            toast.error('Data produk tidak tersedia');
            return;
          }
          result = await syncProductToSheets(data);
          break;
        case 'debt':
          if (!data) {
            toast.error('Data piutang tidak tersedia');
            return;
          }
          result = await syncDebtToSheets(data);
          break;
        case 'cashin':
          if (!data) {
            toast.error('Data kas masuk tidak tersedia');
            return;
          }
          result = await syncCashInToSheets(data);
          break;
        case 'expense':
          if (!data) {
            toast.error('Data pengeluaran tidak tersedia');
            return;
          }
          result = await syncExpenseToSheets(data);
          break;
        default:
          result = await autoSyncToSheets();
      }
      
      if (result.success) {
        setLastSync(new Date());
        toast.success(result.message || 'Data berhasil di-sync ke Google Sheets');
        
        if (openSheetAfterSync) {
          handleOpenSheet();
        }
      } else {
        toast.error(result.error || 'Gagal sync data');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const result = await testConnection();
      if (result.success) {
        setConnectionStatus('connected');
        toast.success('Koneksi Google Sheets berhasil');
      } else {
        setConnectionStatus('error');
        toast.error('Gagal terhubung ke Google Sheets');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Error testing koneksi');
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'auto': return 'Sync All Data';
      case 'transaction': return 'Sync Transaksi';
      case 'product': return 'Sync Produk';
      case 'debt': return 'Sync Piutang';
      case 'cashin': return 'Sync Kas Masuk';
      case 'expense': return 'Sync Pengeluaran';
      default: return 'Sync to Sheets';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'auto': return FileSpreadsheet;
      case 'transaction': return Database;
      case 'product': return Upload;
      case 'debt': return Database;
      case 'cashin': return Database;
      case 'expense': return Database;
      default: return FileSpreadsheet;
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  const StatusIcon = getModeIcon();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSync} 
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          {isSyncing ? 'Syncing...' : 'Sync to Sheets'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenSheet}
          className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <ExternalLink className="w-4 h-4" />
          Open Sheets
        </Button>
      </div>
      
      {showStatus && lastSync && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Last sync: {lastSync.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default SheetSyncButton;
