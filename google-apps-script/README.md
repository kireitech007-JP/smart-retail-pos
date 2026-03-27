# Google Apps Script untuk Smart Retail POS

## 📁 Folder Structure

```
google-apps-script/
├── kode.gs                          # File utama Google Apps Script
├── google-apps-script-backup.js    # File backup lama (dipindahkan)
└── README.md                        # Documentation ini
```

## 🔧 File Description

### 📄 `kode.gs`
**File utama** untuk Google Apps Script yang berisi:

#### **🎯 Fungsi Utama:**
- `doPost(e)` - Handle POST requests dari aplikasi POS
- `testFunction()` - Testing function untuk debugging
- `setupSpreadsheet()` - Setup spreadsheet pertama kali

#### **📊 Backup Functions:**
- `handleBackupAllData()` - Backup semua data
- `handleBackupKategori()` - Backup kategori
- `handleBackupSatuan()` - Backup satuan
- `handleBackupProduk()` - Backup produk
- `handleBackupPengguna()` - Backup pengguna
- `handleBackupUnit()` - Backup unit
- `handleBackupTransaksi()` - Backup transaksi
- `handleBackupTransaksiItems()` - Backup transaksi items
- `handleBackupPiutang()` - Backup piutang
- `handleBackupKasMasuk()` - Backup kas masuk
- `handleBackupPengeluaran()` - Backup pengeluaran
- `handleBackupSessions()` - Backup sessions

#### **📥 Restore Functions:**
- `handleRestoreAllData()` - Restore semua data
- `handleGetKategori()` - Get kategori
- `handleGetSatuan()` - Get satuan
- `handleGetProduk()` - Get produk
- `handleGetPengguna()` - Get pengguna
- `handleGetUnit()` - Get unit
- `handleGetTransaksi()` - Get transaksi
- `handleGetTransaksiItems()` - Get transaksi items
- `handleGetPiutang()` - Get piutang
- `handleGetKasMasuk()` - Get kas masuk
- `handleGetPengeluaran()` - Get pengeluaran
- `handleGetSessions()` - Get sessions

#### **🔧 Utility Functions:**
- `backupToSheet()` - Utility untuk backup ke sheet
- `getFromSheet()` - Utility untuk get dari sheet
- `clearSheet()` - Utility untuk clear sheet
- `logBackup()` - Logging system
- `debugDataStructure()` - Debug sample data
- `testBackupWithSampleData()` - Test backup dengan sample

### 📄 `google-apps-script-backup.js`
**File backup** dari versi sebelumnya. Dipindahkan ke folder ini sebagai reference.

## 🚀 Cara Setup Google Apps Script

