import React, { useState, useMemo, useRef } from 'react';
import { useApp, Product, Transaction } from '@/contexts/AppContext';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { 
  ShoppingCart, Plus, Minus, X, Search, DollarSign, CreditCard, Banknote, 
  Receipt, Package, LogOut, Store, Wallet, TrendingDown, FileText, 
  Printer, Download, MessageSquare, Clock, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function CashierPOS() {
  const { 
    currentUser, products, units, cart, addToCart, removeFromCart, clearCart, updateCartQty,
    submitTransaction, addDebt, addExpense, logout, getProductStock, storeSettings,
    openCashierSession, closeCashierSession, getActiveSession, cashierSessions,
    transactions, expenses, debts, payDebt
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showDebtMenu, setShowDebtMenu] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Transaction | null>(null);
  const [showCashierOpen, setShowCashierOpen] = useState(false);
  const [showCashierClose, setShowCashierClose] = useState(false);
  const [activePage, setActivePage] = useState<'pos' | 'expense' | 'debt'>('pos');

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

  const userUnit = units.find(u => u.id === currentUser?.unitId);
  const activeSession = currentUser ? getActiveSession(currentUser.id) : undefined;

  const unitProducts = useMemo(() => {
    return products.filter(p => p.unitId === currentUser?.unitId);
  }, [products, currentUser]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return unitProducts;
    const q = searchQuery.toLowerCase();
    return unitProducts.filter(p => p.name.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q));
  }, [unitProducts, searchQuery]);

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

  // Session report data
  const sessionTx = activeSession ? transactions.filter(t => activeSession.transactions.includes(t.id)) : [];
  const sessionExp = activeSession ? expenses.filter(e => activeSession.expenses.includes(e.id)) : [];
  const sessionSales = sessionTx.reduce((s, t) => s + t.grandTotal, 0);
  const sessionExpTotal = sessionExp.reduce((s, e) => s + e.amount, 0);

  if (!activeSession && !showCashierOpen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-elevated p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl primary-gradient flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Buka Kasir</h2>
          <p className="text-muted-foreground text-sm mb-6">Masukkan modal awal untuk memulai</p>
          <div className="mb-4">
            <input type="number" value={openingCash || ''} onChange={e => setOpeningCash(Number(e.target.value))}
              placeholder="Modal awal (Rp)" className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={() => { setShowCashierOpen(true); handleOpenSession(); }}
            className="w-full py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90">Buka Kasir</button>
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
          {['pos', 'expense', 'debt'].map(page => (
            <button key={page} onClick={() => setActivePage(page as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePage === page ? 'primary-gradient text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
              {page === 'pos' ? 'Kasir' : page === 'expense' ? 'Pengeluaran' : 'Piutang'}
            </button>
          ))}
          <button onClick={() => setShowCashierClose(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20">
            <Clock className="w-3 h-3 inline mr-1" />Tutup Kasir
          </button>
          <button onClick={logout} className="p-2 rounded-lg hover:bg-muted"><LogOut className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </header>

      {activePage === 'pos' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Products */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
              {filteredProducts.map(p => {
                const stock = getProductStock(p);
                const inCart = cart.find(c => c.productId === p.id);
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
                    <p className="text-xs text-muted-foreground">{p.supplier}</p>
                    <p className="text-sm font-bold text-primary mt-1">{formatRupiah(p.price)}</p>
                    <p className="text-xs text-muted-foreground">Stok: {stock}</p>
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
              {cartItems.map(c => (
                <div key={c.productId} className="bg-muted/50 rounded-lg p-3 animate-scale-in">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{c.product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatRupiah(c.product.price)}</p>
                    </div>
                    <button onClick={() => removeFromCart(c.productId)} className="p-1 rounded hover:bg-destructive/10">
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => c.qty > 1 ? updateCartQty(c.productId, c.qty - 1) : removeFromCart(c.productId)}
                        className="w-7 h-7 rounded-lg bg-card flex items-center justify-center hover:bg-muted">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-foreground w-8 text-center">{c.qty}</span>
                      <button onClick={() => updateCartQty(c.productId, c.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-card flex items-center justify-center hover:bg-muted">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground">{formatRupiah(c.product.price * c.qty)}</p>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Keranjang kosong</p>
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
          <div className="max-w-2xl mx-auto">
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

            <div className="p-4 border-t border-border grid grid-cols-2 gap-2">
              <button onClick={handlePrint} className="flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20">
                <Printer className="w-4 h-4" /> Cetak
              </button>
              <button onClick={handleDownloadInvoice} className="flex items-center justify-center gap-2 py-2.5 bg-info/10 text-info rounded-lg text-sm font-medium hover:bg-info/20">
                <Download className="w-4 h-4" /> Download
              </button>
              {showInvoice.customerPhone && (
                <button onClick={handleWhatsApp} className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-success/10 text-success rounded-lg text-sm font-medium hover:bg-success/20">
                  <MessageSquare className="w-4 h-4" /> Kirim WhatsApp
                </button>
              )}
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
                <div className="flex justify-between"><span className="text-muted-foreground">Total Pengeluaran</span><span className="text-destructive font-medium">{formatRupiah(sessionExpTotal)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border font-bold">
                  <span className="text-foreground">Saldo Akhir</span>
                  <span className="text-primary">{formatRupiah(activeSession.openingCash + sessionSales - sessionExpTotal)}</span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Jumlah Transaksi</span><span className="text-foreground">{sessionTx.length}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCashierClose(false)} className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium">Batal</button>
                <button onClick={handleCloseSession} className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium">Tutup Kasir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
