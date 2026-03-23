import React, { useState } from 'react';
import { useApp, Product } from '@/contexts/AppContext';
import { formatRupiah, formatDate } from '@/lib/format';
import { Plus, X, Edit2, Package, AlertTriangle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProducts() {
  const { units, products, users, addUnit, deleteUnit, addProduct, updateProduct, deleteProduct, getProductStock } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitCashier, setUnitCashier] = useState('');

  const [form, setForm] = useState({ supplier: '', name: '', unitId: '', satuan: 'pcs', hpp: 0, price: 0, initialStock: 0, addedStock: 0 });

  const cashiers = users.filter(u => u.role === 'cashier');
  const filteredProducts = selectedUnit === 'all' ? products : products.filter(p => p.unitId === selectedUnit);
  const lowStockProducts = filteredProducts.filter(p => getProductStock(p) <= 5 && getProductStock(p) > 0);

  const handleAddUnit = () => {
    if (!unitName.trim()) return;
    addUnit({ name: unitName, cashierId: unitCashier || undefined });
    setUnitName('');
    setUnitCashier('');
    setShowAddUnit(false);
    toast.success('Unit berhasil ditambahkan');
  };

  const handleSubmitProduct = () => {
    if (!form.name.trim() || !form.unitId) { toast.error('Nama produk dan unit harus diisi'); return; }
    const unit = units.find(u => u.id === form.unitId);
    if (editProduct) {
      updateProduct({ ...editProduct, ...form, unit: unit?.name || '' });
      toast.success('Produk berhasil diupdate');
    } else {
      addProduct({ ...form, unit: unit?.name || '' });
      toast.success('Produk berhasil ditambahkan');
    }
    setForm({ supplier: '', name: '', unitId: '', satuan: 'pcs', hpp: 0, price: 0, initialStock: 0, addedStock: 0 });
    setShowAddProduct(false);
    setEditProduct(null);
  };

  const startEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ supplier: p.supplier, name: p.name, unitId: p.unitId, satuan: p.satuan, hpp: p.hpp, price: p.price, initialStock: p.initialStock, addedStock: p.addedStock });
    setShowAddProduct(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Units Section */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Unit / Cabang</h3>
          <button onClick={() => setShowAddUnit(true)} className="flex items-center gap-2 px-4 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Tambah Unit
          </button>
        </div>

        {showAddUnit && (
          <div className="mb-4 p-4 bg-muted rounded-lg flex flex-wrap gap-3 items-end animate-scale-in">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Unit</label>
              <input value={unitName} onChange={e => setUnitName(e.target.value)} placeholder="Contoh: Unit A"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Kasir</label>
              <select value={unitCashier} onChange={e => setUnitCashier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Pilih kasir</option>
                {cashiers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddUnit} className="px-4 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium">Simpan</button>
              <button onClick={() => setShowAddUnit(false)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Batal</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button onClick={() => setSelectedUnit('all')}
            className={`p-4 rounded-lg border-2 text-center transition-all ${selectedUnit === 'all' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
            <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-bold text-foreground">Semua Unit</p>
            <p className="text-xs text-muted-foreground">{products.length} produk</p>
          </button>
          {units.map(unit => {
            const unitProducts = products.filter(p => p.unitId === unit.id);
            return (
              <div key={unit.id} className={`p-4 rounded-lg border-2 text-center transition-all cursor-pointer relative group
                ${selectedUnit === unit.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                onClick={() => setSelectedUnit(unit.id)}>
                <button onClick={(e) => { e.stopPropagation(); deleteUnit(unit.id); }} 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                  <X className="w-3 h-3" />
                </button>
                <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-bold text-foreground">{unit.name}</p>
                <p className="text-xs text-muted-foreground">{unitProducts.length} produk</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm">Stok Menipis!</p>
            <p className="text-xs text-muted-foreground">{lowStockProducts.map(p => `${p.name} (${getProductStock(p)})`).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-bold text-foreground">Manajemen Produk</h3>
          <button onClick={() => { setEditProduct(null); setForm({ supplier: '', name: '', unitId: selectedUnit !== 'all' ? selectedUnit : '', satuan: 'pcs', hpp: 0, price: 0, initialStock: 0, addedStock: 0 }); setShowAddProduct(true); }}
            className="flex items-center gap-2 px-4 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>

        {showAddProduct && (
          <div className="p-6 border-b border-border bg-muted/50 animate-scale-in">
            <h4 className="font-semibold text-foreground mb-4">{editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Unit', type: 'select', key: 'unitId', options: units.map(u => ({ value: u.id, label: u.name })) },
                { label: 'Supplier', key: 'supplier' },
                { label: 'Nama Produk', key: 'name' },
                { label: 'Satuan', key: 'satuan' },
                { label: 'HPP', key: 'hpp', type: 'number' },
                { label: 'Harga Jual', key: 'price', type: 'number' },
                { label: 'Stok Awal', key: 'initialStock', type: 'number' },
                { label: 'Stok Tambahan', key: 'addedStock', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={(form as any)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Pilih</option>
                      {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input type={field.type || 'text'} value={(form as any)[field.key]} 
                      onChange={e => setForm(f => ({ ...f, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSubmitProduct} className="px-6 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-medium">
                {editProduct ? 'Update' : 'Simpan'}
              </button>
              <button onClick={() => { setShowAddProduct(false); setEditProduct(null); }} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">Batal</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {['Supplier', 'Produk', 'Unit', 'Satuan', 'HPP', 'Harga Jual', 'Stok Awal', 'Stok Tambah', 'Terjual', 'Total Stok', 'Update', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map(p => {
                const stock = getProductStock(p);
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">{p.supplier}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{units.find(u => u.id === p.unitId)?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.satuan}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatRupiah(p.hpp)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{formatRupiah(p.price)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.initialStock}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.addedStock}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.soldStock}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${stock <= 0 ? 'text-destructive' : stock <= 5 ? 'text-accent' : 'text-success'}`}>{stock}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Edit2 className="w-4 h-4 text-primary" />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                          <X className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">Belum ada produk</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
