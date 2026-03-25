import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  LayoutDashboard, Package, Users, Receipt, FileText, Settings, LogOut, 
  CreditCard, Store, ChevronLeft, ChevronRight, AlertTriangle, Menu, DollarSign
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Produk & Unit', icon: Package },
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'transactions', label: 'Transaksi', icon: Receipt },
  { id: 'debts', label: 'Piutang', icon: CreditCard },
  { id: 'cashin', label: 'Kas Masuk', icon: DollarSign },
  { id: 'reports', label: 'Laporan', icon: FileText },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

interface AdminLayoutProps {
  children: (activePage: string) => React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout, storeSettings, products, getProductStock } = useApp();
  const [activePage, setActivePage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const lowStockProducts = products.filter(p => getProductStock(p) <= 5 && getProductStock(p) > 0);
  const outOfStockProducts = products.filter(p => getProductStock(p) <= 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      
      <aside className={`sidebar-gradient text-sidebar-fg flex flex-col fixed lg:static z-50 h-full transition-all duration-300 
        ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`flex items-center gap-3 p-5 border-b border-sidebar-border ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-lg primary-gradient flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-primary-foreground truncate">POS KASIR PRO</h1>
              <p className="text-xs text-sidebar-fg/60 truncate">{storeSettings.storeName}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { 
              console.log('Settings button clicked:', item.id);
              setActivePage(item.id); 
              setMobileOpen(false); 
            }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${activePage === item.id ? 'bg-sidebar-active text-primary-foreground' : 'text-sidebar-fg hover:bg-sidebar-hover'} 
                ${collapsed ? 'justify-center' : ''}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.id === 'products' && (lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                <span className="ml-auto w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                  {lowStockProducts.length + outOfStockProducts.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button onClick={() => setCollapsed(!collapsed)} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-fg hover:bg-sidebar-hover transition-all justify-center lg:justify-start">
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /><span>Collapse</span></>}
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-sidebar-hover transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-muted rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-foreground capitalize">{menuItems.find(m => m.id === activePage)?.label}</h2>
          </div>
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-accent">
                {outOfStockProducts.length > 0 && `${outOfStockProducts.length} habis`}
                {outOfStockProducts.length > 0 && lowStockProducts.length > 0 && ', '}
                {lowStockProducts.length > 0 && `${lowStockProducts.length} menipis`}
              </span>
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children(activePage)}
        </div>
      </main>
    </div>
  );
}
