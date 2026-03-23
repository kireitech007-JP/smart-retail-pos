import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah } from '@/lib/format';
import { DollarSign, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CashIn() {
  const { currentUser, units, addCashIn, getActiveSession } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [depositorName, setDepositorName] = useState('');

  const activeSession = currentUser ? getActiveSession(currentUser.id) : null;

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
          <p className="text-sm">Buka sesi kasir terlebih dahulu untuk menggunakan fitur kas masuk</p>
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
    </div>
  );
}
