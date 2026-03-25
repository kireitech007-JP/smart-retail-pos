/**
 * Google Apps Script untuk Smart Retail POS
 * Script ini menghubungkan Google Sheets dengan aplikasi POS untuk sinkronisasi data
 * 
 * Cara Setup:
 * 1. Buat Google Sheets baru
 * 2. Buat sheet dengan nama: Transaksi, Produk, Pengguna, Laporan
 * 3. Copy script ini ke Apps Script Editor (Extensions > Apps Script)
 * 4. Deploy sebagai Web App
 * 5. Copy Web App URL dan masukkan ke pengaturan cloud di POS
 */

// Konfigurasi
const CONFIG = {
  // Sheet names
  SHEETS: {
    TRANSAKSI: 'Transaksi',
    PRODUK: 'Produk',
    PENGGUNA: 'Pengguna',
    LAPORAN: 'Laporan',
    LOG: 'Log'
  },
  
  // Headers untuk setiap sheet
  HEADERS: {
    TRANSAKSI: ['ID', 'Tanggal', 'Kasir', 'Unit', 'Pelanggan', 'Total', 'Diskon', 'Grand Total', 'Metode Pembayaran', 'Status', 'Created At'],
    PRODUK: ['ID', 'Nama', 'SKU', 'Kategori', 'Harga', 'HPP', 'Stok', 'Unit', 'Supplier', 'Created At', 'Updated At'],
    PENGGUNA: ['ID', 'Nama', 'Email', 'Role', 'Unit', 'Status', 'Created At'],
    LAPORAN: ['ID', 'Tanggal', 'Tipe', 'Kasir', 'Unit', 'Total', 'Deskripsi', 'Created At'],
    LOG: ['Timestamp', 'Action', 'Data', 'Status', 'Message']
  }
};

/**
 * Fungsi utama untuk handle POST request dari POS
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Log semua request
    logAction(action, data, 'REQUEST', `Received ${action} request`);
    
    let result;
    
    switch (action) {
      case 'syncTransaction':
        result = syncTransaction(data.transaction);
        break;
      case 'syncProduct':
        result = syncProduct(data.product);
        break;
      case 'syncUser':
        result = syncUser(data.user);
        break;
      case 'syncReport':
        result = syncReport(data.report);
        break;
      case 'getTransactions':
        result = getTransactions(data.filters);
        break;
      case 'getProducts':
        result = getProducts(data.filters);
        break;
      case 'getUsers':
        result = getUsers(data.filters);
        break;
      case 'getReports':
        result = getReports(data.filters);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    logAction(action, data, 'SUCCESS', `Successfully processed ${action}`);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result,
      message: `${action} completed successfully`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    logAction('ERROR', e.postData.contents, 'ERROR', error.message);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Request failed'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Sinkronisasi transaksi
 */
function syncTransaction(transaction) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.TRANSAKSI, CONFIG.HEADERS.TRANSAKSI);
  const lastRow = sheet.getLastRow();
  
  const rowData = [
    transaction.id || generateId(),
    transaction.date || new Date().toISOString(),
    transaction.cashier || '',
    transaction.unit || '',
    transaction.customer || '',
    transaction.total || 0,
    transaction.discount || 0,
    transaction.grandTotal || 0,
    transaction.paymentType || '',
    transaction.status || 'completed',
    new Date().toISOString()
  ];
  
  sheet.appendRow(rowData);
  
  return {
    id: rowData[0],
    row: lastRow + 1,
    message: 'Transaction synced successfully'
  };
}

/**
 * Sinkronisasi produk
 */
function syncProduct(product) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.PRODUK, CONFIG.HEADERS.PRODUK);
  
  // Cek apakah produk sudah ada (update jika ada)
  const existingRow = findProductRow(product.id);
  
  const rowData = [
    product.id || generateId(),
    product.name || '',
    product.sku || '',
    product.category || '',
    product.price || 0,
    product.hpp || 0,
    product.stock || 0,
    product.unit || '',
    product.supplier || '',
    product.createdAt || new Date().toISOString(),
    new Date().toISOString()
  ];
  
  if (existingRow > 0) {
    // Update existing product
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    return {
      id: rowData[0],
      row: existingRow,
      action: 'updated',
      message: 'Product updated successfully'
    };
  } else {
    // Add new product
    sheet.appendRow(rowData);
    return {
      id: rowData[0],
      row: sheet.getLastRow(),
      action: 'created',
      message: 'Product created successfully'
    };
  }
}

/**
 * Sinkronisasi user
 */
function syncUser(user) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.PENGGUNA, CONFIG.HEADERS.PENGGUNA);
  
  // Cek apakah user sudah ada
  const existingRow = findUserRow(user.id);
  
  const rowData = [
    user.id || generateId(),
    user.name || '',
    user.email || '',
    user.role || '',
    user.unit || '',
    user.status || 'active',
    user.createdAt || new Date().toISOString()
  ];
  
  if (existingRow > 0) {
    // Update existing user
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    return {
      id: rowData[0],
      row: existingRow,
      action: 'updated',
      message: 'User updated successfully'
    };
  } else {
    // Add new user
    sheet.appendRow(rowData);
    return {
      id: rowData[0],
      row: sheet.getLastRow(),
      action: 'created',
      message: 'User created successfully'
    };
  }
}

