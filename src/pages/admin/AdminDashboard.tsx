import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah, isToday, isThisWeek, isThisMonth } from '@/lib/format';
import { DollarSign, Receipt, CreditCard, TrendingDown, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const { transactions, debts, expenses, units } = useApp();
  const [period, setPeriod] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');

  const filterByPeriod = (date: string) => {
    if (period === 'daily') return isToday(date);
    if (period === 'weekly') return isThisWeek(date);
    return isThisMonth(date);
  };

  const filteredTx = transactions.filter(t => filterByPeriod(t.date));
  const filteredExpenses = expenses.filter(e => filterByPeriod(e.date));
  
  const totalSales = filteredTx.reduce((s, t) => s + t.grandTotal, 0);
  const totalTransactions = filteredTx.length;
  const totalDebts = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const chartData = units.map(unit => {
    const unitTx = filteredTx.filter(t => t.unitId === unit.id);
    return {
      name: unit.name,
      penjualan: unitTx.reduce((s, t) => s + t.grandTotal, 0),
      transaksi: unitTx.length,
    };
  });

  const stats = [
    { label: 'Total Penjualan', value: formatRupiah(totalSales), icon: DollarSign, color: 'bg-primary/10 text-primary' },
    { label: 'Total Transaksi', value: totalTransactions.toString(), icon: Receipt, color: 'bg-info/10 text-info' },
    { label: 'Piutang', value: formatRupiah(totalDebts), icon: CreditCard, color: 'bg-accent/10 text-accent' },
    { label: 'Pengeluaran', value: formatRupiah(totalExpenses), icon: TrendingDown, color: 'bg-destructive/10 text-destructive' },
  ];

  const periodLabels = { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        {(['daily', 'weekly', 'monthly'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            {periodLabels[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card rounded-xl p-5 shadow-card animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Penjualan Per Unit ({periodLabels[period]})</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => formatRupiah(v)} />
              <Tooltip formatter={(v: number, name: string) => [name === 'penjualan' ? formatRupiah(v) : v, name === 'penjualan' ? 'Penjualan' : 'Transaksi']} />
              <Legend />
              <Bar dataKey="penjualan" name="Penjualan" fill="hsl(168, 80%, 36%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="transaksi" name="Transaksi" fill="hsl(210, 100%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Belum ada data. Tambahkan unit dan mulai transaksi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
