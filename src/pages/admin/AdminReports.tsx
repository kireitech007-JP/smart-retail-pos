import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah, isToday, isThisWeek, isThisMonth } from '@/lib/format';
import { FileText, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import ExportButtons from '@/components/ExportButtons';
import { backupLaporan } from '@/lib/googleSheets';

export default function AdminReports() {
  const { transactions, expenses, units } = useApp();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  const handleSyncToSheets = async () => {
    toast.info('Sinkronisasi data laporan ke Google Sheets...');
    await backupLaporan(chartData);
  };

  const filterByPeriod = (date: string) => {
    if (period === 'daily') return isToday(date);
    if (period === 'weekly') return isThisWeek(date);
    return isThisMonth(date);
  };

  const filteredTx = transactions.filter(t => filterByPeriod(t.date) && (selectedUnit === 'all' || t.unitId === selectedUnit));
  const filteredExp = expenses.filter(e => filterByPeriod(e.date) && (selectedUnit === 'all' || e.unitId === selectedUnit));

  const totalSales = filteredTx.reduce((s, t) => s + t.grandTotal, 0);
  const totalHPP = filteredTx.reduce((s, t) => s + t.items.reduce((is, i) => is + i.hpp * i.qty, 0), 0);
  const totalExpenses = filteredExp.reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalSales - totalHPP;
  const netProfit = grossProfit - totalExpenses;

  const chartData = units.map(u => {
    const uTx = transactions.filter(t => filterByPeriod(t.date) && t.unitId === u.id);
    const uExp = expenses.filter(e => filterByPeriod(e.date) && e.unitId === u.id);
    const sales = uTx.reduce((s, t) => s + t.grandTotal, 0);
    const hpp = uTx.reduce((s, t) => s + t.items.reduce((is, i) => is + i.hpp * i.qty, 0), 0);
    return { name: u.name, penjualan: sales, laba: sales - hpp, pengeluaran: uExp.reduce((s, e) => s + e.amount, 0) };
  });

  const periodLabels = { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan' };

  const exportData = chartData.map(u => ({
    Unit: u.name,
    Penjualan: formatRupiah(u.penjualan),
    Laba: formatRupiah(u.laba),
    Pengeluaran: formatRupiah(u.pengeluaran),
    'Laba Bersih': formatRupiah(u.laba - u.pengeluaran)
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2">
        {(['daily', 'weekly', 'monthly'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            {periodLabels[p]}
          </button>
        ))}
        <div className="w-px h-6 bg-border mx-2" />
        <button onClick={() => setSelectedUnit('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUnit === 'all' ? 'bg-primary/10 text-primary' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
          Semua
        </button>
        {units.map(u => (
          <button key={u.id} onClick={() => setSelectedUnit(u.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUnit === u.id ? 'bg-primary/10 text-primary' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            {u.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Penjualan', value: totalSales, color: 'text-primary' },
          { label: 'HPP', value: totalHPP, color: 'text-muted-foreground' },
          { label: 'Laba Kotor', value: grossProfit, color: 'text-success' },
          { label: 'Pengeluaran', value: totalExpenses, color: 'text-destructive' },
          { label: 'Laba Bersih', value: netProfit, color: netProfit >= 0 ? 'text-success' : 'text-destructive' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{formatRupiah(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Laporan Per Unit ({periodLabels[period]})</h3>
          </div>
          <ExportButtons data={exportData} filename={`laporan-${periodLabels[period].toLowerCase()}`} title={`Laporan ${periodLabels[period]}`} onSheetsClick={handleSyncToSheets} />
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => formatRupiah(v)} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Legend />
              <Bar dataKey="penjualan" name="Penjualan" fill="hsl(168, 80%, 36%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="laba" name="Laba" fill="hsl(152, 69%, 40%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="hsl(0, 72%, 51%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-muted-foreground text-center py-8">Belum ada data</p>}
      </div>
    </div>
  );
}
