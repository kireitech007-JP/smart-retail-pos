# Smart Retail POS - Google Apps Script Web App

## 🌐 Aplikasi POS Berbasis Google Apps Script

Aplikasi Point of Sale (POS) yang berjalan sepenuhnya di Google Apps Script dengan Google Sheets sebagai database.

## 📁 Struktur Folder

```
gas-web-app/
├── index.html          # Frontend HTML, CSS, JavaScript
├── Code.gs            # Backend Google Apps Script
├── appsscript.json    # Konfigurasi Apps Script
└── README.md          # Documentation ini
```

## 🚀 Cara Setup

### **Step 1: Buat Google Sheets**
1. Buka [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet
3. Beri nama: "Smart Retail POS Data"
4. Copy Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### **Step 2: Buat Google Apps Script**
1. Buka [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Beri nama: "Smart Retail POS Web App"

### **Step 3: Upload Files**
#### **Option A: Copy & Paste**
1. Copy semua isi file `index.html`
2. Paste ke Apps Script editor
3. Copy semua isi file `Code.gs`
4. Paste ke Apps Script editor
5. Copy semua isi file `appsscript.json`
6. Klik "Project Settings" (⚙️) → "Show appsscript.json manifest file in editor"
7. Paste ke file manifest yang muncul

#### **Option B: Upload Direct**
1. Di Apps Script editor, click "Files" → "Upload files"
2. Upload file `index.html`
3. Upload file `Code.gs`
4. Upload file `appsscript.json`

### **Step 4: Update Configuration**
Di file `Code.gs`, update variable:
```javascript
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
```
Ganti dengan Spreadsheet ID yang Anda dapatkan dari Step 1.

### **Step 5: Setup Spreadsheet**
1. Di Apps Script editor, run function `setupSpreadsheet`
2. Authorize permissions yang diminta
3. Function akan membuat semua sheets yang dibutuhkan:
   - Kategori
   - Satuan
   - Produk
   - Pelanggan
   - Transaksi
   - Transaksi Items
   - Piutang
   - Kas Masuk
   - Pengeluaran
   - Laporan
   - Sessions

### **Step 6: Deploy sebagai Web App**
1. Di Apps Script editor, click "Deploy" → "New deployment"
2. Configuration:
   - **Type**: Web app
   - **Description**: Smart Retail POS Web App
   - **Execute as**: Me
   - **Who has access**: Anyone
3. Click "Deploy"
4. Authorize permissions
5. Copy Web App URL yang dihasilkan

### **Step 7: Akses Aplikasi**
1. Buka Web App URL yang Anda dapatkan
2. Aplikasi akan terbuka di browser
3. Mulai menggunakan Smart Retail POS!

## 🎯 Features

### **📊 Dashboard**
- Real-time statistics
- Total produk, transaksi, pendapatan
- Aktivitas terkini
- Quick actions

### **📦 Manajemen Produk**
- Tambah, edit, hapus produk
- Search dan filter
- Stock management
- Kategori produk

### **💳 Transaksi**
- Transaksi baru
- Riwayat transaksi
- Detail transaksi
- Multiple payment methods

### **👥 Manajemen Pelanggan**
- Database pelanggan
- Search pelanggan
- Edit informasi pelanggan
- History transaksi

### **📈 Laporan**
- Laporan penjualan
- Filter tanggal
- Statistik harian
- Export data

### **⚙️ Settings**
- Konfigurasi toko
- Backup & restore
- Test koneksi
- Pengaturan umum

## 🔧 API Endpoints

### **GET Requests (doGet)**
- Serve HTML frontend

### **POST Requests (doPost)**
```javascript
// Get data
{
  "action": "getProducts"
}

// Add product
{
  "action": "addProduct",
  "product": {
    "nama": "Nasi Goreng",
    "harga": 15000,
    "stok": 50,
    "kategori": "Makanan"
  }
}

// Add transaction
{
  "action": "addTransaction",
  "transaction": {
    "customer_name": "Budi",
    "grand_total": 25000,
    "payment_type": "cash"
  }
}

// Backup data
{
  "action": "backupAllData",
  "data": {
    "products": [...],
    "transactions": [...],
    "customers": [...]
  }
}

// Restore data
{
  "action": "restoreAllData"
}

// Test connection
{
  "action": "testConnection"
}
```

## 📱 Responsive Design

### **Desktop View**
- Full-featured interface
- Multi-column layout
- Rich interactions

### **Mobile View**
- Optimized for phones
- Touch-friendly interface
- Simplified navigation

### **Tablet View**
- Balanced layout
- Optimized touch targets
- Efficient space usage

## 🗄️ Database Structure

### **Google Sheets Tables**

#### **Products Sheet**
```
id | nama | sku | kategori_id | satuan_id | harga | hpp | stok | min_stok | supplier | unit_id | created_at | updated_at
```

#### **Transactions Sheet**
```
id | date | cashier_name | customer_name | customer_phone | subtotal | discount | tax | grand_total | payment_type | cash_paid | cash_change | dp | unit_id | created_at | updated_at
```

#### **Customers Sheet**
```
id | nama | telepon | email | alamat | created_at | updated_at
```

## 🔒 Security

### **Google Apps Script Security**
- **OAuth 2.0**: Secure authentication
- **Permissions**: Limited to required scopes
- **Sandbox**: Code runs in secure environment
- **Audit Trail**: All actions logged

### **Data Security**
- **Google Sheets**: Encrypted data storage
- **Access Control**: User-based permissions
- **Backup**: Automatic version history
- **Privacy**: No third-party data sharing

## 🚀 Performance

### **Optimizations**
- **Lazy Loading**: Load data on demand
- **Caching**: Browser storage for speed
- **Minified**: Optimized code size
- **CDN**: Google's global infrastructure

### **Limits**
- **Execution Time**: 6 minutes per request
- **Storage**: Google Sheets limits
- **Concurrent Users**: Web app limits
- **API Calls**: Google quotas

## 📊 Monitoring

### **Logs**
- **Google Apps Script**: Built-in logging
- **Error Tracking**: Automatic error capture
- **Performance**: Response time monitoring
- **Usage**: User activity tracking

### **Analytics**
- **Transaction Metrics**: Sales data
- **User Behavior**: Feature usage
- **Performance**: Load times
- **Errors**: Issue tracking

## 🔄 Backup & Restore

### **Backup**
- **Automatic**: Scheduled backups
- **Manual**: On-demand backup
- **Incremental**: Only changed data
- **Versioning**: Multiple backup versions

### **Restore**
- **Point-in-time**: Restore to specific date
- **Selective**: Restore specific tables
- **Validation**: Data integrity checks
- **Rollback**: Undo failed restore

## 🌐 Deployment

### **Development**
- **Test Environment**: Separate test data
- **Debug Mode**: Enhanced logging
- **Hot Reload**: Quick iteration
- **Local Testing**: Offline development

### **Production**
- **Web App**: Public URL
- **HTTPS**: Secure connection
- **Global Access**: Available worldwide
- **Scalable**: Handle multiple users

## 🆘 Troubleshooting

### **Common Issues**

#### **"Spreadsheet tidak ditemukan"**
- Check SPREADSHEET_ID di Code.gs
- Pastikan spreadsheet ada dan accessible
- Re-deploy Apps Script setelah update

#### **"Permission denied"**
- Re-authorize Apps Script
- Check permissions yang diminta
- Pastikan user memiliki akses ke spreadsheet

#### **"Web App tidak bisa diakses"**
- Check deployment settings
- Verify "Anyone" access
- Re-deploy web app

#### **"Data tidak tersimpan"**
- Check data structure yang dikirim
- Verify sheet names di SHEET_NAMES
- Check logs di Apps Script

### **Debugging**
```javascript
// Di Apps Script editor, run:
Logger.log("Debug message");

// Check logs di:
// Apps Script Editor → Executions → View logs
```

## 🎯 Best Practices

### **Development**
- **Version Control**: Track changes
- **Testing**: Test all functions
- **Documentation**: Comment code
- **Error Handling**: Comprehensive checks

### **Production**
- **Monitoring**: Regular health checks
- **Backup**: Regular backups
- **Updates**: Plan deployments
- **Security**: Regular audits

## 📞 Support

### **Documentation**
- File `index.html` untuk frontend code
- File `Code.gs` untuk backend code
- File `appsscript.json` untuk configuration
- Built-in Google Apps Script help

### **Community**
- Google Apps Script documentation
- Stack Overflow questions
- GitHub issues & discussions
- Developer forums

---

## 🎉 Quick Start

### **5 Menit Setup:**
1. **Buat Google Sheets** → Copy ID
2. **Buat Apps Script** → Paste code
3. **Update SPREADSHEET_ID**
4. **Run setupSpreadsheet**
5. **Deploy Web App** → Copy URL
6. **Buka URL** → Start using!

### **URL Example:**
```
https://script.google.com/macros/s/AKfycbxyz1234567890abcdef/exec
```

---

**🚀 Smart Retail POS Web App siap digunakan! Gratis, mudah setup, dan berjalan di Google Cloud!**
