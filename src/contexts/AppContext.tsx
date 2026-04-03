import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  autoSyncToSheets,
  syncTransactionToSheets,
  syncProductToSheets,
  syncDebtToSheets,
  syncCashInToSheets,
  syncExpenseToSheets
} from '@/lib/googleSheets';
import * as laravelApi from '@/lib/laravelApi';
import { toast } from 'sonner';

export interface Product {
  id: string;
  supplier: string;
  name: string;
  unit: string;
  unitId: string;
  satuan: string;
  hpp: number;
  price: number;
  initialStock: number;
  addedStock: number;
  soldStock: number;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  address?: string;
  cashierId?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'cashier' | 'superadmin';
  name: string;
  unitId?: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  hpp: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: TransactionItem[];
  total: number;
  discount: number;
  grandTotal: number;
  paymentType: 'cash' | 'transfer' | 'credit';
  cashPaid?: number;
  change?: number;
  dp?: number;
  customerName: string;
  customerPhone: string;
  unitId: string;
  unitName: string;
  cashierId: string;
  cashierName: string;
}

export interface Debt {
  id: string;
  transactionId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  dpAmount: number;
  remainingAmount: number;
  date: string;
  unitId: string;
  unitName: string;
  status: 'unpaid' | 'partial' | 'paid';
  payments: { date: string; amount: number }[];
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  unitId: string;
  cashierId: string;
}

export interface CashIn {
  id: string;
  date: string;
  description: string;
  amount: number;
  depositorName: string;
  unitId: string;
  unitName: string;
  cashierId: string;
  cashierName: string;
  sessionId: string;
}

export interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  addedStock: number;
  oldStock: number;
  newStock: number;
  notes: string;
  date: string;
  cashierName: string;
}

export interface CashierSession {
  id: string;
  cashierId: string;
  unitId: string;
  openingCash: number;
  closingCash?: number;
  startTime: string;
  endTime?: string;
  isOpen: boolean;
  transactions: string[];
  expenses: string[];
  cashIns: string[];
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  address: string;
  appsScriptUrl: string;
  spreadsheetUrl: string;
  recoveryEmail: string;
}

interface AppState {
  isSetup: boolean;
  currentUser: User | null;
  users: User[];
  units: Unit[];
  products: Product[];
  transactions: Transaction[];
  debts: Debt[];
  expenses: Expense[];
  cashIns: CashIn[];
  stockHistory: StockHistory[];
  cashierSessions: CashierSession[];
  storeSettings: StoreSettings;
  cart: { productId: string; qty: number }[];
}

