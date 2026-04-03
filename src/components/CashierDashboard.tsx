import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah, formatDateTime, isToday } from '@/lib/format';
import { 
  Wallet, DollarSign, CreditCard, TrendingUp, TrendingDown, 
  Receipt, Users, Calendar, Search, Eye, EyeOff, RefreshCw,
  Download, FileText, Printer, MessageSquare, Cloud
} from 'lucide-react';
import { toast } from 'sonner';
import ExportButtons from '@/components/ExportButtons';
import PrintButtons from '@/components/PrintButtons';

import { 
  backupAllData, 
  backupTransaksi,
  backupKasMasuk,
  backupPengeluaran,
  backupPiutang
} from '@/lib/googleSheets';

export default function CashierDashboard() {
  const { 
    currentUser, units, transactions, expenses, debts, payDebt, 
    openCashierSession, closeCashierSession, getActiveSession, cashierSessions,
    cashIns, getProductStock, products, storeSettings, stockHistory
  } = useApp();

  const [openingCash, setOpeningCash] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const activeSession = currentUser ? getActiveSession(currentUser.id) : null;
  const userUnit = (units || []).find(u => u.id === currentUser?.unitId);

  // Handle functions
  const handleExportToGoogleSheets = async () => {
    if (!storeSettings.spreadsheetUrl) {
      toast.error('URL Spreadsheet belum diatur di Pengaturan');
      return;
    }
    
    toast.info('Sinkronisasi data ke Google Sheets...');
    await backupAllData({
      products,
      transactions,
      debts,
      expenses,
      cashIns,
      users: [],
      units,
      stockHistory,
      cashierSessions,
      storeSettings
    });
    
    window.open(storeSettings.spreadsheetUrl, '_blank');
    toast.success('Membuka Google Spreadsheet...');
  };

  const handleExportToPDF = () => {
    // Create PDF content from filtered transactions
    const pdfContent = `
      <html>
        <head>
          <title>LAPORAN TRANSAKSI</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>LAPORAN TRANSAKSI</h1>
          <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Waktu</th>
                <th>Deskripsi</th>
                <th>Jenis</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(tx => `
                <tr>
                  <td>${tx.id.slice(-6).toUpperCase()}</td>
                  <td>${formatDateTime(tx.date)}</td>
                  <td>${tx.type === 'transaction' ? `Penjualan ${tx.paymentType === 'cash' ? 'Tunai' : tx.paymentType === 'transfer' ? 'Transfer' : 'Kredit'} - ${tx.customerName || 'Umum'}` : 
                   tx.type === 'cashin' ? `Kas Masuk - ${tx.depositorName || 'Tidak diketahui'}` : 
                   tx.type === 'expense' ? `Pengeluaran - ${tx.details || 'Tidak diketahui'}` : 
                   tx.type === 'debt_payment' ? `Pelunasan Piutang - ${tx.customerName || 'Tidak diketahui'}` : 
                   'Lainnya'}</td>
                  <td>${tx.type === 'transaction' ? 'Transaksi' : tx.type === 'cashin' ? 'Kas Masuk' : tx.type === 'expense' ? 'Pengeluaran' : 'Lainnya'}</td>
                  <td>${formatRupiah(Math.abs(tx.amount))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <h3>Ringkasan</h3>
            <p>Total Transaksi: ${filteredTransactions.length}</p>
            <p>Total Jumlah: ${formatRupiah(filteredTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0))}</p>
          </div>
        </body>
      </html>
    `;
    
    // Open in new window for preview
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(pdfContent);
      newWindow.document.close();
      newWindow.print();
    } else {
      toast.error('Popup diblokir. Silakan izinkan popup untuk preview PDF.');
    }
  };

  const handlePrintInvoice = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowInvoice(true);
  };

  const handleSendWhatsApp = (transaction: any) => {
    // Format items detail
    const itemsDetail = transaction.items && transaction.items.length > 0 
      ? transaction.items.map(item => `${item.productName}\n  ${item.qty} ${item.unit || 'pcs'} x ${formatRupiah(item.price)} = ${formatRupiah(item.price * item.qty)}`).join('\n\n')
      : 'Tidak ada item';
    
    // Create simple message format
    const msg = `TOKO PAKAN YARDEN
  Tonelet
  08124476200
================================
No: ${transaction.id.slice(-6).toUpperCase()}
Tgl: ${formatDateTime(transaction.date)}
Kasir: ${transaction.cashierName || 'System'}
================================
${itemsDetail}
================================
Subtotal: ${formatRupiah(transaction.subtotal || transaction.total || 0)}
TOTAL: ${formatRupiah(transaction.grandTotal)}
================================
Bayar: ${transaction.paymentType === 'cash' ? 'Tunai' : transaction.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}
Pelanggan: ${transaction.customerName || 'Umum'}
${transaction.paymentType === 'credit' ? `DP: ${formatRupiah(transaction.dp || 0)}` : ''}
${transaction.paymentType === 'cash' ? `Dibayar: ${formatRupiah(transaction.cashPaid || transaction.grandTotal)}\nKembali: ${formatRupiah((transaction.cashPaid || transaction.grandTotal) - transaction.grandTotal)}` : ''}
================================
Terima Kasih!`;
    
    const phone = transaction.customerPhone?.replace(/[^0-9]/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
    } else {
      // Jika tidak ada nomor telepon, buka WhatsApp dengan pesan tanpa nomor tujuan
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
    }
  };

  // Calculate today's data
  const todayData = useMemo(() => {
    const today = new Date().toDateString();
    
    const sessionTx = activeSession ? (transactions || []).filter(t => 
      (activeSession.transactions || []).includes(t.id)
    ) : (transactions || []).filter(t => isToday(t.date) && t.unitId === userUnit?.id);
    
    const sessionExp = activeSession ? (expenses || []).filter(e => 
      (activeSession.expenses || []).includes(e.id)
    ) : (expenses || []).filter(e => isToday(e.date) && e.unitId === userUnit?.id);
    
    const sessionCashIn = activeSession ? (cashIns || []).filter(c => 
      (activeSession.cashIns || []).includes(c.id)
    ) : (cashIns || []).filter(c => isToday(c.date) && c.unitId === userUnit?.id);

    // Group transactions by payment type
    const cashTransactions = sessionTx.filter(t => t.paymentType === 'cash');
    const transferTransactions = sessionTx.filter(t => t.paymentType === 'transfer');
    const creditTransactions = sessionTx.filter(t => t.paymentType === 'credit');

    // Group credit transactions by type
    const creditDP = creditTransactions.filter(t => t.dp && t.dp < t.grandTotal).reduce((sum, t) => sum + (t.dp || 0), 0);
    const creditFull = creditTransactions.filter(t => !t.dp || t.dp === t.grandTotal).reduce((sum, t) => sum + t.grandTotal, 0);
    const creditInstallment = creditTransactions.filter(t => t.dp && t.dp < t.grandTotal).reduce((sum, t) => sum + (t.grandTotal - (t.dp || 0)), 0);

    // Get debt payments today
    const paidDebts = (debts || []).filter(d => 
      d.unitId === userUnit?.id && 
      (d.payments || []).some(p => isToday(p.date))
    );

    const totalPaidToday = paidDebts.reduce((sum, d) => {
      const todayPayments = (d.payments || []).filter(p => isToday(p.date)) || [];
      return sum + todayPayments.reduce((ps, p) => ps + p.amount, 0);
    }, 0);

    const totalCash = cashTransactions.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
    const totalTransfer = transferTransactions.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
    const totalExpenses = sessionExp.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalCashIn = sessionCashIn.reduce((sum, c) => sum + (c.amount || 0), 0);

    const expectedCash = (activeSession?.openingCash || openingCash || 0) + totalCash + totalCashIn + totalPaidToday - totalExpenses;

    // Create comprehensive transaction history
    const allTransactions = [
      // POS Transactions
      ...sessionTx.map(t => ({
        id: t.id,
        date: t.date,
        type: 'transaction' as const,
        description: `Penjualan ${t.paymentType === 'cash' ? 'Tunai' : t.paymentType === 'transfer' ? 'Transfer' : 'Kredit'} - ${t.customerName}`,
        amount: t.grandTotal || 0,
        customerName: t.customerName,
        paymentType: t.paymentType,
        grandTotal: t.grandTotal || 0,
        total: t.total || 0,
        subtotal: t.total || 0, // Map total to subtotal for compatibility
        items: t.items || [],
        dp: t.dp || 0,
        tax: t.tax || 0,
        discount: t.discount || 0,
        cashierName: t.cashierName
      })),
      // Cash In transactions
      ...sessionCashIn.map(c => ({
        id: c.id,
        date: c.date,
        type: 'cashin' as const,
        description: `Kas Masuk - ${c.depositorName}`,
        amount: c.amount || 0,
        depositorName: c.depositorName,
        details: c.description
      })),
      // Expense transactions
      ...sessionExp.map(e => ({
        id: e.id,
        date: e.date,
        type: 'expense' as const,
        description: `Pengeluaran - ${e.description}`,
        amount: -(e.amount || 0), // Negative for expenses
        details: e.description
      })),
      // Debt payments
      ...paidDebts.flatMap(d => 
        (d.payments?.filter(p => isToday(p.date)) || []).map(p => ({
          id: `${d.id}-${p.date}`,
          date: p.date,
          type: 'debt_payment' as const,
          description: `Pelunasan Piutang - ${d.customerName}`,
          amount: p.amount || 0,
          customerName: d.customerName,
          originalDebtId: d.id
        }))
      )
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      openingCash: activeSession?.openingCash || openingCash || 0,
      totalCash,
      totalTransfer,
      creditDP,
      creditFull,
      creditInstallment,
      totalPaidToday,
      totalExpenses,
      expectedCash,
      transactionCount: sessionTx.length,
      transactions: sessionTx,
      allTransactions // New comprehensive list
    };
  }, [activeSession, transactions, expenses, cashIns, debts, userUnit, openingCash]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return todayData.allTransactions;
    const q = searchQuery.toLowerCase();
    return (todayData.allTransactions || []).filter(t => 
      t.description?.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      ('customerName' in t && t.customerName?.toLowerCase().includes(q)) ||
      ('depositorName' in t && t.depositorName?.toLowerCase().includes(q)) ||
      ('items' in t && Array.isArray(t.items) && t.items.length > 0)
    );
  }, [todayData.allTransactions, searchQuery]);

  const handleOpenSession = () => {
    console.log('Opening session:', { currentUser, openingCash });
    
    if (!currentUser) {
      toast.error('User tidak ditemukan');
      return;
    }
    
    if (!currentUser.unitId) {
      toast.error('User tidak memiliki unit. Hubungi admin untuk setup unit.');
      console.log('User missing unitId:', currentUser);
      return;
    }
    
    if (openingCash <= 0) {
      toast.error('Modal awal harus lebih dari 0');
      return;
    }
    
    console.log('Calling openCashierSession with:', currentUser.id, currentUser.unitId, openingCash);
    openCashierSession(currentUser.id, currentUser.unitId, openingCash);
    toast.success('Kasir dibuka dengan modal ' + formatRupiah(openingCash));
  };

  const handleCloseSession = () => {
    if (!activeSession) return;
    closeCashierSession(activeSession.id, todayData.expectedCash);
    toast.success('Kasir ditutup');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg primary-gradient flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard Kasir</h1>
              <p className="text-sm text-muted-foreground">
                {currentUser?.name} • {userUnit?.name} 
                {currentUser?.unitId ? ` (ID: ${currentUser.unitId})` : ' (No Unit ID)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!activeSession ? (
              <button 
                onClick={handleOpenSession}
                className="flex items-center gap-2 px-4 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
              >
                <RefreshCw className="w-4 h-4" /> Buka Kasir
              </button>
            ) : (
              <button 
                onClick={handleCloseSession}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90"
              >
                <EyeOff className="w-4 h-4" /> Tutup Kasir
              </button>
            )}
          </div>
        </div>

        {/* Opening Cash Input */}
        {!activeSession && (
          <div className="bg-muted/50 rounded-lg p-4">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Modal Awal</label>
            <input 
              type="number" 
              value={openingCash || ''} 
              onChange={(e) => {
                console.log('Opening cash input:', e.target.value);
                setOpeningCash(Number(e.target.value));
              }}
              placeholder="Masukkan modal awal" 
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Modal Awal</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatRupiah(todayData.openingCash)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Tunai</span>
          </div>
          <p className="text-lg font-bold text-green-600">{formatRupiah(todayData.totalCash)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Transfer</span>
          </div>
          <p className="text-lg font-bold text-blue-600">{formatRupiah(todayData.totalTransfer)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-muted-foreground">Kredit (DP)</span>
          </div>
          <p className="text-lg font-bold text-purple-600">{formatRupiah(todayData.creditDP)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span className="text-xs text-muted-foreground">Kredit (Penuh)</span>
          </div>
          <p className="text-lg font-bold text-indigo-600">{formatRupiah(todayData.creditFull)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-pink-600" />
            <span className="text-xs text-muted-foreground">Kredit (Cicilan)</span>
          </div>
          <p className="text-lg font-bold text-pink-600">{formatRupiah(todayData.creditInstallment)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Lunas Piutang</span>
          </div>
          <p className="text-lg font-bold text-green-600">{formatRupiah(todayData.totalPaidToday)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-xs text-muted-foreground">Pengeluaran</span>
          </div>
          <p className="text-lg font-bold text-red-600">{formatRupiah(todayData.totalExpenses)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card border-2 border-primary">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Kas Seharusnya</span>
          </div>
          <p className="text-lg font-bold text-primary">{formatRupiah(todayData.expectedCash)}</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Jumlah Transaksi</span>
          </div>
          <p className="text-lg font-bold text-foreground">{todayData.transactionCount}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Riwayat Transaksi
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success rounded-lg text-sm transition-colors"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm"
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDetails ? 'Sederhana' : 'Detail'}
              </button>
            </div>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Cari transaksi..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deskripsi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jenis</th>
                {showDetails && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jumlah</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{tx.id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatDateTime(tx.date)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      {showDetails && tx.type === 'transaction' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {('customerName' in tx && tx.customerName) || 'Umum'}
                        </p>
                      )}
                      {showDetails && tx.type === 'cashin' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Penyetor: {('depositorName' in tx && tx.depositorName) || '-'}
                        </p>
                      )}
                      {showDetails && tx.type === 'expense' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {('details' in tx && tx.details) || '-'}
                        </p>
                      )}
                      {showDetails && tx.type === 'debt_payment' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Pelanggan: {('customerName' in tx && tx.customerName) || '-'}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.type === 'transaction' ? 
                        (('paymentType' in tx && tx.paymentType) === 'cash' ? 'bg-green-100 text-green-800' :
                         ('paymentType' in tx && tx.paymentType) === 'transfer' ? 'bg-blue-100 text-blue-800' :
                         'bg-purple-100 text-purple-800') :
                      tx.type === 'cashin' ? 'bg-emerald-100 text-emerald-800' :
                      tx.type === 'expense' ? 'bg-red-100 text-red-800' :
                      tx.type === 'debt_payment' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tx.type === 'transaction' ? 
                        (('paymentType' in tx && tx.paymentType) === 'cash' ? 'Tunai' :
                         ('paymentType' in tx && tx.paymentType) === 'transfer' ? 'Transfer' :
                         'Kredit') :
                      tx.type === 'cashin' ? 'Kas Masuk' :
                      tx.type === 'expense' ? 'Pengeluaran' :
                      tx.type === 'debt_payment' ? 'Lunas Piutang' :
                      'Lainnya'}
                    </span>
                  </td>
                  {showDetails && (
                    <td className={`px-4 py-3 text-sm font-bold ${
                      tx.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatRupiah(Math.abs(tx.amount))}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {tx.type === 'transaction' && (
                        <>
                          <button
                            onClick={() => handlePrintInvoice(tx)}
                            className="p-1 rounded bg-info/10 hover:bg-info/20 text-info transition-colors"
                            title="Cetak Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendWhatsApp(tx)}
                            className="p-1 rounded bg-success/10 hover:bg-success/20 text-success transition-colors"
                            title="Kirim WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={showDetails ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada transaksi hari ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-elevated w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Export Data Transaksi</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <button
                  onClick={handleExportToGoogleSheets}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Cloud className="w-5 h-5 text-success" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Google Sheets</p>
                    <p className="text-xs text-muted-foreground">Kirim data ke Google Sheets</p>
                  </div>
                </button>
                <button
                  onClick={handleExportToPDF}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <FileText className="w-5 h-5 text-info" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">PDF</p>
                    <p className="text-xs text-muted-foreground">Unduh sebagai PDF</p>
                  </div>
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Invoice & Faktur Transaksi</h3>
            </div>
            <div className="p-6">
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">No. Invoice:</p>
                    <p className="font-bold text-foreground">{selectedTransaction.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tanggal:</p>
                    <p className="font-bold text-foreground">{formatDateTime(selectedTransaction.date)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-muted-foreground">Pelanggan:</p>
                    <p className="text-sm font-medium text-foreground">{selectedTransaction.customerName || selectedTransaction.depositorName || 'Umum'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-muted-foreground">Jenis:</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedTransaction.type === 'transaction' ? 'Penjualan' : 
                       selectedTransaction.type === 'cashin' ? 'Kas Masuk' : 
                       selectedTransaction.type === 'expense' ? 'Pengeluaran' : 
                       selectedTransaction.type === 'debt_payment' ? 'Pelunasan Piutang' : 'Lainnya'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-muted-foreground">Jumlah:</p>
                    <p className="text-sm font-bold text-success">{formatRupiah(Math.abs(selectedTransaction.amount || selectedTransaction.grandTotal || 0))}</p>
                  </div>
                  {selectedTransaction.paymentType && (
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-muted-foreground">Metode:</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedTransaction.paymentType === 'cash' ? 'Tunai' : 
                         selectedTransaction.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.dp && selectedTransaction.dp < selectedTransaction.grandTotal && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm text-muted-foreground">DP:</p>
                        <p className="text-sm font-medium text-foreground">{formatRupiah(selectedTransaction.dp)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm text-muted-foreground">Sisa:</p>
                        <p className="text-sm font-bold text-accent">{formatRupiah(selectedTransaction.grandTotal - selectedTransaction.dp)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                {selectedTransaction.type === 'transaction' && (
                  <>
                    <PrintButtons 
                      transaction={selectedTransaction}
                      type="invoice"
                    />
                    <PrintButtons 
                      transaction={selectedTransaction}
                      type="faktur"
                    />
                  </>
                )}
                {selectedTransaction.type !== 'transaction' && (
                  <div className="flex-1 p-4 bg-muted/30 rounded-lg text-center text-muted-foreground">
                    <p className="text-sm">Hanya transaksi penjualan yang dapat dicetak invoice/faktur</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowInvoice(false)}
                  className="py-2 bg-secondary text-secondary-foreground rounded-lg font-medium"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    const msg = `*INVOICE*\n${storeSettings?.storeName || 'Toko'}\nNo: ${selectedTransaction.id.slice(-6).toUpperCase()}\nPelanggan: ${selectedTransaction.customerName || 'Umum'}\nTotal: ${formatRupiah(selectedTransaction.grandTotal)}\nMetode: ${selectedTransaction.paymentType === 'cash' ? 'Tunai' : selectedTransaction.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}\n\nTerima kasih!`;
                    const phone = selectedTransaction.customerPhone?.replace(/[^0-9]/g, '');
                    if (phone) {
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
                    } else {
                      toast.error('Nomor telepon tidak tersedia');
                    }
                  }}
                  className="py-2 bg-success text-success-foreground rounded-lg font-medium hover:bg-success/90 transition-colors"
                >
                  Kirim WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