/**
 * Sinkronisasi laporan
 */
function syncReport(report) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.LAPORAN, CONFIG.HEADERS.LAPORAN);
  const lastRow = sheet.getLastRow();
  
  const rowData = [
    report.id || generateId(),
    report.date || new Date().toISOString(),
    report.type || '',
    report.cashier || '',
    report.unit || '',
    report.total || 0,
    report.description || '',
    new Date().toISOString()
  ];
  
  sheet.appendRow(rowData);
  
  return {
    id: rowData[0],
    row: lastRow + 1,
    message: 'Report synced successfully'
  };
}

/**
 * Get transaksi dengan filter
 */
function getTransactions(filters = {}) {
  const sheet = getSheet(CONFIG.SHEETS.TRANSAKSI);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Apply filters
  let filteredRows = rows;
  
  if (filters.startDate) {
    filteredRows = filteredRows.filter(row => {
      const date = new Date(row[headers.indexOf('Tanggal')]);
      return date >= new Date(filters.startDate);
    });
  }
  
  if (filters.endDate) {
    filteredRows = filteredRows.filter(row => {
      const date = new Date(row[headers.indexOf('Tanggal')]);
      return date <= new Date(filters.endDate);
    });
  }
  
  if (filters.cashier) {
    filteredRows = filteredRows.filter(row => 
      row[headers.indexOf('Kasir')].toString().toLowerCase().includes(filters.cashier.toLowerCase())
    );
  }
  
  // Convert to objects
  return filteredRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Get produk dengan filter
 */
function getProducts(filters = {}) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUK);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Apply filters
  let filteredRows = rows;
  
  if (filters.category) {
    filteredRows = filteredRows.filter(row => 
      row[headers.indexOf('Kategori')].toString().toLowerCase().includes(filters.category.toLowerCase())
    );
  }
  
  if (filters.unit) {
    filteredRows = filteredRows.filter(row => 
      row[headers.indexOf('Unit')].toString().toLowerCase().includes(filters.unit.toLowerCase())
    );
  }
  
  // Convert to objects
  return filteredRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Get users dengan filter
 */
function getUsers(filters = {}) {
  const sheet = getSheet(CONFIG.SHEETS.PENGGUNA);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Apply filters
  let filteredRows = rows;
  
  if (filters.role) {
    filteredRows = filteredRows.filter(row => 
      row[headers.indexOf('Role')].toString().toLowerCase().includes(filters.role.toLowerCase())
    );
  }
  
  if (filters.status) {
    filteredRows = filteredRows.filter(row => 
      row[headers.indexOf('Status')].toString().toLowerCase().includes(filters.status.toLowerCase())
    );
  }
  
  // Convert to objects
  return filteredRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Get laporan dengan filter
 */
function getReports(filters = {}) {
  const sheet = getSheet(CONFIG.SHEETS.LAPORAN);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Apply filters
  let filteredRows = rows;
  
  if (filters.startDate) {
    filteredRows = filteredRows.filter(row => {
      const date = new Date(row[headers.indexOf('Tanggal')]);
      return date >= new Date(filters.startDate);
    });
  }
  
  if (filters.endDate) {
    filteredRows = filteredRows.filter(row => {
      const date = new Date(row[headers.indexOf('Tanggal')]);
      return date <= new Date(filters.endDate);
    });
  }
  
  if (filters.type) {
    filteredRows = filteredRows.filter(row => 
      row[headers.indexOf('Tipe')].toString().toLowerCase().includes(filters.type.toLowerCase())
    );
  }
  
  // Convert to objects
  return filteredRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Helper functions
 */

function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.autoResizeColumns();
  }
  
  return sheet;
}

function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(sheetName);
}

function findProductRow(productId) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUK);
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues();
  const idColumn = data[0].indexOf('ID');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn] == productId) {
      return i + 1; // +1 karena sheet index dimulai dari 1
    }
  }
  
  return 0;
}

function findUserRow(userId) {
  const sheet = getSheet(CONFIG.SHEETS.PENGGUNA);
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues();
  const idColumn = data[0].indexOf('ID');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn] == userId) {
      return i + 1;
    }
  }
  
  return 0;
}

function generateId() {
  return 'POS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function logAction(action, data, status, message) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEETS.LOG, CONFIG.HEADERS.LOG);
    sheet.appendRow([
      new Date().toISOString(),
      action,
      JSON.stringify(data),
      status,
      message
    ]);
  } catch (error) {
    // Ignore log errors to prevent infinite loops
  }
}

/**
 * Setup function - jalankan sekali untuk inisialisasi
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Buat semua sheets
  Object.keys(CONFIG.SHEETS).forEach(key => {
    const sheetName = CONFIG.SHEETS[key];
    const headers = CONFIG.HEADERS[sheetName];
    
    if (!ss.getSheetByName(sheetName)) {
      const sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.autoResizeColumns();
    }
  });
  
  // Buat sheet Log tersembunyi
  const logSheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
  if (logSheet) {
    logSheet.hideSheet();
  }
  
  return 'Setup completed successfully!';
}

/**
 * Test function untuk debugging
 */
function testConnection() {
  return {
    success: true,
    message: 'Google Apps Script connection successful',
    timestamp: new Date().toISOString(),
    spreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName()
  };
}
