import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah, formatDate } from '@/lib/format';
import { DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ExportButtons from '@/components/ExportButtons';

export default function AdminCashIn() {
  const { cashIns, units, users } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const filterByPeriod = (date: string) => {
    const now = new Date();
    const itemDate = new Date(date);
    
    switch (selectedPeriod) {
      case 'today':
        return itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      case 'month':
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      case 'all':
        return true;
      default:
        return true;
    }
  };

  const filtered = cashIns.filter(c => {
    const unitMatch = selectedUnit === 'all' || c.unitId === selectedUnit;
    const periodMatch = filterByPeriod(c.date);
    return unitMatch && periodMatch;
  });

  const chartData = units.map(u => {
    const unitCashIns = filtered.filter(c => c.unitId === u.id);
    return {
      name: u.name,
      amount: unitCashIns.reduce((s, c) => s + c.amount, 0)
    };
  });

  const totalAmount = filtered.reduce((s, c) => s + c.amount, 0);

  const exportData = filtered.map(c => ({
    Tanggal: formatDate(c.date),
    Unit: c.unitName,
    Kasir: c.cashierName,
    Penyetor: c.depositorName,
    Keterangan: c.description,
    Jumlah: formatRupiah(c.amount)
  }));

  const periodLabels = {
    today: 'Hari Ini',
    week: '7 Hari Terakhir',
    month: 'Bulan Ini',
    all: 'Semua'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-foreground">Ringkasan Kas Masuk</h3>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{formatRupiah(totalAmount)}</p>
          <p className="text-sm text-muted-foreground">Total Kas Masuk ({periodLabels[selectedPeriod]})</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Periode:</span>
        </div>
        {(['today', 'week', 'month', 'all'] as const).map(period => (
          <button key={period} onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPeriod === period ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            {periodLabels[period]}
          </button>
        ))}
        <div className="w-px h-6 bg-border mx-2" />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Unit:</span>
        </div>
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

      {/* Chart */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Grafik Kas Masuk Per Unit</h3>
          </div>
          <ExportButtons data={exportData} filename="kas-masuk" title="Laporan Kas Masuk" />
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => formatRupiah(v)} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Bar dataKey="amount" name="Kas Masuk" fill="hsl(142, 76%, 36%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-muted-foreground text-center py-8">Belum ada data</p>}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-foreground">Detail Kas Masuk ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {['Tanggal', 'Unit', 'Kasir', 'Penyetor', 'Keterangan', 'Jumlah'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground">{formatDate(c.date)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.unitName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.cashierName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.depositorName}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{c.description}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">{formatRupiah(c.amount)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada data kas masuk</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
