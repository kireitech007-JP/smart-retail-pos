# Troubleshooting Real-time Sync - Smart Retail POS

## 🔍 Masalah: "Real-time sync tidak aktif"

### **Gejala:**
- Status menunjukkan "Tidak Terhubung"
- Sync: "Baru saja" tapi tidak ada perubahan
- Data sama di berbagai perangkat tapi sync tidak aktif
- Tidak ada notifikasi real-time

---

## 🚀 **Quick Fix Steps**

### **1. Buka Debug Tool**
1. Login sebagai **Admin**
2. Klik menu **"Debug Supabase"** (icon 🐛)
3. Ikuti langkah di bawah

### **2. Test Connection**
1. Klik tombol **"Test Connection"**
2. Lihat hasil test di dashboard

---

## 🔧 **Common Issues & Solutions**

### **Issue 1: Supabase Configuration Missing**

**Symptoms:**
- Error: "Supabase belum dikonfigurasi"
- Status: "Not Tested"

**Solution:**
```bash
# Di Debug Tool, masukkan:
Supabase URL: https://your-project.supabase.co
Supabase Key: your-anon-key-here
```

**Cara mendapatkan credentials:**
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Go to **Settings > API**
4. Copy **Project URL** dan **anon public key**

### **Issue 2: Invalid Supabase URL**

**Symptoms:**
- Error: "Invalid URL" atau "Network error"
- Status: "Error"

**Solution:**
```bash
# Format URL yang benar:
✅ https://xyzabc123.supabase.co
❌ https://xyzabc123.supabase.co/
❌ xyzabc123.supabase.co
❌ http://xyzabc123.supabase.co
```

### **Issue 3: Wrong Supabase Key**

**Symptoms:**
- Error: "Invalid API key"
- Status: "Error"

**Solution:**
```bash
# Gunakan ANON key, bukan service_role key:
✅ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
❌ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)
```

### **Issue 4: CORS Issues**

**Symptoms:**
- Error: "CORS policy error"
- Connection berhasil tapi subscription gagal

**Solution:**
1. Di Supabase Dashboard:
   - Go to **Settings > API**
   - Scroll ke **CORS**
   - Tambahkan domain Anda:
     ```
     https://your-domain.netlify.app
     https://localhost:5173
     ```

### **Issue 5: Database Schema Issues**

**Symptoms:**
- Error: "Relation does not exist"
- Table tidak ditemukan

**Solution:**
```sql
-- Jalankan SQL ini di Supabase SQL Editor:
SELECT * FROM pg_tables WHERE schemaname = 'public';

-- Pastikan tabel-tabel ini ada:
- kategori
- satuan  
- unit
- pengguna
- produk
- transaksi
- transaksi_items
- piutang
- kas_masuk
- pengeluaran
- sessions
- laporan
```

### **Issue 6: RLS (Row Level Security) Issues**

**Symptoms:**
- Error: "Permission denied"
- Connection berhasil tapi tidak bisa akses data

**Solution:**
```sql
-- Enable RLS dengan policies yang tepat:
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON produk
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON produk  
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON produk
FOR UPDATE USING (true);

-- Lakukan untuk semua tabel
```

---

## 🛠️ **Advanced Troubleshooting**

### **Check Browser Console**
```bash
# Buka Developer Tools (F12)
# Lihat tab Console untuk error messages:

✅ Normal logs:
"Setting up Supabase realtime subscriptions..."
"Realtime subscription status: SUBSCRIBED"
"Real-time sync aktif"

❌ Error logs:
"Supabase configuration missing"
"Realtime subscription error"  
"Failed to setup real-time subscriptions"
```

### **Check Network Tab**
```bash
# Di Developer Tools > Network:
# Cari request ke Supabase:

✅ Successful:
- WebSocket connection: wss://xyzabc123.supabase.co/realtime/v1/...
- Status: 101 Switching Protocols

❌ Failed:
- Status: 400 Bad Request
- Status: 401 Unauthorized
- Status: 403 Forbidden
```

