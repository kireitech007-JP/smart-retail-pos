import React from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminTransactions from './AdminTransactions';
import AdminDebts from './AdminDebts';
import AdminCashIn from './AdminCashIn';
import AdminReports from './AdminReports';
import SettingsPage from './Settings';
import SupabaseDebug from './SupabaseDebug';

export default function AdminPage() {
  return (
    <AdminLayout>
      {(activePage: string) => {
        console.log('AdminPage rendering activePage:', activePage);
        switch (activePage) {
          case 'dashboard': return <AdminDashboard />;
          case 'products': return <AdminProducts />;
          case 'users': return <AdminUsers />;
          case 'transactions': return <AdminTransactions />;
          case 'debts': return <AdminDebts />;
          case 'cashin': return <AdminCashIn />;
          case 'reports': return <AdminReports />;
          case 'settings': 
            console.log('Rendering Settings component');
            return <SettingsPage />;
          default: return <AdminDashboard />;
        }
      }}
    </AdminLayout>
  );
}
