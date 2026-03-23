import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  role: 'admin' | 'cashier';
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
  cashierSessions: CashierSession[];
  storeSettings: StoreSettings;
  cart: { productId: string; qty: number }[];
}

interface AppContextType extends AppState {
  login: (username: string, password: string) => User | null;
  logout: () => void;
  completeSetup: (adminName: string, adminUsername: string, adminPassword: string, storeName: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
  updateUser: (user: User) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  deleteUnit: (id: string) => void;
  updateUnit: (unit: Unit) => void;
  addProduct: (product: Omit<Product, 'id' | 'soldStock' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartQty: (productId: string, qty: number) => void;
  submitTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => Transaction;
  addDebt: (debt: Omit<Debt, 'id' | 'payments' | 'status'>) => void;
  payDebt: (debtId: string, amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addCashIn: (cashIn: Omit<CashIn, 'id'>) => void;
  openCashierSession: (cashierId: string, unitId: string, openingCash: number) => void;
  closeCashierSession: (sessionId: string, closingCash: number) => void;
  getActiveSession: (cashierId: string) => CashierSession | undefined;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  getProductStock: (p: Product) => number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'pos-kasir-pro';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    isSetup: false,
    currentUser: null,
    users: [],
    units: [],
    products: [],
    transactions: [],
    debts: [],
    expenses: [],
    cashIns: [],
    cashierSessions: [],
    storeSettings: { storeName: '', phone: '', address: '', appsScriptUrl: '', recoveryEmail: '' },
    cart: [],
  };
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    const { currentUser, cart, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const login = useCallback((username: string, password: string): User | null => {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) update({ currentUser: user });
    return user || null;
  }, [state.users, update]);

  const logout = useCallback(() => update({ currentUser: null, cart: [] }), [update]);

  const completeSetup = useCallback((adminName: string, adminUsername: string, adminPassword: string, storeName: string) => {
    const adminUser: User = { id: genId(), name: adminName, username: adminUsername, password: adminPassword, role: 'admin' };
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
      users: [adminUser, cashierUser],
      units: [firstUnit],
      storeSettings: { storeName, phone: '', address: '', appsScriptUrl: '', recoveryEmail: '' },
    }));
  }, []);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setState(p => ({ ...p, users: [...p.users, { ...user, id: genId() }] }));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setState(p => ({ ...p, users: p.users.filter(u => u.id !== id) }));
  }, []);

  const updateUser = useCallback((user: User) => {
    setState(p => ({ ...p, users: p.users.map(u => u.id === user.id ? user : u) }));
  }, []);

  const addUnit = useCallback((unit: Omit<Unit, 'id'>) => {
    setState(p => ({ ...p, units: [...p.units, { ...unit, id: genId() }] }));
  }, []);

  const deleteUnit = useCallback((id: string) => {
    setState(p => ({ ...p, units: p.units.filter(u => u.id !== id) }));
  }, []);

  const updateUnit = useCallback((unit: Unit) => {
    setState(p => ({ ...p, units: p.units.map(u => u.id === unit.id ? unit : u) }));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'soldStock' | 'updatedAt'>) => {
    setState(p => ({
      ...p,
      products: [...p.products, { ...product, id: genId(), soldStock: 0, updatedAt: new Date().toISOString() }],
    }));
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setState(p => ({
      ...p,
      products: p.products.map(pr => pr.id === product.id ? { ...product, updatedAt: new Date().toISOString() } : pr),
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState(p => ({ ...p, products: p.products.filter(pr => pr.id !== id) }));
  }, []);

  const addToCart = useCallback((productId: string, qty: number) => {
    setState(p => {
      const existing = p.cart.find(c => c.productId === productId);
      if (existing) {
        return { ...p, cart: p.cart.map(c => c.productId === productId ? { ...c, qty: c.qty + qty } : c) };
      }
      return { ...p, cart: [...p.cart, { productId, qty }] };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState(p => ({ ...p, cart: p.cart.filter(c => c.productId !== productId) }));
  }, []);

  const clearCart = useCallback(() => setState(p => ({ ...p, cart: [] })), []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    setState(p => ({ ...p, cart: p.cart.map(c => c.productId === productId ? { ...c, qty } : c) }));
  }, []);

  const submitTransaction = useCallback((tx: Omit<Transaction, 'id' | 'date'>): Transaction => {
    const newTx: Transaction = { ...tx, id: genId(), date: new Date().toISOString() };
    setState(p => {
      const updatedProducts = p.products.map(pr => {
        const item = tx.items.find(i => i.productId === pr.id);
        if (item) return { ...pr, soldStock: pr.soldStock + item.qty, updatedAt: new Date().toISOString() };
        return pr;
      });
      const updatedSessions = p.cashierSessions.map(s => {
        if (s.cashierId === tx.cashierId && s.isOpen) {
          return { ...s, transactions: [...s.transactions, newTx.id] };
        }
        return s;
      });
      return {
        ...p,
        transactions: [...p.transactions, newTx],
        products: updatedProducts,
        cashierSessions: updatedSessions,
        cart: [],
      };
    });
    return newTx;
  }, []);

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'payments' | 'status'>) => {
    setState(p => ({
      ...p,
      debts: [...p.debts, { ...debt, id: genId(), payments: [], status: 'unpaid' }],
    }));
  }, []);

  const payDebt = useCallback((debtId: string, amount: number) => {
    setState(p => ({
      ...p,
      debts: p.debts.map(d => {
        if (d.id !== debtId) return d;
        const newPayments = [...d.payments, { date: new Date().toISOString(), amount }];
        const totalPaid = newPayments.reduce((s, py) => s + py.amount, 0) + d.dpAmount;
        const remaining = d.totalAmount - totalPaid;
        return {
          ...d,
          payments: newPayments,
          remainingAmount: Math.max(0, remaining),
          status: remaining <= 0 ? 'paid' as const : 'partial' as const,
        };
      }),
    }));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setState(p => {
      const newExp = { ...expense, id: genId() };
      const updatedSessions = p.cashierSessions.map(s => {
        if (s.cashierId === expense.cashierId && s.isOpen) {
          return { ...s, expenses: [...s.expenses, newExp.id] };
        }
        return s;
      });
      return { ...p, expenses: [...p.expenses, newExp], cashierSessions: updatedSessions };
    });
  }, []);

  const addCashIn = useCallback((cashIn: Omit<CashIn, 'id'>) => {
    setState(p => {
      const newCashIn = { ...cashIn, id: genId() };
      const updatedSessions = p.cashierSessions.map(s => {
        if (s.id === cashIn.sessionId) {
          return { ...s, cashIns: [...(s.cashIns || []), newCashIn.id] };
        }
        return s;
      });
      return { ...p, cashIns: [...p.cashIns, newCashIn], cashierSessions: updatedSessions };
    });
  }, []);

  const openCashierSession = useCallback((cashierId: string, unitId: string, openingCash: number) => {
    console.log('openCashierSession called:', { cashierId, unitId, openingCash });
    const newSession = {
      id: genId(), 
      cashierId, 
      unitId, 
      openingCash,
      startTime: new Date().toISOString(), 
      isOpen: true, 
      transactions: [], 
      expenses: [], 
      cashIns: [],
    };
    console.log('Creating new session:', newSession);
    
    setState(p => ({
      ...p,
      cashierSessions: [...p.cashierSessions, newSession],
    }));
  }, []);

  const closeCashierSession = useCallback((sessionId: string, closingCash: number) => {
    setState(p => ({
      ...p,
      cashierSessions: p.cashierSessions.map(s =>
        s.id === sessionId ? { ...s, closingCash, endTime: new Date().toISOString(), isOpen: false } : s
      ),
    }));
  }, []);

  const getActiveSession = useCallback((cashierId: string) => {
    const session = state.cashierSessions.find(s => s.cashierId === cashierId && s.isOpen);
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
      addUnit, deleteUnit, updateUnit, addProduct, updateProduct, deleteProduct,
      addToCart, removeFromCart, clearCart, updateCartQty,
      submitTransaction, addDebt, payDebt, addExpense, addCashIn,
      openCashierSession, closeCashierSession, getActiveSession,
      updateStoreSettings, getProductStock,
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
