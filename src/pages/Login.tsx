import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Store, User, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, storeSettings } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(username, password);
    if (!user) setError('Username atau password salah');
  };

  const handleForgotPassword = () => {
    if (storeSettings.recoveryEmail) {
      window.open(`mailto:${storeSettings.recoveryEmail}?subject=Reset Password POS Kasir Pro&body=Saya lupa password untuk username: ${forgotEmail}`);
      toast.success('Email reset password telah disiapkan');
      setShowForgot(false);
    } else {
      toast.error('Email pemulihan belum dikonfigurasi. Hubungi admin.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl primary-gradient mb-4">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">POS KASIR PRO</h1>
          <p className="text-muted-foreground mt-1">{storeSettings.storeName || 'Sistem Kasir Modern'}</p>
        </div>

        <div className="bg-card rounded-xl shadow-elevated p-8">
          {!showForgot ? (
            <form onSubmit={handleLogin}>
              <h2 className="text-lg font-bold text-foreground mb-6">Login</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username"
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
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" className="w-full py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">Masuk</button>
                <button type="button" onClick={() => setShowForgot(true)} className="w-full text-sm text-primary hover:underline">Lupa Password?</button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">Lupa Password</h2>
              <p className="text-sm text-muted-foreground mb-6">Masukkan username Anda untuk reset password via email</p>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Username Anda"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <button onClick={handleForgotPassword} className="w-full py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">Kirim Reset Password</button>
                <button onClick={() => setShowForgot(false)} className="w-full text-sm text-primary hover:underline">Kembali ke Login</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
