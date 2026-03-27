// Google Apps Script untuk Smart Retail POS
// File: kode.gs
// Fungsi: Backup & Restore data dari/to Supabase dan Google Sheets

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
  PIUTANG: "Piutang",
  KAS_MASUK: "Kas Masuk",
  PENGELUARAN: "Pengeluaran",
  LAPORAN: "Laporan",
  SESSIONS: "Sessions"
};

/**
 * Main function untuk testing
 */
function testFunction() {
  Logger.log("Google Apps Script berjalan dengan baik!");
  return "OK - Google Apps Script Ready";
}

/**
 * Fungsi utama untuk handle POST requests
 */
function doPost(e) {
  try {
    const postData = e.postData || e.parameter || {};
    logBackup('RAW_REQUEST', {
      postData: postData,
      contents: postData.contents || postData,
      contentType: postData.type || 'unknown'
    }, 'REQUEST', 'Raw request received');
    
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
      throw new Error(`Invalid JSON format: ${parseError.message}. Content: ${JSON.stringify(postData)}`);
    }
    
    logBackup('PARSED_DATA', {
      action: data.action,
      dataType: data.dataType,
      recordCount: Array.isArray(data.data) ? data.data.length : 'N/A'
    }, 'REQUEST', 'Data parsed successfully');

    let result;
    switch (data.action) {
      case 'backupAllData':
        result = handleBackupAllData(data.data);
        break;
      case 'backupKategori':
        result = handleBackupKategori(data.data);
        break;
      case 'backupSatuan':
        result = handleBackupSatuan(data.data);
        break;
      case 'backupProduk':
        result = handleBackupProduk(data.data);
        break;
      case 'backupPengguna':
        result = handleBackupPengguna(data.data);
        break;
      case 'backupUnit':
        result = handleBackupUnit(data.data);
        break;
      case 'backupTransaksi':
        result = handleBackupTransaksi(data.data);
        break;
      case 'backupTransaksiItems':
        result = handleBackupTransaksiItems(data.data);
        break;
      case 'backupPiutang':
        result = handleBackupPiutang(data.data);
        break;
      case 'backupKasMasuk':
        result = handleBackupKasMasuk(data.data);
        break;
      case 'backupPengeluaran':
        result = handleBackupPengeluaran(data.data);
        break;
      case 'backupSessions':
        result = handleBackupSessions(data.data);
        break;
      case 'restoreAllData':
        result = handleRestoreAllData();
        break;
      case 'getKategori':
        result = handleGetKategori();
        break;
      case 'getSatuan':
        result = handleGetSatuan();
        break;
      case 'getProduk':
        result = handleGetProduk();
        break;
      case 'getPengguna':
        result = handleGetPengguna();
        break;
      case 'getUnit':
        result = handleGetUnit();
        break;
      case 'getTransaksi':
        result = handleGetTransaksi();
        break;
      case 'getTransaksiItems':
        result = handleGetTransaksiItems();
        break;
      case 'getPiutang':
        result = handleGetPiutang();
        break;
      case 'getKasMasuk':
        result = handleGetKasMasuk();
        break;
      case 'getPengeluaran':
        result = handleGetPengeluaran();
        break;
      case 'getSessions':
        result = handleGetSessions();
        break;
      case 'clearAllData':
        result = handleClearAllData();
        break;
      case 'testConnection':
        result = handleTestConnection();
        break;
      default:
        throw new Error(`Unknown action: ${data.action}`);
    }

    logBackup('SUCCESS_RESPONSE', {
      action: data.action,
      success: result.success,
      message: result.message,
      recordCount: result.count || 0
    }, 'RESPONSE', 'Request processed successfully');

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    logBackup('ERROR', {
      error: error.message,
      stack: error.stack,
      action: data?.action || 'unknown'
    }, 'ERROR', 'Request failed');

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle backup semua data
 */
function handleBackupAllData(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Backup setiap table
    if (data.kategori && data.kategori.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.KATEGORI, data.kategori);
    }
    if (data.satuan && data.satuan.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.SATUAN, data.satuan);
    }
    if (data.produk && data.produk.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.PRODUK, data.produk);
    }
    if (data.pengguna && data.pengguna.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.PENGGUNA, data.pengguna);
    }
    if (data.unit && data.unit.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.UNIT, data.unit);
    }
    if (data.transaksi && data.transaksi.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.TRANSAKSI, data.transaksi);
    }
    if (data.transaksiItems && data.transaksiItems.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.TRANSAKSI_ITEMS, data.transaksiItems);
    }
    if (data.piutang && data.piutang.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.PIUTANG, data.piutang);
    }
    if (data.kasMasuk && data.kasMasuk.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.KAS_MASUK, data.kasMasuk);
    }
    if (data.pengeluaran && data.pengeluaran.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.PENGELUARAN, data.pengeluaran);
    }
    if (data.sessions && data.sessions.length > 0) {
      backupToSheet(spreadsheet, SHEET_NAMES.SESSIONS, data.sessions);
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
 * Handle backup kategori
 */
function handleBackupKategori(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.KATEGORI, data);
    
    return {
      success: true,
      message: "Kategori berhasil di-backup",
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
 * Handle backup satuan
 */
function handleBackupSatuan(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.SATUAN, data);
    
    return {
      success: true,
      message: "Satuan berhasil di-backup",
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
 * Handle backup produk
 */
function handleBackupProduk(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.PRODUK, data);
    
    return {
      success: true,
      message: "Produk berhasil di-backup",
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
 * Handle backup pengguna
 */
function handleBackupPengguna(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.PENGGUNA, data);
    
    return {
      success: true,
      message: "Pengguna berhasil di-backup",
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
 * Handle backup unit
 */
function handleBackupUnit(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.UNIT, data);
    
    return {
      success: true,
      message: "Unit berhasil di-backup",
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
 * Handle backup transaksi
 */
function handleBackupTransaksi(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.TRANSAKSI, data);
    
    return {
      success: true,
      message: "Transaksi berhasil di-backup",
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
 * Handle backup transaksi items
 */
function handleBackupTransaksiItems(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.TRANSAKSI_ITEMS, data);
    
    return {
      success: true,
      message: "Transaksi Items berhasil di-backup",
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
 * Handle backup piutang
 */
function handleBackupPiutang(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.PIUTANG, data);
    
    return {
      success: true,
      message: "Piutang berhasil di-backup",
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
 * Handle backup kas masuk
 */
function handleBackupKasMasuk(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.KAS_MASUK, data);
    
    return {
      success: true,
      message: "Kas Masuk berhasil di-backup",
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
 * Handle backup pengeluaran
 */
function handleBackupPengeluaran(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.PENGELUARAN, data);
    
    return {
      success: true,
      message: "Pengeluaran berhasil di-backup",
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
 * Handle backup sessions
 */
function handleBackupSessions(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    backupToSheet(spreadsheet, SHEET_NAMES.SESSIONS, data);
    
    return {
      success: true,
      message: "Sessions berhasil di-backup",
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
    result.data.kategori = getFromSheet(spreadsheet, SHEET_NAMES.KATEGORI);
    result.data.satuan = getFromSheet(spreadsheet, SHEET_NAMES.SATUAN);
    result.data.produk = getFromSheet(spreadsheet, SHEET_NAMES.PRODUK);
    result.data.pengguna = getFromSheet(spreadsheet, SHEET_NAMES.PENGGUNA);
    result.data.unit = getFromSheet(spreadsheet, SHEET_NAMES.UNIT);
    result.data.transaksi = getFromSheet(spreadsheet, SHEET_NAMES.TRANSAKSI);
    result.data.transaksiItems = getFromSheet(spreadsheet, SHEET_NAMES.TRANSAKSI_ITEMS);
    result.data.piutang = getFromSheet(spreadsheet, SHEET_NAMES.PIUTANG);
    result.data.kasMasuk = getFromSheet(spreadsheet, SHEET_NAMES.KAS_MASUK);
    result.data.pengeluaran = getFromSheet(spreadsheet, SHEET_NAMES.PENGELUARAN);
    result.data.sessions = getFromSheet(spreadsheet, SHEET_NAMES.SESSIONS);

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
 * Handle get kategori
 */
function handleGetKategori() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.KATEGORI);
    
    return {
      success: true,
      message: "Kategori berhasil diambil",
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
 * Handle get satuan
 */
function handleGetSatuan() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.SATUAN);
    
    return {
      success: true,
      message: "Satuan berhasil diambil",
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
 * Handle get produk
 */
function handleGetProduk() {
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
 * Handle get pengguna
 */
function handleGetPengguna() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.PENGGUNA);
    
    return {
      success: true,
      message: "Pengguna berhasil diambil",
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
 * Handle get unit
 */
function handleGetUnit() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.UNIT);
    
    return {
      success: true,
      message: "Unit berhasil diambil",
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
 * Handle get transaksi
 */
function handleGetTransaksi() {
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
 * Handle get transaksi items
 */
function handleGetTransaksiItems() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.TRANSAKSI_ITEMS);
    
    return {
      success: true,
      message: "Transaksi Items berhasil diambil",
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
 * Handle get piutang
 */
function handleGetPiutang() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.PIUTANG);
    
    return {
      success: true,
      message: "Piutang berhasil diambil",
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
 * Handle get kas masuk
 */
function handleGetKasMasuk() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.KAS_MASUK);
    
    return {
      success: true,
      message: "Kas Masuk berhasil diambil",
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
 * Handle get pengeluaran
 */
function handleGetPengeluaran() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.PENGELUARAN);
    
    return {
      success: true,
      message: "Pengeluaran berhasil diambil",
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
 * Handle get sessions
 */
function handleGetSessions() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const data = getFromSheet(spreadsheet, SHEET_NAMES.SESSIONS);
    
    return {
      success: true,
      message: "Sessions berhasil diambil",
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
 * Handle clear all data
 */
function handleClearAllData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Clear setiap sheet
    clearSheet(spreadsheet, SHEET_NAMES.KATEGORI);
    clearSheet(spreadsheet, SHEET_NAMES.SATUAN);
    clearSheet(spreadsheet, SHEET_NAMES.PRODUK);
    clearSheet(spreadsheet, SHEET_NAMES.PENGGUNA);
    clearSheet(spreadsheet, SHEET_NAMES.UNIT);
    clearSheet(spreadsheet, SHEET_NAMES.TRANSAKSI);
    clearSheet(spreadsheet, SHEET_NAMES.TRANSAKSI_ITEMS);
    clearSheet(spreadsheet, SHEET_NAMES.PIUTANG);
    clearSheet(spreadsheet, SHEET_NAMES.KAS_MASUK);
    clearSheet(spreadsheet, SHEET_NAMES.PENGELUARAN);
    clearSheet(spreadsheet, SHEET_NAMES.SESSIONS);

    return {
      success: true,
      message: "Semua data berhasil dihapus dari Google Sheets",
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
 * Handle test connection
 */
function handleTestConnection() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetName = spreadsheet.getSheetName();
    
    return {
      success: true,
      message: "Koneksi Google Sheets berhasil!",
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
      
      logBackup('SHEET_BACKUP', {
        sheetName: sheetName,
        recordCount: data.length,
        headers: headers
      }, 'BACKUP', `Data backed up to ${sheetName}`);
    }
  } catch (error) {
    logBackup('SHEET_BACKUP_ERROR', {
      sheetName: sheetName,
      error: error.message
    }, 'ERROR', `Failed to backup to ${sheetName}`);
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
    
    logBackup('SHEET_RESTORE', {
      sheetName: sheetName,
      recordCount: result.length,
      headers: headers
    }, 'RESTORE', `Data restored from ${sheetName}`);
    
    return result;
  } catch (error) {
    logBackup('SHEET_RESTORE_ERROR', {
      sheetName: sheetName,
      error: error.message
    }, 'ERROR', `Failed to restore from ${sheetName}`);
    return [];
  }
}

/**
 * Utility function untuk clear sheet
 */
function clearSheet(spreadsheet, sheetName) {
  try {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      sheet.clear();
      logBackup('SHEET_CLEAR', {
        sheetName: sheetName
      }, 'CLEAR', `Sheet ${sheetName} cleared`);
    }
  } catch (error) {
    logBackup('SHEET_CLEAR_ERROR', {
      sheetName: sheetName,
      error: error.message
    }, 'ERROR', `Failed to clear ${sheetName}`);
    throw error;
  }
}

/**
 * Utility function untuk logging
 */
function logBackup(action, data, type, message) {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      action: action,
      type: type,
      message: message,
      data: data
    };
    
    Logger.log(JSON.stringify(logData));
    
    // Jika ada log sheet, simpan juga
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = spreadsheet.getSheetByName("Backup Logs");
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet("Backup Logs", 0);
    }
    
    const logRow = [
      logData.timestamp,
      logData.action,
      logData.type,
      logData.message,
      JSON.stringify(logData.data)
    ];
    
    logSheet.appendRow(logRow);
    
    // Keep only last 1000 log entries
    const lastRow = logSheet.getLastRow();
    if (lastRow > 1000) {
      logSheet.deleteRows(1, lastRow - 1000);
    }
    
  } catch (error) {
    Logger.log(`Log error: ${error.message}`);
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
    
    // Create log sheet
    let logSheet = spreadsheet.getSheetByName("Backup Logs");
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet("Backup Logs", 0);
      const headers = ["Timestamp", "Action", "Type", "Message", "Data"];
      logSheet.appendRow(headers);
      Logger.log("Created Backup Logs sheet");
    }
    
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

/**
 * Function untuk debug data structure
 */
function debugDataStructure() {
  const sampleData = {
    kategori: [
      { id: 'kat1', nama: 'Makanan', deskripsi: 'Kategori makanan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    satuan: [
      { id: 'sat1', nama: 'Pcs', deskripsi: 'Pieces', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    produk: [
      { id: 'prod1', nama: 'Nasi Goreng', sku: 'NG001', kategori_id: 'kat1', satuan_id: 'sat1', harga: 15000, hpp: 10000, stok: 50, min_stok: 5, supplier: 'Supplier A', unit_id: 'unit1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    pengguna: [
      { id: 'user1', nama: 'Admin', email: 'admin@store.com', password: 'hashed123', role: 'admin', unit_id: 'unit1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    unit: [
      { id: 'unit1', nama: 'Toko Utama', alamat: 'Jl. Merdeka No. 1', telepon: '08123456789', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    transaksi: [],
    transaksiItems: [],
    piutang: [],
    kasMasuk: [],
    pengeluaran: [],
    laporan: [],
    sessions: []
  };
  
  Logger.log("Sample data structure:");
  Logger.log(JSON.stringify(sampleData, null, 2));
  
  return sampleData;
}

/**
 * Function untuk test backup dengan sample data
 */
function testBackupWithSampleData() {
  const sampleData = debugDataStructure();
  
  try {
    const result = handleBackupAllData(sampleData);
    Logger.log("Test backup result:");
    Logger.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    Logger.log("Test backup error:");
    Logger.log(error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