interface AppContextType extends AppState {
  login: (username: string, password: string) => User | null;
  logout: () => void;
  completeSetup: (adminName: string, adminUsername: string, adminPassword: string, storeName: string) => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  addUnit: (unit: Omit<Unit, 'id'>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  updateUnit: (unit: Unit) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'soldStock' | 'updatedAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addStock: (productId: string, amount: number, notes: string, cashierName: string) => void;
  setProducts: (products: Product[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setDebts: (debts: Debt[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setCashIn: (cashIns: CashIn[]) => void;
  setStockHistory: (history: StockHistory[]) => void;
  addToCart: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartQty: (productId: string, qty: number) => void;
  submitTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => Promise<Transaction>;
  addDebt: (debt: Omit<Debt, 'id' | 'payments' | 'status'>) => Promise<void>;
  payDebt: (debtId: string, amount: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addCashIn: (cashIn: Omit<CashIn, 'id'>) => Promise<void>;
  openCashierSession: (cashierId: string, unitId: string, openingCash: number) => Promise<void>;
  closeCashierSession: (sessionId: string, closingCash: number) => Promise<void>;
  getActiveSession: (cashierId: string) => CashierSession | undefined;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  getProductStock: (p: Product) => number;
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'pos-kasir-pro';

const DEFAULT_STATE: AppState = {
  isSetup: false,
  currentUser: null,
  users: [],
  units: [],
  products: [],
  transactions: [],
  debts: [],
  expenses: [],
  cashIns: [],
  stockHistory: [],
  cashierSessions: [],
  storeSettings: { storeName: '', phone: '', address: '', appsScriptUrl: '', spreadsheetUrl: '', recoveryEmail: '' },
  cart: [],
};

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default state to ensure all properties exist
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {}
  return DEFAULT_STATE;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data from Laravel API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [products, transactions, debts, expenses, cashIns, units] = await Promise.all([
          laravelApi.fetchProduk(),
          laravelApi.fetchTransaksi(),
          laravelApi.fetchPiutang(),
          laravelApi.fetchPengeluaran(),
          laravelApi.fetchKasMasuk(),
          laravelApi.fetchUnit(),
        ]);

        setState(prev => ({
          ...prev,
          products: products.map((p: any) => ({
            id: p.id,
            name: p.nama,
            sku: p.sku,
            price: Number(p.price),
            hpp: Number(p.hpp),
            initialStock: Number(p.stock),
            addedStock: 0,
            soldStock: 0,
            unitId: p.unit_id,
            categoryId: p.category_id,
            supplier: p.supplier,
            updatedAt: p.updated_at,
          })),
          transactions: transactions.map((t: any) => ({
             id: t.id,
             date: t.date,
             total: Number(t.grand_total),
             discount: Number(t.discount),
             grandTotal: Number(t.grand_total),
             paymentType: t.payment_type,
             cashPaid: Number(t.cash_paid),
             change: Number(t.cash_change),
             customerName: t.customer_name,
             customerPhone: t.customer_phone,
             unitId: t.unit_id,
           })),
           debts: debts.map((d: any) => ({
             id: d.id,
             customerName: d.customer_name,
             customerPhone: d.customer_phone,
             totalAmount: Number(d.total_amount),
             dpAmount: Number(d.paid_amount), // Simplified mapping
             remainingAmount: Number(d.remaining_amount),
             status: d.status,
             date: d.date,
             unitId: d.unit_id,
             payments: [], // In a real app, we'd fetch these too
           })),
           expenses: expenses.map((e: any) => ({
             id: e.id,
             description: e.description,
             amount: Number(e.amount),
             date: e.date,
             unitId: e.unit_id,
             cashierId: e.cashier_id?.toString(),
           })),
           cashIns: cashIns.map((c: any) => ({
             id: c.id,
             amount: Number(c.amount),
             description: c.description,
             date: c.date,
             cashierName: c.cashier_name,
             unitId: c.unit_id,
           })),
           units: units.map((u: any) => ({
             id: u.id,
             name: u.nama,
             address: u.alamat,
           })),
         }));
      } catch (err) {
        console.error('Failed to fetch data from Laravel API:', err);
        setError('Gagal memuat data dari server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const { currentUser, cart, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const setProducts = useCallback((products: Product[]) => update({ products }), [update]);
  const setTransactions = useCallback((transactions: Transaction[]) => update({ transactions }), [update]);
  const setDebts = useCallback((debts: Debt[]) => update({ debts }), [update]);
  const setExpenses = useCallback((expenses: Expense[]) => update({ expenses }), [update]);
  const setCashIn = useCallback((cashIns: CashIn[]) => update({ cashIns }), [update]);
  const setStockHistory = useCallback((stockHistory: StockHistory[]) => update({ stockHistory }), [update]);

  const login = useCallback((username: string, password: string): User | null => {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) update({ currentUser: user });
    return user || null;
  }, [state.users, update]);

  const logout = useCallback(() => update({ currentUser: null, cart: [] }), [update]);

  const completeSetup = useCallback((adminName: string, adminUsername: string, adminPassword: string, storeName: string) => {
    const adminUser: User = { id: genId(), name: adminName, username: adminUsername, password: adminPassword, role: 'admin' };
    const superAdminUser: User = { id: genId(), name: 'Super Admin', username: 'superadmin', password: 'superadmin', role: 'superadmin' };
    const firstUnit: Unit = { id: genId(), name: 'Unit Utama', address: '' };
    const cashierUser: User = { 
      id: genId(), 
      name: 'Kasir Default', 
      username: 'kasir', 
      password: 'kasir', 
      role: 'cashier',
      unitId: firstUnit.id 
    };
    setState(p => ({
      ...p,
      isSetup: true,
      users: [adminUser, superAdminUser, cashierUser],
      units: [firstUnit],
      storeSettings: { storeName, phone: '', address: '', appsScriptUrl: '', spreadsheetUrl: '', recoveryEmail: '' },
    }));
  }, []);

  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    const newId = genId();
    setState(p => ({ ...p, users: [...(p.users || []), { ...user, id: newId }] }));
    // In a real app, we'd sync this to Laravel too
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setState(p => ({ ...p, users: (p.users || []).filter(u => u.id !== id) }));
  }, []);

  const updateUser = useCallback(async (user: User) => {
    setState(p => ({ ...p, users: (p.users || []).map(u => u.id === user.id ? user : u) }));
  }, []);

  const addUnit = useCallback(async (unit: Omit<Unit, 'id'>) => {
    const newId = genId();
    setState(p => ({ ...p, units: [...(p.units || []), { ...unit, id: newId }] }));
    try {
      await laravelApi.createUnit({ id: newId, nama: unit.name, alamat: unit.address });
      toast.success('Unit berhasil disimpan ke server');
    } catch (err) {
      console.error('Failed to sync unit to Laravel:', err);
      toast.error('Unit disimpan lokal, gagal sinkron ke server');
    }
  }, []);

  const deleteUnit = useCallback(async (id: string) => {
    setState(p => ({ ...p, units: (p.units || []).filter(u => u.id !== id) }));
    try {
      await laravelApi.deleteUnit(id);
      toast.success('Unit berhasil dihapus dari server');
    } catch (err) {
      console.error('Failed to delete unit from Laravel:', err);
    }
  }, []);

  const updateUnit = useCallback(async (unit: Unit) => {
    setState(p => ({ ...p, units: (p.units || []).map(u => u.id === unit.id ? unit : u) }));
    try {
      await laravelApi.updateUnit(unit.id, { nama: unit.name, alamat: unit.address });
      toast.success('Unit berhasil diperbarui di server');
    } catch (err) {
      console.error('Failed to update unit to Laravel:', err);
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'soldStock' | 'updatedAt'>) => {
    const newId = genId();
    const newProduct: Product = { ...product, id: newId, soldStock: 0, updatedAt: new Date().toISOString() };
    
    // Optimistic update
    setState(p => ({
      ...p,
      products: [...(p.products || []), newProduct],
    }));

    try {
      await laravelApi.createProduk({
        id: newId,
        nama: product.name,
        sku: product.sku,
        price: product.price,
        hpp: product.hpp,
        stock: product.initialStock,
        category_id: product.categoryId,
        unit_id: product.unitId,
        supplier: product.supplier,
      });
      toast.success('Produk berhasil ditambahkan ke server');
    } catch (err) {
      console.error('Failed to sync product to Laravel:', err);
      toast.error('Produk disimpan lokal, gagal sinkron ke server');
    }
  }, []);

  const updateProduct = useCallback(async (product: Product) => {
    setState(p => ({
      ...p,
      products: (p.products || []).map(pr => pr.id === product.id ? { ...product, updatedAt: new Date().toISOString() } : pr),
    }));

    try {
      await laravelApi.updateProduk(product.id, {
        nama: product.name,
        sku: product.sku,
        price: product.price,
        hpp: product.hpp,
        stock: product.initialStock + product.addedStock - product.soldStock,
        category_id: product.categoryId,
        unit_id: product.unitId,
        supplier: product.supplier,
      });
      toast.success('Produk berhasil diperbarui di server');
    } catch (err) {
      console.error('Failed to update product to Laravel:', err);
      toast.error('Perubahan disimpan lokal, gagal sinkron ke server');
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setState(p => ({ ...p, products: (p.products || []).filter(pr => pr.id !== id) }));

    try {
      await laravelApi.deleteProduk(id);
      toast.success('Produk berhasil dihapus dari server');
    } catch (err) {
      console.error('Failed to delete product from Laravel:', err);
      toast.error('Produk dihapus lokal, gagal hapus dari server');
    }
  }, []);

  const addStock = useCallback((productId: string, amount: number, notes: string, cashierName: string) => {
    setState(p => {
      const product = (p.products || []).find(pr => pr.id === productId);
      if (!product) return p;

      const oldStock = product.initialStock + product.addedStock - product.soldStock;
      const newStock = oldStock + amount;

      const updatedProduct = {
        ...product,
        addedStock: product.addedStock + amount,
        updatedAt: new Date().toISOString()
      };

      const historyEntry: StockHistory = {
        id: genId(),
        productId,
        productName: product.name,
        addedStock: amount,
        oldStock,
        newStock,
        notes,
        date: new Date().toISOString(),
        cashierName
      };

      // Auto-sync ke Google Sheets
      syncProductToSheets(updatedProduct).catch(error => {
        console.error('Failed to sync product to sheets:', error);
      });

      return {
        ...p,
        products: (p.products || []).map(pr => pr.id === productId ? updatedProduct : pr),
        stockHistory: [historyEntry, ...(p.stockHistory || [])]
      };
    });
  }, []);

  const addToCart = useCallback((productId: string, qty: number) => {
    setState(p => {
      const existing = (p.cart || []).find(c => c.productId === productId);
      if (existing) {
        return { ...p, cart: (p.cart || []).map(c => c.productId === productId ? { ...c, qty: c.qty + qty } : c) };
      }
      return { ...p, cart: [...(p.cart || []), { productId, qty }] };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState(p => ({ ...p, cart: (p.cart || []).filter(c => c.productId !== productId) }));
  }, []);

  const clearCart = useCallback(() => setState(p => ({ ...p, cart: [] })), []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    setState(p => ({ ...p, cart: (p.cart || []).map(c => c.productId === productId ? { ...c, qty } : c) }));
  }, []);

  const submitTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    const newId = genId();
    const newTx: Transaction = { ...tx, id: newId, date: new Date().toISOString() };
    
    // Optimistic update
    setState(p => {
      const updatedProducts = (p.products || []).map(pr => {
        const item = tx.items.find(i => i.productId === pr.id);
        if (item) return { ...pr, soldStock: pr.soldStock + item.qty, updatedAt: new Date().toISOString() };
        return pr;
      });
      const updatedSessions = (p.cashierSessions || []).map(s => {
        if (s.cashierId === tx.cashierId && s.isOpen) {
          return { ...s, transactions: [...(s.transactions || []), newTx.id] };
        }
        return s;
      });
      return {
        ...p,
        transactions: [...(p.transactions || []), newTx],
        products: updatedProducts,
        cashierSessions: updatedSessions,
        cart: [],
      };
    });
    
    try {
      await laravelApi.createTransaksi({
        id: newId,
        date: newTx.date,
        cashier_name: newTx.cashierName,
        customer_name: newTx.customerName,
        customer_phone: newTx.customerPhone,
        subtotal: newTx.total,
        discount: newTx.discount,
        grand_total: newTx.grandTotal,
        payment_type: newTx.paymentType,
        cash_paid: newTx.cashPaid,
        cash_change: newTx.change,
        dp: newTx.dp,
        unit_id: newTx.unitId,
        items: newTx.items.map(item => ({
          id: genId(),
          product_id: item.productId,
          product_name: item.productName,
          qty: item.qty,
          price: item.price,
          subtotal: item.subtotal,
        })),
      });
      toast.success('Transaksi berhasil disimpan ke server');
    } catch (err) {
      console.error('Failed to sync transaction to Laravel:', err);
      toast.error('Transaksi disimpan lokal, gagal sinkron ke server');
    }

    // Auto-sync ke Google Sheets (tetap dipertahankan sebagai backup)
    syncTransactionToSheets(newTx).catch(error => {
      console.error('Failed to sync transaction to sheets:', error);
    });
    
    return newTx;
  }, []);

  const addDebt = useCallback(async (debt: Omit<Debt, 'id' | 'payments' | 'status'>) => {
    const newId = genId();
    const newDebt = { ...debt, id: newId, payments: [], status: 'unpaid' as const };
    
    setState(p => ({
      ...p,
      debts: [...(p.debts || []), newDebt],
    }));

    try {
      await laravelApi.createPiutang({
        id: newId,
        customer_name: debt.customerName,
        customer_phone: debt.customerPhone,
        total_amount: debt.totalAmount,
        paid_amount: debt.dpAmount,
        remaining_amount: debt.remainingAmount,
        status: 'unpaid',
        date: debt.date,
        unit_id: debt.unitId,
      });
      toast.success('Piutang berhasil disimpan ke server');
    } catch (err) {
      console.error('Failed to sync debt to Laravel:', err);
      toast.error('Piutang disimpan lokal, gagal sinkron ke server');
    }
    
    // Auto-sync ke Google Sheets
    syncDebtToSheets(newDebt).catch(error => {
      console.error('Failed to sync debt to sheets:', error);
    });
  }, []);

  const payDebt = useCallback(async (debtId: string, amount: number) => {
    setState(p => ({
      ...p,
      debts: (p.debts || []).map(d => {
        if (d.id !== debtId) return d;
        const newPayments = [...(d.payments || []), { date: new Date().toISOString(), amount }];
        const totalPaid = newPayments.reduce((s, py) => s + py.amount, 0) + d.dpAmount;
        const remaining = d.totalAmount - totalPaid;
        const updatedDebt = {
          ...d,
          payments: newPayments,
          remainingAmount: Math.max(0, remaining),
          status: remaining <= 0 ? 'paid' as const : 'partial' as const,
        };

        // Sync ke Laravel
        laravelApi.updatePiutang(debtId, {
          paid_amount: totalPaid,
          remaining_amount: updatedDebt.remainingAmount,
          status: updatedDebt.status,
        }).catch(err => console.error('Failed to update debt to Laravel:', err));

        // Auto-sync ke Google Sheets
        syncDebtToSheets(updatedDebt).catch(error => {
          console.error('Failed to sync debt payment to sheets:', error);
        });

        return updatedDebt;
      }),
    }));
  }, []);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const newId = genId();
    const newExp = { ...expense, id: newId };
    setState(p => {
      const updatedSessions = (p.cashierSessions || []).map(s => {
        if (s.cashierId === expense.cashierId && s.isOpen) {
          return { ...s, expenses: [...(s.expenses || []), newExp.id] };
        }
        return s;
      });
      return { ...p, expenses: [...(p.expenses || []), newExp], cashierSessions: updatedSessions };
    });
    
    try {
      await laravelApi.createPengeluaran({
        id: newId,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        unit_id: expense.unitId,
        cashier_id: null, // User ID if available
      });
      toast.success('Pengeluaran berhasil disimpan ke server');
    } catch (err) {
      console.error('Failed to sync expense to Laravel:', err);
      toast.error('Pengeluaran disimpan lokal, gagal sinkron ke server');
    }

    // Auto-sync ke Google Sheets
    syncExpenseToSheets(newExp).catch(error => {
      console.error('Failed to sync expense to sheets:', error);
    });
  }, []);

  const addCashIn = useCallback(async (cashIn: Omit<CashIn, 'id'>) => {
    const newId = genId();
    const newCashIn = { ...cashIn, id: newId };
    setState(p => {
      const updatedSessions = (p.cashierSessions || []).map(s => {
        if (s.id === cashIn.sessionId) {
          return { ...s, cashIns: [...(s.cashIns || []), newCashIn.id] };
        }
        return s;
      });
      return { ...p, cashIns: [...(p.cashIns || []), newCashIn], cashierSessions: updatedSessions };
    });
    
    try {
      await laravelApi.createKasMasuk({
        id: newId,
        amount: cashIn.amount,
        description: cashIn.description,
        date: cashIn.date,
        cashier_name: cashIn.cashierName,
        unit_id: cashIn.unitId,
      });
      toast.success('Kas masuk berhasil disimpan ke server');
    } catch (err) {
      console.error('Failed to sync cash in to Laravel:', err);
      toast.error('Kas masuk disimpan lokal, gagal sinkron ke server');
    }

    // Auto-sync ke Google Sheets
    syncCashInToSheets(newCashIn).catch(error => {
      console.error('Failed to sync cash in to sheets:', error);
    });
  }, []);

  const openCashierSession = useCallback(async (cashierId: string, unitId: string, openingCash: number) => {
    console.log('openCashierSession called:', { cashierId, unitId, openingCash });
    const newId = genId();
    const newSession = {
      id: newId, 
      cashierId, 
      unitId, 
      openingCash,
      startTime: new Date().toISOString(), 
      isOpen: true, 
      transactions: [], 
      expenses: [], 
      cashIns: [],
    };
    
    setState(p => ({
      ...p,
      cashierSessions: [...(p.cashierSessions || []), newSession],
    }));

    try {
      await laravelApi.createSession({
        id: newId,
        cashier_id: null, // Should map to user ID
        unit_id: unitId,
        opening_time: newSession.startTime,
        opening_cash: openingCash,
        status: 'open',
      });
      toast.success('Sesi kasir berhasil dibuka di server');
    } catch (err) {
      console.error('Failed to sync session to Laravel:', err);
    }
  }, []);

  const closeCashierSession = useCallback(async (sessionId: string, closingCash: number) => {
    setState(p => ({
      ...p,
      cashierSessions: (p.cashierSessions || []).map(s =>
        s.id === sessionId ? { ...s, closingCash, endTime: new Date().toISOString(), isOpen: false } : s
      ),
    }));

    try {
      await laravelApi.updateSession(sessionId, {
        closing_time: new Date().toISOString(),
        closing_cash: closingCash,
        status: 'closed',
      });
      toast.success('Sesi kasir berhasil ditutup di server');
    } catch (err) {
      console.error('Failed to update session to Laravel:', err);
    }
  }, []);

  const getActiveSession = useCallback((cashierId: string) => {
    const session = (state.cashierSessions || []).find(s => s.cashierId === cashierId && s.isOpen);
    console.log('getActiveSession for', cashierId, ':', session);
    console.log('All sessions:', state.cashierSessions);
    return session;
  }, [state.cashierSessions]);

  const updateStoreSettings = useCallback((settings: Partial<StoreSettings>) => {
    setState(p => ({ ...p, storeSettings: { ...p.storeSettings, ...settings } }));
  }, []);

  const getProductStock = useCallback((p: Product) => p.initialStock + p.addedStock - p.soldStock, []);

  return (
    <AppContext.Provider value={{
      ...state, login, logout, completeSetup, addUser, deleteUser, updateUser,
      addUnit, deleteUnit, updateUnit, addProduct, updateProduct, deleteProduct, addStock,
      setProducts, setTransactions, setDebts, setExpenses, setCashIn, setStockHistory,
      addToCart, removeFromCart, clearCart, updateCartQty,
      submitTransaction, addDebt, payDebt, addExpense, addCashIn,
      openCashierSession, closeCashierSession, getActiveSession,
      updateStoreSettings, getProductStock,
      loading, error,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be within AppProvider');
  return ctx;
}
