import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah, formatDate } from '@/lib/format';
import { CreditCard, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function AdminDebts() {
  const { debts, units, payDebt } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [payAmount, setPayAmount] = useState<{ [key: string]: number }>({});

  const filtered = selectedUnit === 'all' ? debts : debts.filter(d => d.unitId === selectedUnit);
  const unpaid = filtered.filter(d => d.status !== 'paid');

  const chartData = units.map(u => ({
    name: u.name,
    piutang: debts.filter(d => d.unitId === u.id && d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0),
  }));

  const handlePay = (debtId: string) => {
    const amount = payAmount[debtId];
    if (!amount || amount <= 0) { toast.error('Masukkan jumlah pembayaran'); return; }
    payDebt(debtId, amount);
    setPayAmount(p => ({ ...p, [debtId]: 0 }));
    toast.success('Pembayaran piutang berhasil');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSelectedUnit('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUnit === 'all' ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
          Semua
        </button>
        {units.map(u => (
          <button key={u.id} onClick={() => setSelectedUnit(u.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUnit === u.id ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            {u.name}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Grafik Piutang Per Unit</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => formatRupiah(v)} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Bar dataKey="piutang" name="Piutang" fill="hsl(38, 92%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-muted-foreground text-center py-8">Belum ada data</p>}
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-foreground">Daftar Piutang ({unpaid.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {unpaid.map(d => (
            <div key={d.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-foreground">{d.customerName}</p>
                  <p className="text-xs text-muted-foreground">{d.customerPhone} • {d.unitName} • {formatDate(d.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total: {formatRupiah(d.totalAmount)}</p>
                  <p className="font-bold text-accent">Sisa: {formatRupiah(d.remainingAmount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="number" placeholder="Jumlah bayar" value={payAmount[d.id] || ''} 
                  onChange={e => setPayAmount(p => ({ ...p, [d.id]: Number(e.target.value) }))}
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={() => handlePay(d.id)} className="px-4 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium">
                  <DollarSign className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {unpaid.length === 0 && <p className="p-8 text-center text-muted-foreground">Tidak ada piutang</p>}
        </div>
      </div>
    </div>
  );
}
