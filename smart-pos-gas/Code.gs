// Google Apps Script untuk Smart Retail POS Web App
// File: Code.gs
// Fungsi: Backend untuk web app HTML

// Global variables
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const SHEET_NAMES = {
  KATEGORI: "Kategori",
  SATUAN: "Satuan", 
  PRODUK: "Produk",
  PENGGUNA: "Pengguna",
  UNIT: "Unit",
  TRANSAKSI: "Transaksi",
  TRANSAKSI_ITEMS: "Transaksi Items",
  PELANGGAN: "Pelanggan",
  PIUTANG: "Piutang",
  KAS_MASUK: "Kas Masuk",
  PENGELUARAN: "Pengeluaran",
  LAPORAN: "Laporan",
  SESSIONS: "Sessions"
};

/**
 * Fungsi utama untuk serve HTML
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Smart Retail POS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Fungsi untuk handle POST requests
 */
function doPost(e) {
  try {
    const postData = e.postData || e.parameter || {};
    let data;
    
    try {
      const content = postData.contents || postData;
      if (typeof content === 'string') {
        data = JSON.parse(content);
      } else if (typeof content === 'object') {
        data = content;
      } else {
        throw new Error(`Invalid content type: ${typeof content}`);
      }
    } catch (parseError) {
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }
    
    let result;
    switch (data.action) {
      case 'backupAllData':
        result = handleBackupAllData(data.data);
        break;
      case 'restoreAllData':
        result = handleRestoreAllData();
        break;
      case 'getProducts':
        result = handleGetProducts();
        break;
      case 'getTransactions':
        result = handleGetTransactions();
        break;
      case 'getCustomers':
        result = handleGetCustomers();
        break;
      case 'addProduct':
        result = handleAddProduct(data.product);
        break;
      case 'addTransaction':
        result = handleAddTransaction(data.transaction);
        break;
      case 'addCustomer':
        result = handleAddCustomer(data.customer);
        break;
      case 'updateProduct':
        result = handleUpdateProduct(data.product);
        break;
      case 'updateTransaction':
        result = handleUpdateTransaction(data.transaction);
        break;
      case 'updateCustomer':
        result = handleUpdateCustomer(data.customer);
        break;
      case 'deleteProduct':
        result = handleDeleteProduct(data.id);
        break;
      case 'deleteTransaction':
        result = handleDeleteTransaction(data.id);
        break;
      case 'deleteCustomer':
        result = handleDeleteCustomer(data.id);
        break;
      case 'getDashboardData':
        result = handleGetDashboardData();
        break;
      case 'getReport':
        result = handleGetReport(data.startDate, data.endDate);
        break;
      case 'testConnection':
        result = handleTestConnection();
        break;
      default:
        throw new Error(`Unknown action: ${data.action}`);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle get products
 */
function handleGetProducts() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.PRODUK);
    
    return {
      success: true,
      message: "Produk berhasil diambil",
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle get transactions
 */
function handleGetTransactions() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.TRANSAKSI);
    
    return {
      success: true,
      message: "Transaksi berhasil diambil",
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle get customers
 */
function handleGetCustomers() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.PELANGGAN);
    
    return {
      success: true,
      message: "Pelanggan berhasil diambil",
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle add product
 */
function handleAddProduct(product) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAMES.PRODUK);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAMES.PRODUK);
      // Add headers
      const headers = ['id', 'nama', 'sku', 'kategori_id', 'satuan_id', 'harga', 'hpp', 'stok', 'min_stok', 'supplier', 'unit_id', 'created_at', 'updated_at'];
      sheet.appendRow(headers);
    }
    
    // Generate ID
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
    
    // Add timestamp
    product.id = newId;
    product.created_at = new Date().toISOString();
    product.updated_at = new Date().toISOString();
    
    // Add to sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => product[header] || '');
    sheet.appendRow(row);
    
    return {
      success: true,
      message: "Produk berhasil ditambahkan",
      data: product,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle add transaction
 */
function handleAddTransaction(transaction) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAMES.TRANSAKSI);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAMES.TRANSAKSI);
      // Add headers
      const headers = ['id', 'date', 'cashier_name', 'customer_name', 'customer_phone', 'subtotal', 'discount', 'tax', 'grand_total', 'payment_type', 'cash_paid', 'cash_change', 'dp', 'unit_id', 'created_at', 'updated_at'];
      sheet.appendRow(headers);
    }
    
    // Generate ID
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? 'TRX' + String(parseInt(sheet.getRange(lastRow, 1).getValue().replace('TRX', '')) + 1).padStart(3, '0') : 'TRX001';
    
    // Add timestamp
    transaction.id = newId;
    transaction.date = new Date().toISOString();
    transaction.created_at = new Date().toISOString();
    transaction.updated_at = new Date().toISOString();
    
    // Add to sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => transaction[header] || '');
    sheet.appendRow(row);
    
    return {
      success: true,
      message: "Transaksi berhasil ditambahkan",
      data: transaction,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle add customer
 */
function handleAddCustomer(customer) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAMES.PELANGGAN);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAMES.PELANGGAN);
      // Add headers
      const headers = ['id', 'nama', 'telepon', 'email', 'alamat', 'created_at', 'updated_at'];
      sheet.appendRow(headers);
    }
    
    // Generate ID
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
    
    // Add timestamp
    customer.id = newId;
    customer.created_at = new Date().toISOString();
    customer.updated_at = new Date().toISOString();
    
    // Add to sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => customer[header] || '');
    sheet.appendRow(row);
    
    return {
      success: true,
      message: "Pelanggan berhasil ditambahkan",
      data: customer,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle update product
 */
function handleUpdateProduct(product) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.PRODUK);
    
    if (!sheet) {
      throw new Error("Sheet produk tidak ditemukan");
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find product by ID
    let productIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == product.id) {
        productIndex = i;
        break;
      }
    }
    
    if (productIndex === -1) {
      throw new Error("Produk tidak ditemukan");
    }
    
    // Update timestamp
    product.updated_at = new Date().toISOString();
    
    // Update row
    const row = headers.map(header => product[header] || '');
    sheet.getRange(productIndex + 1, 1, 1, row.length).setValues([row]);
    
    return {
      success: true,
      message: "Produk berhasil diupdate",
      data: product,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle update transaction
 */
function handleUpdateTransaction(transaction) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.TRANSAKSI);
    
    if (!sheet) {
      throw new Error("Sheet transaksi tidak ditemukan");
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find transaction by ID
    let transactionIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == transaction.id) {
        transactionIndex = i;
        break;
      }
    }
    
    if (transactionIndex === -1) {
      throw new Error("Transaksi tidak ditemukan");
    }
    
    // Update timestamp
    transaction.updated_at = new Date().toISOString();
    
    // Update row
    const row = headers.map(header => transaction[header] || '');
    sheet.getRange(transactionIndex + 1, 1, 1, row.length).setValues([row]);
    
    return {
      success: true,
      message: "Transaksi berhasil diupdate",
      data: transaction,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle update customer
 */
function handleUpdateCustomer(customer) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.PELANGGAN);
    
    if (!sheet) {
      throw new Error("Sheet pelanggan tidak ditemukan");
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find customer by ID
    let customerIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == customer.id) {
        customerIndex = i;
        break;
      }
    }
    
    if (customerIndex === -1) {
      throw new Error("Pelanggan tidak ditemukan");
    }
    
    // Update timestamp
    customer.updated_at = new Date().toISOString();
    
    // Update row
    const row = headers.map(header => customer[header] || '');
    sheet.getRange(customerIndex + 1, 1, 1, row.length).setValues([row]);
    
    return {
      success: true,
      message: "Pelanggan berhasil diupdate",
      data: customer,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle delete product
 */
function handleDeleteProduct(id) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.PRODUK);
    
    if (!sheet) {
      throw new Error("Sheet produk tidak ditemukan");
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Find product by ID
    let productIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        productIndex = i;
        break;
      }
    }
    
    if (productIndex === -1) {
      throw new Error("Produk tidak ditemukan");
    }
    
    // Delete row
    sheet.deleteRow(productIndex + 1);
    
    return {
      success: true,
      message: "Produk berhasil dihapus",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle delete transaction
 */
function handleDeleteTransaction(id) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.TRANSAKSI);
    
    if (!sheet) {
      throw new Error("Sheet transaksi tidak ditemukan");
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Find transaction by ID
    let transactionIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        transactionIndex = i;
        break;
      }
    }
    
    if (transactionIndex === -1) {
      throw new Error("Transaksi tidak ditemukan");
    }
    
    // Delete row
    sheet.deleteRow(transactionIndex + 1);
    
    return {
      success: true,
      message: "Transaksi berhasil dihapus",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle delete customer
 */
function handleDeleteCustomer(id) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.PELANGGAN);
    
    if (!sheet) {
      throw new Error("Sheet pelanggan tidak ditemukan");
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Find customer by ID
    let customerIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        customerIndex = i;
        break;
      }
    }
    
    if (customerIndex === -1) {
      throw new Error("Pelanggan tidak ditemukan");
    }
    
    // Delete row
    sheet.deleteRow(customerIndex + 1);
    
    return {
      success: true,
      message: "Pelanggan berhasil dihapus",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle get dashboard data
 */
function handleGetDashboardData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Get data from sheets
    const products = getFromSheet(spreadsheet, SHEET_NAMES.PRODUK);
    const transactions = getFromSheet(spreadsheet, SHEET_NAMES.TRANSAKSI);
    const customers = getFromSheet(spreadsheet, SHEET_NAMES.PELANGGAN);
    
    // Calculate today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => 
      t.date && t.date.startsWith(today)
    );
    
    const todayRevenue = todayTransactions.reduce((sum, t) => 
      sum + (parseFloat(t.grand_total) || 0), 0
    );
    
    return {
      success: true,
      message: "Dashboard data berhasil diambil",
      data: {
        totalProducts: products.length,
        totalTransactions: todayTransactions.length,
        totalRevenue: todayRevenue,
        totalCustomers: customers.length,
        recentTransactions: todayTransactions.slice(-5),
        lowStockProducts: products.filter(p => 
          parseInt(p.stok) < parseInt(p.min_stok || 5)
        )
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle get report
 */
function handleGetReport(startDate, endDate) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const transactions = getFromSheet(spreadsheet, SHEET_NAMES.TRANSAKSI);
    
    // Filter by date range
    const filteredTransactions = transactions.filter(t => {
      if (!t.date) return false;
      const transactionDate = t.date.split('T')[0];
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // Calculate statistics
    const totalRevenue = filteredTransactions.reduce((sum, t) => 
      sum + (parseFloat(t.grand_total) || 0), 0
    );
    
    const totalTransactions = filteredTransactions.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Group by date
    const dailyStats = {};
    filteredTransactions.forEach(t => {
      const date = t.date.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, revenue: 0 };
      }
      dailyStats[date].count++;
      dailyStats[date].revenue += parseFloat(t.grand_total) || 0;
    });
    
    return {
      success: true,
      message: "Laporan berhasil dibuat",
      data: {
        startDate: startDate,
        endDate: endDate,
        totalRevenue: totalRevenue,
        totalTransactions: totalTransactions,
        averageTransaction: averageTransaction,
        dailyStats: dailyStats,
        transactions: filteredTransactions
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle backup semua data
 */
function handleBackupAllData(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Backup setiap table
    if (data.products && data.products.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.PRODUK, data.products);
    }
    if (data.transactions && data.transactions.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.TRANSAKSI, data.transactions);
    }
    if (data.customers && data.customers.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.PELANGGAN, data.customers);
    }

    return {
      success: true,
      message: "Semua data berhasil di-backup ke Google Sheets",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle restore semua data
 */
function handleRestoreAllData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    const result = {
      success: true,
      message: "Data berhasil di-restore dari Google Sheets",
      data: {},
      timestamp: new Date().toISOString()
    };

    // Get data dari setiap sheet
    result.data.products = getFromSheet(spreadsheet, SHEET_NAMES.PRODUK);
    result.data.transactions = getFromSheet(spreadsheet, SHEET_NAMES.TRANSAKSI);
    result.data.customers = getFromSheet(spreadsheet, SHEET_NAMES.PELANGGAN);

    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle test connection
 */
function handleTestConnection() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetName = spreadsheet.getSheetName();
    
    return {
      success: true,
      message: "Koneksi Google Apps Script berhasil!",
      spreadsheetId: SPREADSHEET_ID,
      sheetName: sheetName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Utility function untuk backup data ke sheet
 */
function backupToSheet(spreadsheet, sheetName, data) {
  try {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    // Clear existing data
    sheet.clear();
    
    if (data && data.length > 0) {
      // Get headers dari first object
      const headers = Object.keys(data[0]);
      
      // Prepare data array
      const dataArray = [headers];
      data.forEach(item => {
        const row = headers.map(header => item[header] || '');
        dataArray.push(row);
      });
      
      // Write data
      sheet.getRange(1, 1, dataArray.length, dataArray[0].length)
        .setValues(dataArray);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Utility function untuk get data dari sheet
 */
function getFromSheet(spreadsheet, sheetName) {
  try {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0];
    const result = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      result.push(obj);
    }
    
    return result;
  } catch (error) {
    return [];
  }
}

/**
 * Function untuk setup spreadsheet pertama kali
 */
function setupSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Create semua sheets yang dibutuhkan
    const sheetNames = Object.values(SHEET_NAMES);
    sheetNames.forEach(sheetName => {
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        Logger.log(`Created sheet: ${sheetName}`);
      }
    });
    
    return {
      success: true,
      message: "Spreadsheet setup completed",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
