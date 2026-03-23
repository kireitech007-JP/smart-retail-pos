import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Settings, Store, Link, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { storeSettings, updateStoreSettings } = useApp();
  const [form, setForm] = useState(storeSettings);

  const handleSave = () => {
    updateStoreSettings(form);
    toast.success('Pengaturan berhasil disimpan');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Store className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Informasi Toko</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Nama Toko</label>
            <input value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Nomor Telepon</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+62..."
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Alamat</label>
            <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={3}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Link className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Integrasi Google Sheets</h3>
        </div>
        <div className="p-6">
          <label className="text-sm font-medium text-foreground mb-1 block">Apps Script URL</label>
          <input value={form.appsScriptUrl} onChange={e => setForm(f => ({ ...f, appsScriptUrl: e.target.value }))} 
            placeholder="https://script.google.com/macros/s/..."
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <p className="text-xs text-muted-foreground mt-2">URL Web App dari Google Apps Script untuk sinkronisasi data</p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Integrasi Email</h3>
        </div>
        <div className="p-6">
          <label className="text-sm font-medium text-foreground mb-1 block">Email Pemulihan (Gmail)</label>
          <input value={form.recoveryEmail} onChange={e => setForm(f => ({ ...f, recoveryEmail: e.target.value }))} 
            placeholder="admin@gmail.com" type="email"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <p className="text-xs text-muted-foreground mt-2">Email untuk fitur lupa password</p>
        </div>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 primary-gradient text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
        <Save className="w-5 h-5" /> Simpan Pengaturan
      </button>
    </div>
  );
}
