import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah } from '@/lib/format';
import { DollarSign, X, Plus, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function CashIn() {
  const { currentUser, units, addCashIn, getActiveSession, cashIns } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [depositorName, setDepositorName] = useState('');

  const activeSession = currentUser ? getActiveSession(currentUser.id) : null;
  
  // Get cash in history for current session
  const sessionCashIns = activeSession 
    ? cashIns.filter(c => activeSession.cashIns?.includes(c.id))
    : [];
  
  const totalSessionCashIn = sessionCashIns.reduce((sum, c) => sum + c.amount, 0);

  if (!activeSession) {
    return (
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-foreground">Kas Masuk</h3>
          </div>
        </div>
        <div className="p-6 text-center text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-2">Sesi Kasir Belum Dibuka</p>
          <p className="text-xs mb-4">Buka sesi kasir di Dashboard terlebih dahulu untuk menggunakan fitur kas masuk</p>
          <div className="bg-muted/50 rounded-lg p-3 text-left max-w-sm mx-auto">
            <p className="text-xs font-medium text-foreground mb-1">📋 Cara Membuka Sesi:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Pergi ke Dashboard</li>
              <li>Masukkan modal awal (minimal 1)</li>
              <li>Klik tombol "Buka Kasir"</li>
              <li>Kembali ke menu "Kas Masuk"</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeSession) {
      toast.error('Tidak ada sesi kasir yang aktif');
      return;
    }

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Masukkan jumlah yang valid');
      return;
    }

    if (!description.trim()) {
      toast.error('Masukkan keterangan');
      return;
    }

    if (!depositorName.trim()) {
      toast.error('Masukkan nama penyetor');
      return;
    }

    const unit = units.find(u => u.id === activeSession.unitId);
    
    addCashIn({
      date: new Date().toISOString(),
      description: description.trim(),
      amount: amountNum,
      depositorName: depositorName.trim(),
      unitId: activeSession.unitId,
      unitName: unit?.name || '',
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      sessionId: activeSession.id
    });

    setAmount('');
    setDescription('');
    setDepositorName('');
    setShowForm(false);
    toast.success(`Kas masuk sebesar ${formatRupiah(amountNum)} dari ${depositorName} berhasil dicatat`);
  };

  if (!activeSession) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-foreground">Kas Masuk</h3>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Batal' : 'Tambah'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-6 bg-muted/50 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Jumlah Kas Masuk
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Nama Penyetor
              </label>
              <input
                type="text"
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                placeholder="Masukkan nama penyetor"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Keterangan
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Setoran modal, Penjualan tunai lainnya, dll"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Simpan Kas Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setAmount('');
                  setDescription('');
                  setDepositorName('');
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cash In History */}
      <div className="border-t border-border">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-foreground">Riwayat Kas Masuk Sesi Ini</h4>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-green-600">{formatRupiah(totalSessionCashIn)}</p>
            </div>
          </div>
        </div>
        {sessionCashIns.length > 0 ? (
          <div className="divide-y divide-border">
            {sessionCashIns.map(cashIn => (
              <div key={cashIn.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{cashIn.depositorName}</span>
                      <span className="text-xs text-muted-foreground">• {formatDate(cashIn.date)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{cashIn.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatRupiah(cashIn.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada kas masuk dalam sesi ini</p>
            <p className="text-xs mt-1">Tambahkan kas masuk untuk melihat riwayatnya di sini</p>
          </div>
        )}
      </div>
    </div>
  );
}
