import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { Receipt } from 'lucide-react';

export default function AdminTransactions() {
  const { transactions, units } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  const filtered = selectedUnit === 'all' ? transactions : transactions.filter(t => t.unitId === selectedUnit);
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSelectedUnit('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUnit === 'all' ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
          Semua Unit
        </button>
        {units.map(u => (
          <button key={u.id} onClick={() => setSelectedUnit(u.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUnit === u.id ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            {u.name}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Receipt className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Riwayat Transaksi</h3>
          <span className="ml-auto text-sm text-muted-foreground">{sorted.length} transaksi</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {['ID', 'Tanggal', 'Pelanggan', 'Unit', 'Kasir', 'Item', 'Total', 'Diskon', 'Grand Total', 'Pembayaran'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map(tx => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{tx.id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatDateTime(tx.date)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{tx.customerName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tx.unitName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tx.cashierName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tx.items.length}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatRupiah(tx.total)}</td>
                  <td className="px-4 py-3 text-sm text-accent">{tx.discount > 0 ? formatRupiah(tx.discount) : '-'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">{formatRupiah(tx.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                      ${tx.paymentType === 'cash' ? 'bg-success/10 text-success' : tx.paymentType === 'transfer' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                      {tx.paymentType === 'cash' ? 'Tunai' : tx.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}
                    </span>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">Belum ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
