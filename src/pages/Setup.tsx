import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Store, User, Lock, ArrowRight } from 'lucide-react';

export default function SetupPage() {
  const { completeSetup } = useApp();
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!storeName.trim()) { setError('Nama toko harus diisi'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !username.trim() || !password.trim()) { setError('Semua field harus diisi'); return; }
    if (password !== confirmPassword) { setError('Password tidak cocok'); return; }
    if (password.length < 4) { setError('Password minimal 4 karakter'); return; }
    completeSetup(adminName, username, password, storeName);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl primary-gradient mb-4">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">POS KASIR PRO</h1>
          <p className="text-muted-foreground mt-2">Setup Awal Aplikasi</p>
        </div>

        <div className="bg-card rounded-xl shadow-elevated p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'primary-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
            <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'primary-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
          </div>

          {step === 1 ? (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Informasi Toko</h2>
              <p className="text-sm text-muted-foreground mb-6">Masukkan nama toko Anda</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Nama Toko</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Contoh: Toko Sejahtera"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button onClick={handleNext} className="w-full py-3 primary-gradient text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  Lanjut <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-bold text-foreground mb-1">Akun Admin</h2>
              <p className="text-sm text-muted-foreground mb-6">Buat akun admin untuk mengelola toko</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Nama admin"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username login"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Konfirmasi Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-80 transition-opacity">Kembali</button>
                  <button type="submit" className="flex-1 py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">Mulai</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