### **Step 1: Buat Google Sheets**
1. Buka [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet
3. Beri nama: "Smart Retail POS Backup"
4. Copy Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### **Step 2: Buat Google Apps Script**
1. Buka [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Beri nama: "Smart Retail POS Backup"
4. Copy semua kode dari `kode.gs`
5. Paste ke editor Apps Script

### **Step 3: Update Configuration**
Di `kode.gs`, update variable:
```javascript
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
```
Ganti dengan Spreadsheet ID yang Anda dapatkan dari Step 1.

### **Step 4: Setup Spreadsheet**
1. Di Apps Script editor, run function `setupSpreadsheet`
2. Authorize permissions yang diminta
3. Function akan membuat semua sheets yang dibutuhkan:
   - Kategori
   - Satuan
   - Produk
   - Pengguna
   - Unit
   - Transaksi
   - Transaksi Items
   - Piutang
   - Kas Masuk
   - Pengeluaran
   - Sessions
   - Backup Logs

### **Step 5: Deploy sebagai Web App**
1. Di Apps Script editor, click "Deploy" → "New deployment"
2. Configuration:
   - **Type**: Web app
   - **Description**: Smart Retail POS Backup API
   - **Execute as**: Me
   - **Who has access**: Anyone
3. Click "Deploy"
4. Authorize permissions
5. Copy Web App URL yang dihasilkan

### **Step 6: Setup di Aplikasi POS**
1. Buka aplikasi POS
2. Login sebagai admin
3. Menu Settings → Integrasi Google Sheets
4. Paste Web App URL ke field "Apps Script URL"
5. Save settings

## 🔧 Cara Testing

### **Test Connection:**
```javascript
// Di Apps Script editor, run:
testFunction()
```

### **Test Backup:**
```javascript
// Di Apps Script editor, run:
testBackupWithSampleData()
```

### **Test Setup:**
```javascript
// Di Apps Script editor, run:
setupSpreadsheet()
```

## 📊 Data Structure

### **Tables yang Di-backup:**

#### **Kategori:**
```javascript
{
  id: string,
  nama: string,
  deskripsi: string,
  created_at: string,
  updated_at: string
}
```

#### **Produk:**
```javascript
{
  id: string,
  nama: string,
  sku: string,
  kategori_id: string,
  satuan_id: string,
  harga: number,
  hpp: number,
  stok: number,
  min_stok: number,
  supplier: string,
  unit_id: string,
  created_at: string,
  updated_at: string
}
```

#### **Transaksi:**
```javascript
{
  id: string,
  date: string,
  cashier_name: string,
  customer_name: string,
  customer_phone: string,
  subtotal: number,
  discount: number,
  tax: number,
  grand_total: number,
  payment_type: string,
  cash_paid: number,
  cash_change: number,
  dp: number,
  unit_id: string,
  created_at: string,
  updated_at: string
}
```

## 🌐 API Endpoints

### **POST Request Format:**
```javascript
{
  "action": "backupAllData",
  "data": {
    "kategori": [...],
    "satuan": [...],
    "produk": [...],
    // ... data lainnya
  }
}
```

### **Available Actions:**
- `backupAllData` - Backup semua data
- `backupKategori` - Backup kategori
- `backupSatuan` - Backup satuan
- `backupProduk` - Backup produk
- `backupPengguna` - Backup pengguna
- `backupUnit` - Backup unit
- `backupTransaksi` - Backup transaksi
- `backupTransaksiItems` - Backup transaksi items
- `backupPiutang` - Backup piutang
- `backupKasMasuk` - Backup kas masuk
- `backupPengeluaran` - Backup pengeluaran
- `backupSessions` - Backup sessions
- `restoreAllData` - Restore semua data
- `getKategori` - Get kategori
- `getSatuan` - Get satuan
- `getProduk` - Get produk
- `getPengguna` - Get pengguna
- `getUnit` - Get unit
- `getTransaksi` - Get transaksi
- `getTransaksiItems` - Get transaksi items
- `getPiutang` - Get piutang
- `getKasMasuk` - Get kas masuk
- `getPengeluaran` - Get pengeluaran
- `getSessions` - Get sessions
- `clearAllData` - Hapus semua data
- `testConnection` - Test koneksi

## 🔒 Security

### **Permissions yang Dibutuhkan:**
- `spreadsheets` - Akses Google Sheets
- `drive` - Akses Google Drive
- `script.external_request` - HTTP requests ke Supabase

### **Best Practices:**
- Gunakan Web App URL yang secure (https)
- Limit access dengan API key jika perlu
- Monitor logs di "Backup Logs" sheet
- Regular backup dari Google Sheets

## 📝 Logging

### **Backup Logs Sheet:**
Semua aktivitas akan di-log di sheet "Backup Logs" dengan kolom:
- **Timestamp**: Waktu aktivitas
- **Action**: Tipe action (backup/restore/error)
- **Type**: Kategori log (REQUEST/RESPONSE/ERROR)
- **Message**: Deskripsi aktivitas
- **Data**: JSON data yang terkait

### **Monitor Logs:**
1. Buka Google Sheets
2. Sheet "Backup Logs"
3. Check untuk errors atau warnings

## 🚨 Troubleshooting

### **Common Issues:**

#### **"Spreadsheet tidak ditemukan":**
- Check SPREADSHEET_ID di kode.gs
- Pastikan spreadsheet ada dan accessible
- Re-deploy Apps Script setelah update

#### **"Permission denied":**
- Re-authorize Apps Script
- Check permissions yang diminta
- Pastikan user memiliki akses ke spreadsheet

#### **"Web App URL tidak valid":**
- Copy URL yang benar dari deployment
- Pastikan deployment status "Active"
- Test dengan curl atau Postman

#### **"Data tidak tersimpan":**
- Check data structure yang dikirim
- Verify sheet names di SHEET_NAMES
- Check logs di Apps Script

## 🎯 Next Steps

### **Setelah Setup:**
1. **Test connection** dari aplikasi POS
2. **Test backup** dengan sample data
3. **Test restore** untuk verify data
4. **Monitor logs** untuk troubleshooting
5. **Schedule backup** otomatis jika perlu

### **Advanced Features:**
- **Scheduled backup** dengan triggers
- **Email notifications** untuk backup success
- **Multiple spreadsheets** untuk different stores
- **Data validation** sebelum backup

## 📞 Support

### **Documentation:**
- File `kode.gs` untuk source code lengkap
- File `google-apps-script-backup.js` untuk reference
- Logs di Google Sheets untuk monitoring

### **Testing:**
- Use `testFunction()` untuk basic testing
- Use `testBackupWithSampleData()` untuk backup testing
- Use `setupSpreadsheet()` untuk initial setup

---

**🎉 Google Apps Script siap digunakan untuk backup dan restore data Smart Retail POS!**
