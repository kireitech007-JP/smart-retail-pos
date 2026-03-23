import React from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminTransactions from './AdminTransactions';
import AdminDebts from './AdminDebts';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

export default function AdminPage() {
  return (
    <AdminLayout>
      {(activePage: string) => {
        switch (activePage) {
          case 'dashboard': return <AdminDashboard />;
          case 'products': return <AdminProducts />;
          case 'users': return <AdminUsers />;
          case 'transactions': return <AdminTransactions />;
          case 'debts': return <AdminDebts />;
          case 'reports': return <AdminReports />;
          case 'settings': return <AdminSettings />;
          default: return <AdminDashboard />;
        }
      }}
    </AdminLayout>
  );
}