### **Manual Test Connection**
```javascript
// Buka Console dan jalankan:
const { createClient } = window.supabase;

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Test basic query
supabase.from('produk').select('count').single()
  .then(({ data, error }) => {
    console.log('Test result:', { data, error });
  });

// Test realtime
const channel = supabase
  .channel('test')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'produk' }, 
    (payload) => console.log('Realtime:', payload)
  )
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });
```

---

## 🔄 **Reset & Reconfigure**

### **Reset Local Configuration**
```bash
# Di Debug Tool, klik "Reset Config"
# Atau manual di browser console:
localStorage.removeItem('storeSettings');
location.reload();
```

### **Reconfigure from Scratch**
1. **Clear Browser Cache**
   ```bash
   Ctrl+Shift+Delete (Windows)
   Cmd+Shift+Delete (Mac)
   ```

2. **Re-enter Configuration**
   - Buka halaman **Pengaturan**
   - Masukkan ulang **Supabase URL** dan **Key**
   - Test koneksi

3. **Verify Database Setup**
   - Pastikan SQL setup sudah dijalankan
   - Check table existence

---

## 📊 **Verification Steps**

### **1. Connection Test**
```bash
✅ Expected Result:
Status: Connected
Test Results: Success
Real-time subscription: SUBSCRIBED
```

### **2. Data Sync Test**
```bash
# Di Device A:
1. Tambah produk baru
2. Check console: "Real-time sync aktif"

# Di Device B:  
1. Refresh halaman
2. Produk baru harus muncul
3. Check console untuk realtime events
```

### **3. Multi-Device Test**
```bash
# Buka 2 browser/2 device:
1. Login dengan user yang sama
2. Di Device A: tambah transaksi
3. Di Device B: harus muncul notifikasi
4. Data harus sync otomatis
```

---

## 🚨 **Emergency Fixes**

### **If Nothing Works:**
```bash
# 1. Use Fallback Mode
# Matikan real-time sementara:
localStorage.setItem('disable_realtime', 'true');

# 2. Use Manual Sync
# Gunakan tombol "Sync" manual di header

# 3. Check Google Sheets Backup
# Pastikan Google Sheets sync masih berfungsi
```

### **Complete Reset:**
```bash
# Reset semua configuration:
localStorage.clear();
sessionStorage.clear();
location.reload();

# Setup ulang dari awal:
1. Login sebagai admin
2. Setup ulang store settings
3. Test koneksi Supabase
4. Verify real-time sync
```

---

## 📞 **Get Help**

### **Debug Information to Collect:**
```bash
# Screenshot dari:
1. Debug Tool page (semua section)
2. Browser Console errors
3. Network tab failed requests
4. Supabase Dashboard logs
```

### **Contact Support:**
```bash
# Sertakan informasi:
- Browser dan version
- Error messages lengkap
- Steps to reproduce
- Debug tool results
- Network request logs
```

---

## 📋 **Checklist Before Contacting Support**

- [ ] Supabase URL dan key sudah benar
- [ ] CORS sudah diatur di Supabase
- [ ] Database tables sudah dibuat
- [ ] RLS policies sudah diatur
- [ ] Browser cache sudah dibersihkan
- [ ] Debug tool sudah dijalankan
- [ ] Console error sudah dicatat
- [ ] Multi-device test sudah dilakukan

---

## 🔮 **Prevention Tips**

### **Best Practices:**
1. **Always test** after configuration changes
2. **Monitor console** for error messages
3. **Keep backup** of configuration
4. **Document** your Supabase project details
5. **Test regularly** with multiple devices

### **Maintenance:**
1. **Weekly**: Check connection status
2. **Monthly**: Update Supabase keys if needed
3. **Quarterly**: Review CORS settings
4. **Annually**: Renew SSL certificates

---

**🎯 Setelah mengikuti troubleshooting ini, real-time sync seharusnya kembali normal!**

Jika masih mengalami masalah, gunakan **Debug Supabase** tool untuk diagnosis lebih lanjut.
