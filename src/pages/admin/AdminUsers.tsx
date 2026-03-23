import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Plus, X, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { users, units, addUser, deleteUser } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'cashier' as const, unitId: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) { toast.error('Semua field harus diisi'); return; }
    if (users.some(u => u.username === form.username)) { toast.error('Username sudah digunakan'); return; }
    addUser(form);
    setForm({ name: '', username: '', password: '', role: 'cashier', unitId: '' });
    setShowAdd(false);
    toast.success('User berhasil ditambahkan');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Manajemen Pengguna</h3>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Tambah Kasir
          </button>
        </div>

        {showAdd && (
          <div className="p-6 border-b border-border bg-muted/50 animate-scale-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Lengkap</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Username</label>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Username"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Unit</label>
                <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Pilih unit</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAdd} className="px-6 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium">Simpan</button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Batal</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {['Nama', 'Username', 'Role', 'Unit', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Kasir'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{units.find(unit => unit.id === u.unitId)?.name || '-'}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
