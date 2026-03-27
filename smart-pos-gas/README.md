# Smart Retail POS - Google Apps Script Version

## 📁 Folder Structure

```
smart-pos-gas/
├── index.html                      # Frontend HTML (Complete POS App)
├── Code.gs                         # Backend Google Apps Script
├── appsscript.json                 # Configuration file
└── README.md                       # Documentation ini
```

## 🎯 Tujuan

**Aplikasi Smart Retail POS yang sama persis dengan versi React, namun berjalan sepenuhnya di Google Apps Script sebagai web app.**

## 🌐 Fitur Lengkap

### 📊 **Dashboard**
- **Statistics**: Total produk, transaksi, pendapatan, pelanggan
- **Recent Activity**: Log aktivitas terkini
- **Real-time Updates**: Data refresh otomatis

### 📦 **Manajemen Produk**
- **CRUD Complete**: Tambah, edit, hapus produk
- **Search**: Pencarian produk real-time
- **Stock Management**: Monitor stok produk
- **Categories**: Organisasi produk per kategori

### 💳 **Transaksi**
- **POS System**: Input transaksi lengkap
- **Customer Management**: Data pelanggan
- **Payment Methods**: Berbagai metode pembayaran
- **Receipt Generation**: Struk otomatis

### 👥 **Pelanggan**
- **Customer Database**: Data pelanggan lengkap
- **Contact Management**: Telepon, email, alamat
- **Transaction History**: Riwayat transaksi

### 📈 **Laporan**
- **Date Range**: Custom periode laporan
- **Sales Reports**: Laporan penjualan detail
- **Statistics**: Total pendapatan, rata-rata transaksi
- **Daily Breakdown**: Data per hari

### ⚙️ **Settings**
- **Store Configuration**: Nama, alamat, telepon toko
- **Backup & Restore**: Google Sheets integration
- **Connection Test**: Test koneksi API

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
3. Beri nama: "Smart Retail POS"
4. Copy semua kode dari `Code.gs`
5. Paste ke editor Apps Script

### **Step 3: Setup HTML**
1. Di Apps Script editor, click **"File"** → **"New"** → **"HTML file"**
2. Beri nama: `index`
3. Copy semua kode dari `index.html`
4. Paste ke HTML editor

### **Step 4: Update Configuration**
Di `Code.gs`, update variable:
```javascript
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
```
Ganti dengan Spreadsheet ID dari Step 1.

### **Step 5: Setup Spreadsheet**
1. Di Apps Script editor, run function `setupSpreadsheet`
2. Authorize permissions yang diminta
3. Function akan membuat semua sheets yang dibutuhkan

### **Step 6: Deploy sebagai Web App**
1. Di Apps Script editor, click **"Deploy"** → **"New deployment"**
2. Configuration:
   - **Type**: Web app
   - **Description**: Smart Retail POS
   - **Execute as**: Me
   - **Who has access**: Anyone
3. Click **"Deploy"**
4. Authorize permissions
5. Copy Web App URL yang dihasilkan

### **Step 7: Akses Aplikasi**
- Buka Web App URL di browser
- Aplikasi POS siap digunakan!

## 🔧 API Endpoints

### **GET Request:**
- **URL**: Web App URL (doGet function)
- **Returns**: HTML page dengan aplikasi lengkap

### **POST Requests:**
```javascript
// Get data
{
  "action": "getProducts|getTransactions|getCustomers|getDashboardData"
}

// Add data
{
  "action": "addProduct|addTransaction|addCustomer",
  "product|transaction|customer": { ... }
}

// Update data
{
  "action": "updateProduct|updateTransaction|updateCustomer",
  "product|transaction|customer": { ... }
}

// Delete data
{
  "action": "deleteProduct|deleteTransaction|deleteCustomer",
  "id": "ID_TO_DELETE"
}

// Reports
{
  "action": "getReport",
  "startDate": "2024-03-01",
  "endDate": "2024-03-31"
}

// Backup & Restore
{
  "action": "backupAllData|restoreAllData|testConnection"
}
```

## 📱 Responsive Design

### **Desktop:**
- Full layout dengan sidebar navigation
- Large tables untuk data management
- Detailed forms untuk input

### **Mobile:**
- Responsive design untuk smartphone
- Touch-friendly interface
- Optimized tables dan forms

### **Tablet:**
- Adaptive layout untuk tablet
- Balance antara desktop dan mobile

## 🗄️ Database Structure

### **Google Sheets Tables:**

#### **Produk:**
```
id, nama, sku, kategori_id, satuan_id, harga, hpp, stok, min_stok, supplier, unit_id, created_at, updated_at
```

