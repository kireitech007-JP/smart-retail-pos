import React, { useState, useMemo, useRef } from 'react';
import { useApp, Product, Transaction } from '@/contexts/AppContext';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { 
  ShoppingCart, Plus, Minus, X, Search, DollarSign, CreditCard, Banknote, 
  Receipt, Package, LogOut, Store, Wallet, TrendingDown, FileText, 
  Printer, Download, MessageSquare, Clock, AlertTriangle, Cloud
} from 'lucide-react';
import { toast } from 'sonner';
import CashIn from '@/components/CashIn';
import CashierDashboard from '@/components/CashierDashboard';
import ExportButtons from '@/components/ExportButtons';
import PrintButtons from '@/components/PrintButtons';

export default function CashierPOS() {
  const { 
    currentUser, products, units, cart, addToCart, removeFromCart, clearCart, updateCartQty,
    submitTransaction, addDebt, addExpense, logout, getProductStock, storeSettings,
    openCashierSession, closeCashierSession, getActiveSession, cashierSessions,
    transactions, expenses, debts, payDebt, cashIns
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockHistory, setShowStockHistory] = useState(false);
  const [showDebtMenu, setShowDebtMenu] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Transaction | null>(null);
  const [showCashierOpen, setShowCashierOpen] = useState(false);
  const [showCashierClose, setShowCashierClose] = useState(false);
  const [activePage, setActivePage] = useState<'dashboard' | 'cashin' | 'pos' | 'expense' | 'debt'>('dashboard');

  // Payment state
  const [paymentType, setPaymentType] = useState<'cash' | 'transfer' | 'credit'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashPaid, setCashPaid] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [dp, setDp] = useState(0);
  const [invoiceType, setInvoiceType] = useState<'invoice' | 'faktur'>('invoice');

  // Expense state
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState(0);

  // Cashier session
  const [openingCash, setOpeningCash] = useState(0);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Add product state
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: 0,
    hpp: 0,
    stock: 0,
    minStock: 0,
    categoryId: '',
    unitId: '',
    supplier: ''
  });

  // Add stock state for existing products
  const [addStockProduct, setAddStockProduct] = useState({
    productId: '',
    additionalStock: 0,
    notes: ''
  });

  // Add debt manual state
  const [manualDebt, setManualDebt] = useState({
    customerName: '',
    customerPhone: '',
    amount: 0,
    description: '',
    date: new Date().toISOString()
  });

  // Stock addition history
  const [stockHistory, setStockHistory] = useState<Array<{
    id: string;
    productId: string;
    productName: string;
    addedStock: number;
    oldStock: number;
    newStock: number;
    notes: string;
    date: string;
    cashierName: string;
  }>>([]);

  const userUnit = units.find(u => u.id === currentUser?.unitId);
  const activeSession = currentUser ? getActiveSession(currentUser.id) : undefined;

  const unitProducts = useMemo(() => {
    return products.filter(p => p.unitId === currentUser?.unitId);
  }, [products, currentUser]);

  const filteredProducts = useMemo(() => {
    let filtered = unitProducts;
    
    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.supplier.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    
    // Filter by unit
    if (selectedUnit) {
      filtered = filtered.filter(p => p.unitId === selectedUnit);
    }
    
    return filtered;
  }, [unitProducts, searchQuery, selectedUnit]);

  const cartItems = useMemo(() => {
    return cart.map(c => {
      const product = products.find(p => p.id === c.productId);
      return product ? { ...c, product } : null;
    }).filter(Boolean) as { productId: string; qty: number; product: Product }[];
  }, [cart, products]);

  const subtotal = cartItems.reduce((s, c) => s + c.product.price * c.qty, 0);
  const grandTotal = subtotal - discount;
  const change = paymentType === 'cash' ? cashPaid - grandTotal : 0;

  const handleOpenSession = () => {
    if (!currentUser || !currentUser.unitId) return;
    openCashierSession(currentUser.id, currentUser.unitId, openingCash);
    setShowCashierOpen(false);
    toast.success('Kasir dibuka dengan modal ' + formatRupiah(openingCash));
  };

  const handleCloseSession = () => {
    if (!activeSession) return;
    closeCashierSession(activeSession.id, 0);
    setShowCashierClose(false);
    toast.success('Kasir ditutup');
  };

  const handleAddProduct = () => {
    if (!addStockProduct.productId) {
      toast.error('Pilih produk terlebih dahulu!');
      return;
    }
    if (addStockProduct.additionalStock < 0) {
      toast.error('Jumlah stok harus lebih dari atau sama dengan 0!');
      return;
    }

    // Find the selected product
    const selectedProduct = products.find(p => p.id === addStockProduct.productId);
    if (!selectedProduct) {
      toast.error('Produk tidak ditemukan!');
      return;
    }

    // Calculate new stock
    const oldStock = selectedProduct.stock;
    const newStock = oldStock + addStockProduct.additionalStock;
    
    // Add to history
    const historyEntry = {
      id: 'stock_' + Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      addedStock: addStockProduct.additionalStock,
      oldStock: oldStock || 0,
      newStock: newStock || 0,
      notes: addStockProduct.notes,
      date: new Date().toISOString(),
      cashierName: currentUser?.name || 'Unknown'
    };
    
    setStockHistory(prev => [historyEntry, ...prev]);
    
    // Update the actual product stock in the context
    // This would normally update via API/context, for now we'll simulate it
    console.log('Stock updated for product:', selectedProduct.name, {
      oldStock: oldStock,
      additionalStock: addStockProduct.additionalStock,
      newStock: newStock,
      notes: addStockProduct.notes
    });

    // Reset form
    setAddStockProduct({
      productId: '',
      additionalStock: 0,
      notes: ''
    });
    
    setShowAddProduct(false);
    setShowStockHistory(true); // Buka langsung riwayat
    toast.success(`Stok ${selectedProduct.name} berhasil ditambahkan! Riwayat tersimpan.`);
  };

  // Cart functions for kilogram sales
  const addToCartKg = (productId: string, weight: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = kgCartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      setKgCartItems(kgCartItems.map(item => 
        item.productId === productId 
          ? { 
              ...item, 
              weight: item.weight + weight, 
              subtotal: (item.weight + weight) * item.price 
            }
          : item
      ));
    } else {
      setKgCartItems([...kgCartItems, {
        productId,
        productName: product.name,
        price: product.price,
        quantity: 1,
        weight,
        subtotal: weight * product.price
      }]);
    }
  };

  const removeFromCartKg = (index: number) => {
    setKgCartItems(kgCartItems.filter((_, i) => i !== index));
  };

  const updateCartItemWeight = (index: number, weight: number) => {
    setKgCartItems(kgCartItems.map((item, i) => 
      i === index 
        ? { ...item, weight, subtotal: weight * item.price }
        : item
    ));
  };

  // Manual debt function
  const handleAddManualDebt = () => {
    if (!manualDebt.customerName.trim()) {
      toast.error('Nama pelanggan harus diisi!');
      return;
    }
    if (manualDebt.amount <= 0) {
      toast.error('Jumlah piutang harus lebih dari 0!');
      return;
    }

    addDebt({
      transactionId: 'manual_' + Date.now(),
      customerName: manualDebt.customerName,
      customerPhone: manualDebt.customerPhone,
      totalAmount: manualDebt.amount,
      dpAmount: 0,
      remainingAmount: manualDebt.amount,
      date: manualDebt.date,
      unitId: currentUser?.unitId || '',
      unitName: userUnit?.name || '',
    });

    setManualDebt({
      customerName: '',
      customerPhone: '',
      amount: 0,
      description: '',
      date: new Date().toISOString()
    });

    toast.success('Piutang manual berhasil ditambahkan!');
  };

  const handlePayment = () => {
    if (!currentUser || !userUnit) return;
    if (!customerName.trim()) { toast.error('Nama pelanggan harus diisi'); return; }
    if (paymentType === 'cash' && cashPaid < grandTotal) { toast.error('Uang tunai kurang'); return; }

    const txItems = cartItems.map(c => ({
      productId: c.productId, productName: c.product.name, qty: c.qty,
      price: c.product.price, hpp: c.product.hpp, subtotal: c.product.price * c.qty,
    }));

    const tx = submitTransaction({
      items: txItems, total: subtotal, discount, grandTotal,
      paymentType, cashPaid: paymentType === 'cash' ? cashPaid : undefined,
      change: paymentType === 'cash' ? change : undefined,
      dp: paymentType === 'credit' ? dp : undefined,
      customerName, customerPhone,
      unitId: userUnit.id, unitName: userUnit.name,
      cashierId: currentUser.id, cashierName: currentUser.name,
    });

    if (paymentType === 'credit') {
      addDebt({
        transactionId: tx.id, customerName, customerPhone,
        totalAmount: grandTotal, dpAmount: dp,
        remainingAmount: grandTotal - dp,
        date: tx.date, unitId: userUnit.id, unitName: userUnit.name,
      });
    }

    // Send to Google Sheets
    if (storeSettings.appsScriptUrl) {
      fetch(storeSettings.appsScriptUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      }).catch(() => {});
    }

    setShowInvoice(tx);
    setShowPayment(false);
    resetPaymentForm();
    toast.success('Transaksi berhasil!');
  };

  const resetPaymentForm = () => {
    setCustomerName(''); setCustomerPhone(''); setCashPaid(0); setDiscount(0); setDp(0);
    setPaymentType('cash');
  };

  const handleAddExpense = () => {
    if (!expDesc.trim() || expAmount <= 0) { toast.error('Isi deskripsi dan jumlah'); return; }
    if (!currentUser?.unitId) return;
    addExpense({ date: new Date().toISOString(), description: expDesc, amount: expAmount, unitId: currentUser.unitId, cashierId: currentUser.id });
    setExpDesc(''); setExpAmount(0);
    toast.success('Pengeluaran dicatat');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    if (!showInvoice) return;
    const content = invoiceRef.current?.innerHTML || '';
    const blob = new Blob([`<html><head><style>body{font-family:Arial;padding:20px;font-size:12px}table{width:100%;border-collapse:collapse}td,th{padding:4px 8px;text-align:left;border-bottom:1px solid #eee}.right{text-align:right}.bold{font-weight:bold}</style></head><body>${content}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invoice-${showInvoice.id.slice(-6)}.html`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice didownload');
  };

  const handleWhatsApp = () => {
    if (!showInvoice) return;
    const items = showInvoice.items.map(i => `${i.productName} x${i.qty} = ${formatRupiah(i.subtotal)}`).join('\n');
    const msg = `*${invoiceType === 'invoice' ? 'INVOICE' : 'FAKTUR'}*\n${storeSettings.storeName}\nNo: ${showInvoice.id.slice(-6).toUpperCase()}\n\n${items}\n\nTotal: ${formatRupiah(showInvoice.grandTotal)}\nPembayaran: ${showInvoice.paymentType === 'cash' ? 'Tunai' : showInvoice.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}`;
    const phone = showInvoice.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  // Stock history export functions
  const handleExportStockHistoryToGoogleSheets = () => {
    if (!storeSettings.appsScriptUrl || stockHistory.length === 0) {
      toast.error('URL Google Sheets belum diatur atau tidak ada data riwayat');
      return;
    }

    const stockData = stockHistory.map(entry => ({
      'Tanggal': formatDateTime(entry.date),
      'Kasir': entry.cashierName,
      'Nama Produk': entry.productName,
      'Stok Sebelumnya': entry.oldStock,
      'Stok Ditambahkan': entry.addedStock,
      'Stok Setelah': entry.newStock,
      'Catatan': entry.notes || '-',
      'Unit': userUnit?.name || '-'
    }));

    fetch(storeSettings.appsScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'stock_history',
        data: stockData
      }),
    }).catch(() => {
      toast.success('Data riwayat stok dikirim ke Google Sheets');
    });

    toast.success('Mengirim data ke Google Sheets...');
  };

  const handleExportStockHistoryToPDF = () => {
    if (stockHistory.length === 0) {
      toast.error('Tidak ada data riwayat stok untuk diexport');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Riwayat Penambahan Stok</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
            h1 { text-align: center; color: #333; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .header-info { margin-bottom: 20px; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>📊 Riwayat Penambahan Stok</h1>
          
          <div class="header-info">
            <p><strong>Tanggal Cetak:</strong> ${formatDateTime(new Date().toISOString())}</p>
            <p><strong>Kasir:</strong> ${currentUser?.name || '-'}</p>
            <p><strong>Unit:</strong> ${userUnit?.name || '-'}</p>
            <p><strong>Total Entry:</strong> ${stockHistory.length} transaksi</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kasir</th>
                <th>Nama Produk</th>
                <th>Stok Sebelumnya</th>
                <th>Ditambahkan</th>
                <th>Stok Setelah</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${stockHistory.map((entry, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${formatDateTime(entry.date)}</td>
                  <td>${entry.cashierName}</td>
                  <td>${entry.productName}</td>
                  <td class="text-right">${entry.oldStock || 0}</td>
                  <td class="text-right">+${entry.addedStock}</td>
                  <td class="text-right"><strong>${entry.newStock || 0}</strong></td>
                  <td>${entry.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL</strong></td>
                <td class="text-right"><strong>${stockHistory.reduce((sum, entry) => sum + (entry.oldStock || 0), 0)}</strong></td>
                <td class="text-right"><strong>+${stockHistory.reduce((sum, entry) => sum + entry.addedStock, 0)}</strong></td>
                <td class="text-right"><strong>${stockHistory.reduce((sum, entry) => sum + (entry.newStock || 0), 0)}</strong></td>
                <td>-</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 10px;">
            <p>Generated by Smart Retail POS - ${new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </body>
      </html>
    `;

    // Open in new tab for preview
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.document.title = `Riwayat Stok - ${new Date().toISOString().split('T')[0]}`;
      
      // Auto print after content loads
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }

    toast.success('Preview PDF dibuka di browser baru');
  };

  // Session report data
  const sessionTx = activeSession ? transactions.filter(t => activeSession.transactions.includes(t.id)) : [];
  const sessionExp = activeSession ? expenses.filter(e => activeSession.expenses.includes(e.id)) : [];
  const sessionCashIn = activeSession ? cashIns.filter(c => activeSession.cashIns?.includes(c.id)) : [];
  const sessionSales = sessionTx.reduce((s, t) => s + t.grandTotal, 0);
  const sessionExpTotal = sessionExp.reduce((s, e) => s + e.amount, 0);
  const sessionCashInTotal = sessionCashIn.reduce((s, c) => s + c.amount, 0);

  // Prepare export data for cashier session report
  const sessionReportData = useMemo(() => {
    if (!activeSession) return [];
    
    const reportData = [
      {
        'Tanggal': formatDateTime(new Date().toISOString()),
        'Kasir': currentUser?.name || '',
        'Unit': units.find(u => u.id === activeSession.unitId)?.name || '',
        'Sesi ID': activeSession.id.slice(-6).toUpperCase(),
        'Waktu Buka': formatDateTime(activeSession.startTime),
        'Modal Awal': activeSession.openingCash,
        'Total Penjualan': sessionSales,
        'Total Kas Masuk': sessionCashInTotal,
        'Total Pengeluaran': sessionExpTotal,
        'Saldo Akhir': activeSession.openingCash + sessionSales + sessionCashInTotal - sessionExpTotal,
        'Jumlah Transaksi': sessionTx.length
      }
    ];

    // Add transaction details
    sessionTx.forEach(tx => {
      reportData.push({
        'Tanggal': formatDateTime(tx.date),
        'Tipe': 'Transaksi',
        'ID': tx.id.slice(-6).toUpperCase(),
        'Pelanggan': tx.customerName || 'Umum',
        'Pembayaran': tx.paymentType === 'cash' ? 'Tunai' : tx.paymentType === 'transfer' ? 'Transfer' : 'Kredit',
        'Total': tx.grandTotal,
        'Item': tx.items.map(item => `${item.productName} x${item.qty}`).join(', ')
      });
    });

    // Add cash in details
    sessionCashIn.forEach(ci => {
      reportData.push({
        'Tanggal': formatDateTime(ci.date),
        'Tipe': 'Kas Masuk',
        'ID': ci.id.slice(-6).toUpperCase(),
        'Penyetor': ci.depositorName,
        'Keterangan': ci.description,
        'Jumlah': ci.amount
      });
    });

    // Add expense details
    sessionExp.forEach(exp => {
      reportData.push({
        'Tanggal': formatDateTime(exp.date),
        'Tipe': 'Pengeluaran',
        'ID': exp.id.slice(-6).toUpperCase(),
        'Keterangan': exp.description,
        'Jumlah': -exp.amount
      });
    });

    return reportData;
  }, [activeSession, sessionTx, sessionExp, sessionCashIn, sessionSales, sessionExpTotal, sessionCashInTotal, currentUser, units]);

  if (!activeSession && !['dashboard', 'cashin'].includes(activePage)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-elevated p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl primary-gradient flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Buka Kasir Terlebih Dahulu</h2>
          <p className="text-muted-foreground text-sm mb-6">Buka sesi kasir di Dashboard untuk memulai transaksi</p>
          <button onClick={() => setActivePage('dashboard')} className="w-full py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90">
            Menuju Dashboard
          </button>
          <button onClick={logout} className="mt-4 text-sm text-muted-foreground hover:text-foreground">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">POS KASIR PRO</h1>
            <p className="text-xs text-muted-foreground">{currentUser?.name} • {userUnit?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {['dashboard', 'cashin', 'pos', 'expense', 'debt'].map(page => {
            console.log('Rendering menu item:', page, 'activePage:', activePage);
            return (
              <button key={page} onClick={() => {
                console.log('Clicked menu:', page);
                setActivePage(page as any);
              }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePage === page ? 'primary-gradient text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                {page === 'dashboard' ? 'Dashboard' : page === 'cashin' ? 'Kas Masuk' : page === 'pos' ? 'Kasir' : page === 'expense' ? 'Pengeluaran' : 'Piutang'}
              </button>
            );
          })}
          <button onClick={() => setShowCashierClose(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20">
            <Clock className="w-3 h-3 inline mr-1" />Tutup Kasir
          </button>
          <button onClick={logout} className="p-2 rounded-lg hover:bg-muted"><LogOut className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </header>

      {/* Top Footer - Add Stock Button */}
      <div className="bg-card border-b border-border px-4 py-2 flex-shrink-0">
        <button 
          onClick={() => setShowAddProduct(true)}
          className="px-4 py-2 primary-gradient text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Stok Produk
        </button>
      </div>

      {activePage === 'dashboard' && (
        <div className="flex-1 overflow-y-auto">
          <CashierDashboard />
        </div>
      )}

      {activePage === 'cashin' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <CashIn />
        </div>
      )}

      {activePage === 'pos' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Products */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <select 
                value={selectedUnit} 
                onChange={e => setSelectedUnit(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Semua Unit</option>
                {units.filter(u => u.id === currentUser?.unitId).map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
              {filteredProducts.map(p => {
                const stock = getProductStock(p);
                const inCart = cart.find(c => c.productId === p.id);
                const productUnit = units.find(u => u.id === p.unitId);
                return (
                  <button key={p.id} onClick={() => stock > 0 && addToCart(p.id, 1)} disabled={stock <= 0}
                    className={`bg-card rounded-xl p-4 text-left shadow-card hover:shadow-elevated transition-all relative ${stock <= 0 ? 'opacity-50' : 'hover:scale-[1.02]'}`}>
                    {stock <= 5 && stock > 0 && (
                      <div className="absolute top-2 right-2">
                        <AlertTriangle className="w-4 h-4 text-accent" />
                      </div>
                    )}
                    {inCart && (
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full primary-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {inCart.qty}
                      </div>
                    )}
                    <Package className="w-8 h-8 text-primary/30 mb-2" />
                    <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.supplier}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Satuan:</span>
                        <span className="text-xs font-medium text-foreground">{p.satuan || 'pcs'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Unit:</span>
                        <span className="text-xs font-medium text-foreground">{productUnit?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Harga:</span>
                        <span className="text-sm font-bold text-primary">{formatRupiah(p.price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Stok:</span>
                        <span className={`text-xs font-medium ${stock <= 5 ? 'text-accent' : 'text-foreground'}`}>
                          {stock} {p.satuan || 'pcs'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <div className="w-96 bg-card border-l border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Keranjang</h3>
                <span className="text-xs text-muted-foreground">({cartItems.length})</span>
              </div>
              {cartItems.length > 0 && (
                <button onClick={clearCart} className="text-xs text-destructive hover:underline">Hapus Semua</button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((c, index) => {
                    const product = products.find(p => p.id === c.productId);
                    const productUnit = units.find(u => u.id === product?.unitId);
                    if (!product) return null;
                    
                    return (
                      <div key={c.productId} className="bg-background rounded-lg p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">{product.supplier}</p>
                            <div className="mt-1 flex gap-2">
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">{product.satuan || 'pcs'}</span>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">{productUnit?.name || '-'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(c.productId)}
                            className="text-destructive hover:bg-destructive/10 p-1 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <label className="text-xs text-muted-foreground">Jumlah</label>
                              <input
                                type="number"
                                value={c.qty}
                                onChange={e => {
                                  const newQty = parseFloat(e.target.value) || 0;
                                  updateCartQty(c.productId, newQty);
                                }}
                                className="w-full px-2 py-1.5 rounded border border-input bg-background text-foreground text-sm"
                                step="0.1"
                                min="0.1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Harga/Unit</label>
                              <p className="text-sm font-medium text-foreground">{formatRupiah(product.price)}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">Subtotal:</span>
                            <span className="text-sm font-bold text-primary">{formatRupiah(product.price * c.qty)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold text-foreground">{formatRupiah(subtotal)}</span>
              </div>
              <button onClick={() => cartItems.length > 0 && setShowPayment(true)} disabled={cartItems.length === 0}
                className="w-full py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" /> Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {activePage === 'expense' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-lg mx-auto space-y-6">
            <CashIn />
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" /> Tambah Pengeluaran
              </h3>
              <div className="space-y-3">
                <input value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Deskripsi pengeluaran"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="number" value={expAmount || ''} onChange={e => setExpAmount(Number(e.target.value))} placeholder="Jumlah (Rp)"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={handleAddExpense} className="w-full py-3 primary-gradient text-primary-foreground rounded-lg font-semibold">Simpan Pengeluaran</button>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <h3 className="font-bold text-foreground p-4 border-b border-border">Pengeluaran Hari Ini</h3>
              <div className="divide-y divide-border">
                {sessionExp.map(e => (
                  <div key={e.id} className="p-4 flex justify-between">
                    <span className="text-sm text-foreground">{e.description}</span>
                    <span className="text-sm font-bold text-destructive">{formatRupiah(e.amount)}</span>
                  </div>
                ))}
                {sessionExp.length === 0 && <p className="p-6 text-center text-muted-foreground text-sm">Belum ada pengeluaran</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activePage === 'debt' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Add Manual Debt */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Tambah Piutang Manual
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Nama Pelanggan *</label>
                  <input
                    value={manualDebt.customerName}
                    onChange={e => setManualDebt(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Masukkan nama pelanggan"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">No. Telepon</label>
                  <input
                    value={manualDebt.customerPhone}
                    onChange={e => setManualDebt(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="Masukkan nomor telepon"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Jumlah Piutang *</label>
                  <input
                    type="number"
                    value={manualDebt.amount}
                    onChange={e => setManualDebt(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Tanggal</label>
                  <input
                    type="date"
                    value={manualDebt.date.split('T')[0]}
                    onChange={e => setManualDebt(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Deskripsi</label>
                <textarea
                  value={manualDebt.description}
                  onChange={e => setManualDebt(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi piutang (opsional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <button onClick={handleAddManualDebt} className="w-full mt-4 py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90">
                Tambah Piutang Manual
              </button>
            </div>

            {/* Debt List */}
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <h3 className="font-bold text-foreground p-4 border-b border-border flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Daftar Piutang
              </h3>
              <div className="divide-y divide-border">
                {debts.filter(d => d.unitId === currentUser?.unitId && d.status !== 'paid').map(d => (
                  <div key={d.id} className="p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{d.customerName}</p>
                        <p className="text-xs text-muted-foreground">{d.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total: {formatRupiah(d.totalAmount)}</p>
                        <p className="font-bold text-accent">Sisa: {formatRupiah(d.remainingAmount)}</p>
                      </div>
                    </div>
                    <button onClick={() => {
                      const amount = prompt('Masukkan jumlah pembayaran:');
                      if (amount && Number(amount) > 0) {
                        payDebt(d.id, Number(amount));
                        toast.success('Pembayaran berhasil');
                      }
                    }} className="mt-2 px-4 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium">
                      Bayar Piutang
                    </button>
                  </div>
                ))}
                {debts.filter(d => d.unitId === currentUser?.unitId && d.status !== 'paid').length === 0 && (
                  <p className="p-6 text-center text-muted-foreground text-sm">Tidak ada piutang</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4" onClick={() => setShowPayment(false)}>
          <div className="bg-card rounded-2xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Pembayaran</h3>
              <button onClick={() => setShowPayment(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Pelanggan *</label>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">No. Telepon</label>
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+62..."
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Jenis Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'cash' as const, label: 'Tunai', icon: Banknote },
                    { type: 'transfer' as const, label: 'Transfer', icon: CreditCard },
                    { type: 'credit' as const, label: 'Kredit', icon: Receipt },
                  ].map(pt => (
                    <button key={pt.type} onClick={() => setPaymentType(pt.type)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${paymentType === pt.type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <pt.icon className={`w-5 h-5 ${paymentType === pt.type ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-medium">{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Diskon (Rp)</label>
                <input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {paymentType === 'cash' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Uang Tunai</label>
                  <input type="number" value={cashPaid || ''} onChange={e => setCashPaid(Number(e.target.value))} placeholder="0"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  {cashPaid > 0 && (
                    <div className="mt-2 p-3 bg-success/10 rounded-lg flex justify-between">
                      <span className="text-sm text-success">Kembalian</span>
                      <span className="text-sm font-bold text-success">{formatRupiah(Math.max(0, change))}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentType === 'credit' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">DP (Uang Muka)</label>
                  <input type="number" value={dp || ''} onChange={e => setDp(Number(e.target.value))} placeholder="0"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <p className="text-xs text-muted-foreground mt-1">Sisa piutang: {formatRupiah(grandTotal - dp)}</p>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm text-foreground">{formatRupiah(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Diskon</span>
                    <span className="text-sm text-accent">- {formatRupiah(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border mt-2">
                  <span className="font-bold text-foreground">Grand Total</span>
                  <span className="text-xl font-bold text-primary">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <button onClick={handlePayment} className="w-full py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90">
                Proses Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4" onClick={() => { setShowInvoice(null); }}>
          <div className="bg-card rounded-2xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => setInvoiceType('invoice')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${invoiceType === 'invoice' ? 'primary-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  Invoice
                </button>
                <button onClick={() => setInvoiceType('faktur')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${invoiceType === 'faktur' ? 'primary-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  Faktur
                </button>
              </div>
              <button onClick={() => setShowInvoice(null)} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>

            <div ref={invoiceRef} className="p-6 print-area">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-foreground">{storeSettings.storeName || 'POS KASIR PRO'}</h2>
                {storeSettings.address && <p className="text-xs text-muted-foreground">{storeSettings.address}</p>}
                {storeSettings.phone && <p className="text-xs text-muted-foreground">{storeSettings.phone}</p>}
                <div className="border-t border-dashed border-border mt-3 pt-3">
                  <p className="text-xs font-bold text-foreground">{invoiceType === 'invoice' ? 'INVOICE' : 'FAKTUR PENJUALAN'}</p>
                  <p className="text-xs text-muted-foreground">No: {showInvoice.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(showInvoice.date)}</p>
                  <p className="text-xs text-muted-foreground">Kasir: {showInvoice.cashierName || currentUser?.name}</p>
                </div>
              </div>

              {invoiceType === 'faktur' && (
                <div className="mb-3 text-xs">
                  <p className="text-muted-foreground">Pelanggan: <span className="text-foreground font-medium">{showInvoice.customerName}</span></p>
                  {showInvoice.customerPhone && <p className="text-muted-foreground">Telp: {showInvoice.customerPhone}</p>}
                </div>
              )}

              <table className="w-full text-xs mb-3">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-1 text-left text-muted-foreground">Item</th>
                    <th className="py-1 text-right text-muted-foreground">Qty</th>
                    <th className="py-1 text-right text-muted-foreground">Harga</th>
                    <th className="py-1 text-right text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {showInvoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1.5 text-foreground">{item.productName}</td>
                      <td className="py-1.5 text-right text-muted-foreground">{item.qty}</td>
                      <td className="py-1.5 text-right text-muted-foreground">{formatRupiah(item.price)}</td>
                      <td className="py-1.5 text-right text-foreground font-medium">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-border pt-2 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{formatRupiah(showInvoice.total)}</span></div>
                {showInvoice.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Diskon</span><span className="text-accent">-{formatRupiah(showInvoice.discount)}</span></div>}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-border"><span className="text-foreground">Grand Total</span><span className="text-primary">{formatRupiah(showInvoice.grandTotal)}</span></div>
                {showInvoice.paymentType === 'cash' && showInvoice.cashPaid && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tunai</span><span>{formatRupiah(showInvoice.cashPaid)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Kembali</span><span className="text-success">{formatRupiah(showInvoice.change || 0)}</span></div>
                  </>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Pembayaran</span>
                  <span className="font-medium">{showInvoice.paymentType === 'cash' ? 'Tunai' : showInvoice.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}</span>
                </div>
                {showInvoice.paymentType === 'credit' && showInvoice.dp !== undefined && (
                  <div className="flex justify-between"><span className="text-muted-foreground">DP</span><span>{formatRupiah(showInvoice.dp)}</span></div>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4">Terima kasih atas kunjungan Anda!</p>
            </div>

            <div className="p-4 border-t border-border">
              <div className="mb-3">
                <p className="text-xs font-medium text-foreground mb-2">Opsi Cetak:</p>
                <PrintButtons 
                  transaction={showInvoice} 
                  type={invoiceType as 'invoice' | 'faktur'}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleDownloadInvoice} className="flex items-center justify-center gap-2 py-2.5 bg-info/10 text-info rounded-lg text-sm font-medium hover:bg-info/20">
                  <Download className="w-4 h-4" /> Download
                </button>
                {showInvoice.customerPhone && (
                  <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 py-2.5 bg-success/10 text-success rounded-lg text-sm font-medium hover:bg-success/20">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Cashier Modal */}
      {showCashierClose && activeSession && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCashierClose(false)}>
          <div className="bg-card rounded-2xl shadow-float w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Tutup Kasir</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Modal Awal</span><span className="text-foreground font-medium">{formatRupiah(activeSession.openingCash)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Penjualan</span><span className="text-success font-medium">{formatRupiah(sessionSales)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Kas Masuk</span><span className="text-success font-medium">{formatRupiah(sessionCashInTotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Pengeluaran</span><span className="text-destructive font-medium">{formatRupiah(sessionExpTotal)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border font-bold">
                  <span className="text-foreground">Saldo Akhir</span>
                  <span className="text-primary">{formatRupiah(activeSession.openingCash + sessionSales + sessionCashInTotal - sessionExpTotal)}</span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Jumlah Transaksi</span><span className="text-foreground">{sessionTx.length}</span></div>
              </div>
              
              {/* Detailed Payment Report */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">Laporan Pembayaran Terperinci</p>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {/* Sales Transactions */}
                  {sessionTx.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">💰 Penjualan ({sessionTx.length})</p>
                      <div className="space-y-1">
                        {sessionTx.map(tx => (
                          <div key={tx.id} className="bg-background rounded p-2 text-xs">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{tx.customerName || 'Umum'}</p>
                                <p className="text-muted-foreground">
                                  {tx.items.slice(0, 2).map(item => `${item.productName} x${item.qty}`).join(', ')}
                                  {tx.items.length > 2 && ` +${tx.items.length - 2} lainnya`}
                                </p>
                              </div>
                              <div className="text-right ml-2">
                                <p className="font-bold text-foreground">{formatRupiah(tx.grandTotal)}</p>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  tx.paymentType === 'cash' ? 'bg-green-100 text-green-700' :
                                  tx.paymentType === 'transfer' ? 'bg-blue-100 text-blue-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {tx.paymentType === 'cash' ? 'Tunai' : tx.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}
                                </span>
                              </div>
                            </div>
                            {tx.paymentType === 'credit' && (
                              <div className="mt-1 pt-1 border-t border-border/50">
                                <p className="text-muted-foreground">
                                  DP: {formatRupiah(tx.dp || 0)} | Sisa: {formatRupiah(tx.grandTotal - (tx.dp || 0))}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Cash In Transactions */}
                  {sessionCashIn.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">💵 Kas Masuk ({sessionCashIn.length})</p>
                      <div className="space-y-1">
                        {sessionCashIn.map(ci => (
                          <div key={ci.id} className="bg-background rounded p-2 text-xs">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-foreground">{ci.depositorName}</p>
                                <p className="text-muted-foreground">{ci.description}</p>
                              </div>
                              <p className="font-bold text-green-600">{formatRupiah(ci.amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Expense Transactions */}
                  {sessionExp.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">💸 Pengeluaran ({sessionExp.length})</p>
                      <div className="space-y-1">
                        {sessionExp.map(exp => (
                          <div key={exp.id} className="bg-background rounded p-2 text-xs">
                            <div className="flex justify-between items-center">
                              <p className="text-muted-foreground">{exp.description}</p>
                              <p className="font-bold text-red-600">{formatRupiah(exp.amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Debt Payments */}
                  {(() => {
                    const debtPayments = debts
                      .filter(d => d.unitId === activeSession.unitId)
                      .flatMap(d => 
                        (d.payments || [])
                          .filter(p => new Date(p.date) >= new Date(activeSession.startTime) && 
                                       (!activeSession.endTime || new Date(p.date) <= new Date(activeSession.endTime)))
                          .map(p => ({
                            ...p,
                            customerName: d.customerName,
                            debtId: d.id
                          }))
                      );
                    
                    return debtPayments.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Pelunasan Piutang ({debtPayments.length})</p>
                        <div className="space-y-1">
                          {debtPayments.map((payment, idx) => (
                            <div key={`${payment.debtId}-${idx}`} className="bg-background rounded p-2 text-xs">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-foreground">{payment.customerName}</p>
                                  <p className="text-muted-foreground">{formatDateTime(payment.date)}</p>
                                </div>
                                <p className="font-bold text-indigo-600">{formatRupiah(payment.amount)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Empty State */}
                  {sessionTx.length === 0 && sessionCashIn.length === 0 && sessionExp.length === 0 && (() => {
                    const debtPayments = debts
                      .filter(d => d.unitId === activeSession.unitId)
                      .flatMap(d => (d.payments || [])
                        .filter(p => new Date(p.date) >= new Date(activeSession.startTime) && 
                                       (!activeSession.endTime || new Date(p.date) <= new Date(activeSession.endTime))));
                    return debtPayments.length === 0;
                  })() && (
                    <div className="text-center text-muted-foreground py-4">
                      <p className="text-sm">Belum ada transaksi dalam sesi ini</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Export Buttons */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">Export Laporan Sesi</p>
                <ExportButtons 
                  data={sessionReportData} 
                  filename={`laporan-kasir-${activeSession.id.slice(-6).toUpperCase()}`} 
                  title={`Laporan Kasir ${currentUser?.name} - ${formatDateTime(new Date().toISOString())}`}
                />
              </div>
              
              {/* Print Session Report */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">Cetak Laporan Sesi</p>
                <PrintButtons 
                  sessionData={{
                    cashierName: currentUser?.name,
                    unitName: units.find(u => u.id === activeSession.unitId)?.name,
                    sessionId: activeSession.id.slice(-6).toUpperCase(),
                    openTime: formatDateTime(activeSession.startTime),
                    openingCash: activeSession.openingCash,
                    totalSales: sessionSales,
                    totalCashIn: sessionCashInTotal,
                    totalExpenses: sessionExpTotal,
                    totalPaidToday: sessionReportData
                      .filter(row => row['Tipe'] === 'Pelunasan Piutang')
                      .reduce((sum, row) => sum + (row['Jumlah'] || 0), 0),
                    finalBalance: activeSession.openingCash + sessionSales + sessionCashInTotal - sessionExpTotal,
                    transactionCount: sessionTx.length
                  }}
                  type="session"
                />
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setShowCashierClose(false)} className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium">Batal</button>
                <button onClick={handleCloseSession} className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium">Tutup Kasir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAddProduct(false)}>
          <div className="bg-card rounded-2xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Tambah Stok Produk</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowStockHistory(true)}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium text-foreground transition-colors"
                >
                  📊 Riwayat
                </button>
                <button onClick={() => setShowAddProduct(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Pilih Produk *</label>
                <select
                  value={addStockProduct.productId}
                  onChange={e => setAddStockProduct(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Pilih Produk --</option>
                  {unitProducts.map(product => {
                    const currentStock = getProductStock(product);
                    return (
                      <option key={product.id} value={product.id}>
                        {product.name} - Stok: {currentStock} {product.satuan || 'pcs'}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Jumlah Stok Tambahan *</label>
                <input
                  type="number"
                  value={addStockProduct.additionalStock}
                  onChange={e => setAddStockProduct(prev => ({ ...prev, additionalStock: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  min="1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Catatan</label>
                <textarea
                  value={addStockProduct.notes}
                  onChange={e => setAddStockProduct(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Catatan tambahan (opsional)"
                  rows={3}
                />
              </div>

              {addStockProduct.productId && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-foreground mb-2">Informasi Produk:</p>
                  {(() => {
                    const selectedProduct = products.find(p => p.id === addStockProduct.productId);
                    const currentStock = selectedProduct ? getProductStock(selectedProduct) : 0;
                    return selectedProduct ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <p className="text-muted-foreground">Nama:</p>
                          <p className="text-foreground font-medium">{selectedProduct.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <p className="text-muted-foreground">Satuan:</p>
                          <p className="text-foreground font-medium">{selectedProduct.satuan || 'pcs'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <p className="text-muted-foreground">Stok Saat Ini:</p>
                          <p className="text-foreground font-medium">{currentStock} {selectedProduct.satuan || 'pcs'}</p>
                        </div>
                        {addStockProduct.additionalStock > 0 && (
                          <>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <p className="text-muted-foreground">Ditambahkan:</p>
                              <p className="text-success font-medium">+{addStockProduct.additionalStock} {selectedProduct.satuan || 'pcs'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <p className="text-muted-foreground">Stok Setelah:</p>
                              <p className="text-primary font-bold">{currentStock + addStockProduct.additionalStock} {selectedProduct.satuan || 'pcs'}</p>
                            </div>
                          </>
                        )}
                      </>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleAddProduct} className="flex-1 py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Tambah Stok
                </button>
                <button onClick={() => setShowAddProduct(false)} className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {showStockHistory && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4" onClick={() => setShowStockHistory(false)}>
          <div className="bg-card rounded-2xl shadow-float w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">📊 Riwayat Penambahan Stok</h3>
              <div className="flex items-center gap-2">
                {stockHistory.length > 0 && (
                  <>
                    <button 
                      onClick={handleExportStockHistoryToGoogleSheets}
                      className="px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Cloud className="w-4 h-4" />
                      Google Sheets
                    </button>
                    <button 
                      onClick={handleExportStockHistoryToPDF}
                      className="px-3 py-1.5 bg-info/10 hover:bg-info/20 text-info rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </>
                )}
                <button onClick={() => setShowStockHistory(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6">
              {stockHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Belum ada riwayat penambahan stok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockHistory.map((entry) => {
                    const product = products.find(p => p.id === entry.productId);
                    const currentStock = product ? getProductStock(product) : 0;
                    return (
                      <div key={entry.id} className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{entry.productName}</h4>
                            <p className="text-xs text-muted-foreground">Kasir: {entry.cashierName}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              +{entry.addedStock}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Stok Sebelumnya: </span>
                            <span className="font-medium">{entry.oldStock}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stok Setelah: </span>
                            <span className="font-bold text-success">{entry.newStock}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                          <div>
                            <span className="text-muted-foreground">Stok Saat Ini: </span>
                            <span className="font-medium text-info">{currentStock}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Satuan: </span>
                            <span className="font-medium">{product?.satuan || 'pcs'}</span>
                          </div>
                        </div>
                        {entry.notes && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">Catatan: {entry.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border">
              <button 
                onClick={() => setShowStockHistory(false)}
                className="w-full py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