#### **Transaksi:**
```
id, date, cashier_name, customer_name, customer_phone, subtotal, discount, tax, grand_total, payment_type, cash_paid, cash_change, dp, unit_id, created_at, updated_at
```

#### **Pelanggan:**
```
id, nama, telepon, email, alamat, created_at, updated_at
```

#### **Lainnya:**
- Kategori, Satuan, Unit, Piutang, Kas Masuk, Pengeluaran, Sessions

## 🔒 Security

### **Permissions:**
- **Spreadsheets**: Akses Google Sheets untuk data
- **Drive**: Akses file untuk storage
- **External Requests**: API calls untuk integrasi

### **Best Practices:**
- **Web App Access**: Set ke "Anyone" untuk public access
- **Execute As**: "Me" untuk user permissions
- **Data Validation**: Input validation di backend
- **Error Handling**: Comprehensive error management

## 🌐 Benefits

### **✅ Advantages:**
- **No Hosting**: Gratis dari Google
- **No Database**: Google Sheets sebagai database
- **No Setup**: Deploy dalam 5 menit
- **Mobile Ready**: Responsive design
- **Offline Capable**: Basic offline functionality
- **Auto Backup**: Google Sheets auto-backup
- **Collaborative**: Multi-user real-time
- **Secure**: Google infrastructure

### **📊 Performance:**
- **Fast Loading**: Optimized HTML/CSS/JS
- **Efficient API**: Minimal data transfer
- **Caching**: Browser caching enabled
- **Responsive**: Fast mobile performance

## 🚀 Deployment Options

### **Option 1: Direct Deploy**
- Deploy langsung dari Apps Script editor
- Simple dan cepat
- Untuk testing dan development

### **Option 2: Custom Domain**
- Setup custom domain dengan Google Apps Script
- Professional appearance
- Untuk production use

### **Option 3: G Suite Integration**
- Integrate dengan Google Workspace
- Single sign-on dengan Google accounts
- Enterprise features

## 📞 Support & Troubleshooting

### **Common Issues:**

#### **"Spreadsheet tidak ditemukan":**
- Check SPREADSHEET_ID di Code.gs
- Pastikan spreadsheet accessible
- Re-deploy Apps Script

#### **"Permission denied":**
- Re-authorize Apps Script
- Check permissions yang diminta
- Pastikan user akses spreadsheet

#### **"Web App tidak berjalan":**
- Check deployment status
- Verify doGet function exists
- Test dengan Apps Script editor

#### **"Data tidak tersimpan":**
- Check API request format
- Verify data structure
- Check error logs di Apps Script

### **Debugging:**
1. **Apps Script Logs**: Check execution logs
2. **Browser Console**: Check JavaScript errors
3. **Network Tab**: Check API requests
4. **Spreadsheet**: Verify data tersimpan

## 🎯 Use Cases

### **🏪 Small Retail:**
- Toko kelontong
- Minimarket
- Warung makanan
- Butik

### **📱 Mobile POS:**
- Sales di lapangan
- Event management
- Market stalls
- Delivery services

### **👥 Multi-User:**
- Kasir dan admin
- Remote management
- Multi-location
- Franchise system

## 🔄 Maintenance

### **Regular Tasks:**
- **Data Backup**: Google Sheets auto-backup
- **Performance Check**: Monitor load times
- **User Management**: Add/remove users
- **Feature Updates**: Deploy new features

### **Monitoring:**
- **Usage Statistics**: Track user activity
- **Error Logs**: Monitor system errors
- **Performance Metrics**: Check response times
- **Data Growth**: Monitor storage usage

## 🎉 Next Steps

### **Enhancements:**
- **Payment Integration**: Stripe, PayPal
- **Inventory Alerts**: Low stock notifications
- **Advanced Reports**: Custom report builder
- **API Integration**: Third-party services
- **Mobile App**: Native mobile app

### **Scaling:**
- **Multi-Store**: Multiple location support
- **Advanced Analytics**: Business intelligence
- **CRM Integration**: Customer relationship management
- **Accounting**: Financial reporting

---

## 🚀 **Ready to Deploy!**

**Aplikasi Smart Retail POS lengkap siap di-deploy ke Google Apps Script!**

### **📋 Quick Start:**
1. Copy `index.html` ke Apps Script HTML file
2. Copy `Code.gs` ke Apps Script editor
3. Update SPREADSHEET_ID
4. Deploy sebagai Web App
5. Akses aplikasi dari browser!

### **🌐 Result:**
- **Complete POS System** di Google Apps Script
- **Mobile Responsive** design
- **Real-time Data** dengan Google Sheets
- **No Hosting Costs** - Gratis dari Google
- **Professional UI** dengan modern design

**Deploy dalam 5 menit dan mulai menggunakan POS system Anda!** 🎉
