/**
 * Google Apps Script untuk Backup & Restore Smart Retail POS
 * Script ini melakukan backup lengkap semua data dari POS ke Google Sheets
 * Termasuk: Produk, Kategori, Satuan, Pengguna, Transaksi, Piutang, Kas Masuk, Pengeluaran, Laporan
 * 
 * Cara Setup:
 * 1. Buat Google Sheets baru dengan nama "Smart Retail POS Backup"
 * 2. Copy script ini ke Apps Script Editor
 * 3. Deploy sebagai Web App
 * 4. Copy Web App URL dan masukkan ke pengaturan cloud di POS
 */

// Konfigurasi
const CONFIG = {
  // Sheet names
  SHEETS: {
    KATEGORI: 'Kategori',
    SATUAN: 'Satuan', 
    PRODUK: 'Produk',
    PENGGUNA: 'Pengguna',
    UNIT: 'Unit',
    TRANSAKSI: 'Transaksi',
    TRANSAKSI_ITEMS: 'Transaksi_Items',
    PIUTANG: 'Piutang',
    KAS_MASUK: 'Kas_Masuk',
    PENGELUARAN: 'Pengeluaran',
    LAPORAN: 'Laporan',
    SESSIONS: 'Sessions',
    BACKUP_LOG: 'Backup_Log'
  },
  
  // Headers untuk setiap sheet
  HEADERS: {
    KATEGORI: ['id', 'nama', 'deskripsi', 'created_at', 'updated_at'],
    SATUAN: ['id', 'nama', 'deskripsi', 'created_at', 'updated_at'],
    PRODUK: ['id', 'nama', 'sku', 'kategori_id', 'satuan_id', 'harga', 'hpp', 'stok', 'min_stok', 'supplier', 'unit_id', 'created_at', 'updated_at'],
    PENGGUNA: ['id', 'nama', 'email', 'password', 'role', 'unit_id', 'status', 'created_at', 'updated_at'],
    UNIT: ['id', 'nama', 'alamat', 'telepon', 'created_at', 'updated_at'],
    TRANSAKSI: ['id', 'tanggal', 'kasir_id', 'unit_id', 'customer_name', 'customer_phone', 'payment_type', 'subtotal', 'discount', 'grand_total', 'cash_paid', 'change', 'status', 'session_id', 'created_at'],
    TRANSAKSI_ITEMS: ['id', 'transaction_id', 'product_id', 'product_name', 'qty', 'price', 'hpp', 'subtotal', 'created_at'],
    PIUTANG: ['id', 'customer_name', 'customer_phone', 'total_amount', 'paid_amount', 'remaining_amount', 'unit_id', 'status', 'created_at', 'updated_at'],
    KAS_MASUK: ['id', 'amount', 'depositor_name', 'description', 'unit_id', 'session_id', 'date', 'created_at'],
    PENGELUARAN: ['id', 'amount', 'description', 'unit_id', 'session_id', 'date', 'created_at'],
    LAPORAN: ['id', 'tanggal', 'tipe', 'kasir_id', 'unit_id', 'total', 'deskripsi', 'session_id', 'created_at'],
    SESSIONS: ['id', 'cashier_id', 'unit_id', 'opening_cash', 'opening_time', 'closing_cash', 'closing_time', 'status', 'created_at'],
    BACKUP_LOG: ['timestamp', 'action', 'table', 'records_count', 'status', 'message']
  }
};

/**
 * Fungsi utama untuk handle POST request dari POS
 */
function doPost(e) {
  try {
    // Log raw request untuk debugging
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
    
    const action = data.action;
    
    // Log parsed data untuk debugging
    logBackup('PARSED_DATA', {
      action: action,
      dataType: typeof data,
      hasDataProperty: data.hasOwnProperty('data'),
      dataPropertyType: typeof data.data,
      dataKeys: Object.keys(data)
    }, 'REQUEST', `Parsed ${action} request`);
    
    let result;
    
    switch (action) {
      case 'backupAllData':
        // Handle berbagai kemungkinan struktur data
        let backupData = data.data || data;
        if (!backupData) {
          // Coba apakah data langsung dikirim tanpa wrapper
          backupData = data;
        }
        
        logBackup('BACKUP_DATA_CHECK', {
          backupDataType: typeof backupData,
          backupDataKeys: typeof backupData === 'object' && backupData !== null ? Object.keys(backupData) : 'N/A',
          isNull: backupData === null,
          isUndefined: backupData === undefined,
          isArray: Array.isArray(backupData)
        }, 'REQUEST', 'Checking backup data structure');
        
        result = backupAllData(backupData);
        break;
      case 'restoreAllData':
        result = restoreAllData();
        break;
      case 'backupKategori':
        result = backupKategori(data.kategori);
        break;
      case 'backupSatuan':
        result = backupSatuan(data.satuan);
        break;
      case 'backupProduk':
        result = backupProduk(data.produk);
        break;
      case 'backupPengguna':
        result = backupPengguna(data.pengguna);
        break;
      case 'backupUnit':
        result = backupUnit(data.unit);
        break;
      case 'backupTransaksi':
        result = backupTransaksi(data.transaksi);
        break;
      case 'backupTransaksiItems':
        result = backupTransaksiItems(data.items);
        break;
      case 'backupPiutang':
        result = backupPiutang(data.piutang);
        break;
      case 'backupKasMasuk':
        result = backupKasMasuk(data.kasMasuk);
        break;
      case 'backupPengeluaran':
        result = backupPengeluaran(data.pengeluaran);
        break;
      case 'backupLaporan':
        result = backupLaporan(data.laporan);
        break;
      case 'backupSessions':
        result = backupSessions(data.sessions);
        break;
      case 'getAllData':
        result = getAllData();
        break;
      case 'getPengguna':
        result = getPengguna();
        break;
      case 'getProduk':
        result = getProduk();
        break;
      case 'debugRequest':
        result = {
          receivedData: data,
          dataType: typeof data,
          dataKeys: Object.keys(data),
          rawContent: postData.contents || postData
        };
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    logBackup(action, data, 'SUCCESS', `Successfully processed ${action}`);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result,
      message: `${action} completed successfully`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    logBackup('ERROR', postData ? postData.contents || postData : 'No post data', 'ERROR', error.message);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Request failed',
      debug: {
        hasPostData: !!postData,
        postDataType: typeof postData,
        postDataContents: postData ? postData.contents || postData : 'No contents'
      }
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Backup semua data dari POS
 */
function backupAllData(allData) {
  const results = {};
  
  try {
    // Log input data untuk debugging
    logBackup('BACKUP_INPUT', {
      inputType: typeof allData,
      inputIsNull: allData === null,
      inputIsUndefined: allData === undefined,
      inputIsArray: Array.isArray(allData),
      inputKeys: typeof allData === 'object' && allData !== null ? Object.keys(allData) : 'N/A',
      inputString: JSON.stringify(allData)
    }, 'REQUEST', 'Analyzing backup input data');
    
    // Cek apakah allData ada dan adalah object
    if (!allData || typeof allData !== 'object' || Array.isArray(allData)) {
      // Jika bukan object yang valid, coba beberapa fallback
      if (allData === null || allData === undefined) {
        // Buat object kosong jika null/undefined
        allData = {};
        logBackup('FALLBACK', 'Created empty object for null/undefined input', 'REQUEST', 'Fallback applied');
      } else if (Array.isArray(allData)) {
        // Jika array, mungkin data langsung dikirim sebagai array
        // Asumsikan ini array dari semua data gabungan
        allData = {
          transaksi: allData,
          kategori: [],
          satuan: [],
          produk: [],
          pengguna: [],
          unit: [],
          transaksiItems: [],
          piutang: [],
          kasMasuk: [],
          pengeluaran: [],
          laporan: [],
          sessions: []
        };
        logBackup('FALLBACK', 'Converted array to object with transaksi data', 'REQUEST', 'Array fallback applied');
      } else {
        throw new Error(`Invalid data format: expected object, got ${typeof allData}. Data: ${JSON.stringify(allData)}`);
      }
    }
    
    // Backup semua tabel dengan validasi
    if (allData.kategori && Array.isArray(allData.kategori)) {
      results.kategori = backupKategori(allData.kategori);
    } else {
      results.kategori = { count: 0, message: 'Kategori data not found or invalid', dataType: typeof allData.kategori };
    }
    
    if (allData.satuan && Array.isArray(allData.satuan)) {
      results.satuan = backupSatuan(allData.satuan);
    } else {
      results.satuan = { count: 0, message: 'Satuan data not found or invalid', dataType: typeof allData.satuan };
    }
    
    if (allData.produk && Array.isArray(allData.produk)) {
      results.produk = backupProduk(allData.produk);
    } else {
      results.produk = { count: 0, message: 'Produk data not found or invalid', dataType: typeof allData.produk };
    }
    
    if (allData.pengguna && Array.isArray(allData.pengguna)) {
      results.pengguna = backupPengguna(allData.pengguna);
    } else {
      results.pengguna = { count: 0, message: 'Pengguna data not found or invalid', dataType: typeof allData.pengguna };
    }
    
    if (allData.unit && Array.isArray(allData.unit)) {
      results.unit = backupUnit(allData.unit);
    } else {
      results.unit = { count: 0, message: 'Unit data not found or invalid', dataType: typeof allData.unit };
    }
    
    if (allData.transaksi && Array.isArray(allData.transaksi)) {
      results.transaksi = backupTransaksi(allData.transaksi);
    } else {
      results.transaksi = { count: 0, message: 'Transaksi data not found or invalid', dataType: typeof allData.transaksi };
    }
    
    if (allData.transaksiItems && Array.isArray(allData.transaksiItems)) {
      results.transaksiItems = backupTransaksiItems(allData.transaksiItems);
    } else {
      results.transaksiItems = { count: 0, message: 'Transaksi items data not found or invalid', dataType: typeof allData.transaksiItems };
    }
    
    if (allData.piutang && Array.isArray(allData.piutang)) {
      results.piutang = backupPiutang(allData.piutang);
    } else {
      results.piutang = { count: 0, message: 'Piutang data not found or invalid', dataType: typeof allData.piutang };
    }
    
    if (allData.kasMasuk && Array.isArray(allData.kasMasuk)) {
      results.kasMasuk = backupKasMasuk(allData.kasMasuk);
    } else {
      results.kasMasuk = { count: 0, message: 'Kas masuk data not found or invalid', dataType: typeof allData.kasMasuk };
    }
    
    if (allData.pengeluaran && Array.isArray(allData.pengeluaran)) {
      results.pengeluaran = backupPengeluaran(allData.pengeluaran);
    } else {
      results.pengeluaran = { count: 0, message: 'Pengeluaran data not found or invalid', dataType: typeof allData.pengeluaran };
    }
    
    if (allData.laporan && Array.isArray(allData.laporan)) {
      results.laporan = backupLaporan(allData.laporan);
    } else {
      results.laporan = { count: 0, message: 'Laporan data not found or invalid', dataType: typeof allData.laporan };
    }
    
    if (allData.sessions && Array.isArray(allData.sessions)) {
      results.sessions = backupSessions(allData.sessions);
    } else {
      results.sessions = { count: 0, message: 'Sessions data not found or invalid', dataType: typeof allData.sessions };
    }
    
    const summary = {
      totalTables: Object.keys(results).length,
      totalRecords: Object.values(results).reduce((sum, result) => sum + (result.count || 0), 0),
      successfulTables: Object.values(results).filter(result => result.count > 0).length
    };
    
    return {
      success: true,
      results: results,
      message: 'All data backed up successfully',
      timestamp: new Date().toISOString(),
      summary: summary,
      inputAnalysis: {
        originalType: typeof allData,
        processedKeys: Object.keys(allData),
        totalOriginalKeys: Object.keys(allData).length
      }
    };
    
  } catch (error) {
    logBackup('BACKUP_ERROR', {
      error: error.message,
      allDataType: typeof allData,
      allDataString: JSON.stringify(allData)
    }, 'ERROR', 'Backup failed');
    
    throw new Error(`Backup failed: ${error.message}`);
  }
}

/**
 * Restore semua data ke POS
 */
function restoreAllData() {
  try {
    const data = {};
    
    // Ambil semua data dari sheets
    data.kategori = getKategori();
    data.satuan = getSatuan();
    data.produk = getProduk();
    data.pengguna = getPengguna();
    data.unit = getUnit();
    data.transaksi = getTransaksi();
    data.transaksiItems = getTransaksiItems();
    data.piutang = getPiutang();
    data.kasMasuk = getKasMasuk();
    data.pengeluaran = getPengeluaran();
    data.laporan = getLaporan();
    data.sessions = getSessions();
    
    return {
      success: true,
      data: data,
      message: 'All data retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    throw new Error(`Restore failed: ${error.message}`);
  }
}

/**
 * Backup Kategori
 */
function backupKategori(kategori) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.KATEGORI, CONFIG.HEADERS.KATEGORI);
  
  // Clear existing data (kecuali header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.KATEGORI.length).clearContent();
  }
  
  // Add new data
  if (kategori && kategori.length > 0) {
    const rows = kategori.map(item => [
      item.id || generateId(),
      item.nama || '',
      item.deskripsi || '',
      item.created_at || new Date().toISOString(),
      item.updated_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: kategori ? kategori.length : 0,
    message: 'Kategori backed up successfully'
  };
}

/**
 * Backup Satuan
 */
function backupSatuan(satuan) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.SATUAN, CONFIG.HEADERS.SATUAN);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.SATUAN.length).clearContent();
  }
  
  // Add new data
  if (satuan && satuan.length > 0) {
    const rows = satuan.map(item => [
      item.id || generateId(),
      item.nama || '',
      item.deskripsi || '',
      item.created_at || new Date().toISOString(),
      item.updated_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: satuan ? satuan.length : 0,
    message: 'Satuan backed up successfully'
  };
}

/**
 * Backup Produk
 */
function backupProduk(produk) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.PRODUK, CONFIG.HEADERS.PRODUK);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.PRODUK.length).clearContent();
  }
  
  // Add new data
  if (produk && produk.length > 0) {
    const rows = produk.map(item => [
      item.id || generateId(),
      item.nama || '',
      item.sku || '',
      item.kategori_id || '',
      item.satuan_id || '',
      item.harga || 0,
      item.hpp || 0,
      item.stok || 0,
      item.min_stok || 0,
      item.supplier || '',
      item.unit_id || '',
      item.created_at || new Date().toISOString(),
      item.updated_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: produk ? produk.length : 0,
    message: 'Produk backed up successfully'
  };
}

/**
 * Backup Pengguna (termasuk password)
 */
function backupPengguna(pengguna) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.PENGGUNA, CONFIG.HEADERS.PENGGUNA);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.PENGGUNA.length).clearContent();
  }
  
  // Add new data
  if (pengguna && pengguna.length > 0) {
    const rows = pengguna.map(item => [
      item.id || generateId(),
      item.nama || '',
      item.email || '',
      item.password || '', // Password disimpan untuk restore
      item.role || '',
      item.unit_id || '',
      item.status || 'active',
      item.created_at || new Date().toISOString(),
      item.updated_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: pengguna ? pengguna.length : 0,
    message: 'Pengguna backed up successfully'
  };
}

/**
 * Backup Unit
 */
function backupUnit(unit) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.UNIT, CONFIG.HEADERS.UNIT);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.UNIT.length).clearContent();
  }
  
  // Add new data
  if (unit && unit.length > 0) {
    const rows = unit.map(item => [
      item.id || generateId(),
      item.nama || '',
      item.alamat || '',
      item.telepon || '',
      item.created_at || new Date().toISOString(),
      item.updated_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: unit ? unit.length : 0,
    message: 'Unit backed up successfully'
  };
}

/**
 * Backup Transaksi
 */
function backupTransaksi(transaksi) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.TRANSAKSI, CONFIG.HEADERS.TRANSAKSI);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.TRANSAKSI.length).clearContent();
  }
  
  // Add new data
  if (transaksi && transaksi.length > 0) {
    const rows = transaksi.map(item => [
      item.id || generateId(),
      item.tanggal || new Date().toISOString(),
      item.kasir_id || '',
      item.unit_id || '',
      item.customer_name || '',
      item.customer_phone || '',
      item.payment_type || '',
      item.subtotal || 0,
      item.discount || 0,
      item.grand_total || 0,
      item.cash_paid || 0,
      item.change || 0,
      item.status || 'completed',
      item.session_id || '',
      item.created_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: transaksi ? transaksi.length : 0,
    message: 'Transaksi backed up successfully'
  };
}

/**
 * Backup Transaksi Items
 */
function backupTransaksiItems(items) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.TRANSAKSI_ITEMS, CONFIG.HEADERS.TRANSAKSI_ITEMS);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.TRANSAKSI_ITEMS.length).clearContent();
  }
  
  // Add new data
  if (items && items.length > 0) {
    const rows = items.map(item => [
      item.id || generateId(),
      item.transaction_id || '',
      item.product_id || '',
      item.product_name || '',
      item.qty || 0,
      item.price || 0,
      item.hpp || 0,
      item.subtotal || 0,
      item.created_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: items ? items.length : 0,
    message: 'Transaksi Items backed up successfully'
  };
}

/**
 * Backup Piutang
 */
function backupPiutang(piutang) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.PIUTANG, CONFIG.HEADERS.PIUTANG);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.PIUTANG.length).clearContent();
  }
  
  // Add new data
  if (piutang && piutang.length > 0) {
    const rows = piutang.map(item => [
      item.id || generateId(),
      item.customer_name || '',
      item.customer_phone || '',
      item.total_amount || 0,
      item.paid_amount || 0,
      item.remaining_amount || 0,
      item.unit_id || '',
      item.status || 'unpaid',
      item.created_at || new Date().toISOString(),
      item.updated_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: piutang ? piutang.length : 0,
    message: 'Piutang backed up successfully'
  };
}

/**
 * Backup Kas Masuk
 */
function backupKasMasuk(kasMasuk) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.KAS_MASUK, CONFIG.HEADERS.KAS_MASUK);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.KAS_MASUK.length).clearContent();
  }
  
  // Add new data
  if (kasMasuk && kasMasuk.length > 0) {
    const rows = kasMasuk.map(item => [
      item.id || generateId(),
      item.amount || 0,
      item.depositor_name || '',
      item.description || '',
      item.unit_id || '',
      item.session_id || '',
      item.date || new Date().toISOString(),
      item.created_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: kasMasuk ? kasMasuk.length : 0,
    message: 'Kas Masuk backed up successfully'
  };
}

/**
 * Backup Pengeluaran
 */
function backupPengeluaran(pengeluaran) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.PENGELUARAN, CONFIG.HEADERS.PENGELUARAN);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.PENGELUARAN.length).clearContent();
  }
  
  // Add new data
  if (pengeluaran && pengeluaran.length > 0) {
    const rows = pengeluaran.map(item => [
      item.id || generateId(),
      item.amount || 0,
      item.description || '',
      item.unit_id || '',
      item.session_id || '',
      item.date || new Date().toISOString(),
      item.created_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: pengeluaran ? pengeluaran.length : 0,
    message: 'Pengeluaran backed up successfully'
  };
}

/**
 * Backup Laporan
 */
function backupLaporan(laporan) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.LAPORAN, CONFIG.HEADERS.LAPORAN);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.LAPORAN.length).clearContent();
  }
  
  // Add new data
  if (laporan && laporan.length > 0) {
    const rows = laporan.map(item => [
      item.id || generateId(),
      item.tanggal || new Date().toISOString(),
      item.tipe || '',
      item.kasir_id || '',
      item.unit_id || '',
      item.total || 0,
      item.deskripsi || '',
      item.session_id || '',
      item.created_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: laporan ? laporan.length : 0,
    message: 'Laporan backed up successfully'
  };
}

/**
 * Backup Sessions
 */
function backupSessions(sessions) {
  const sheet = getOrCreateSheet(CONFIG.SHEETS.SESSIONS, CONFIG.HEADERS.SESSIONS);
  
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.SESSIONS.length).clearContent();
  }
  
  // Add new data
  if (sessions && sessions.length > 0) {
    const rows = sessions.map(item => [
      item.id || generateId(),
      item.cashier_id || '',
      item.unit_id || '',
      item.opening_cash || 0,
      item.opening_time || new Date().toISOString(),
      item.closing_cash || 0,
      item.closing_time || '',
      item.status || 'open',
      item.created_at || new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    count: sessions ? sessions.length : 0,
    message: 'Sessions backed up successfully'
  };
}

/**
 * Get functions untuk restore
 */
function getKategori() {
  return getSheetData(CONFIG.SHEETS.KATEGORI, CONFIG.HEADERS.KATEGORI);
}

function getSatuan() {
  return getSheetData(CONFIG.SHEETS.SATUAN, CONFIG.HEADERS.SATUAN);
}

function getProduk() {
  return getSheetData(CONFIG.SHEETS.PRODUK, CONFIG.HEADERS.PRODUK);
}

function getPengguna() {
  return getSheetData(CONFIG.SHEETS.PENGGUNA, CONFIG.HEADERS.PENGGUNA);
}

function getUnit() {
  return getSheetData(CONFIG.SHEETS.UNIT, CONFIG.HEADERS.UNIT);
}

function getTransaksi() {
  return getSheetData(CONFIG.SHEETS.TRANSAKSI, CONFIG.HEADERS.TRANSAKSI);
}

function getTransaksiItems() {
  return getSheetData(CONFIG.SHEETS.TRANSAKSI_ITEMS, CONFIG.HEADERS.TRANSAKSI_ITEMS);
}

function getPiutang() {
  return getSheetData(CONFIG.SHEETS.PIUTANG, CONFIG.HEADERS.PIUTANG);
}

function getKasMasuk() {
  return getSheetData(CONFIG.SHEETS.KAS_MASUK, CONFIG.HEADERS.KAS_MASUK);
}

function getPengeluaran() {
  return getSheetData(CONFIG.SHEETS.PENGELUARAN, CONFIG.HEADERS.PENGELUARAN);
}

function getLaporan() {
  return getSheetData(CONFIG.SHEETS.LAPORAN, CONFIG.HEADERS.LAPORAN);
}

function getSessions() {
  return getSheetData(CONFIG.SHEETS.SESSIONS, CONFIG.HEADERS.SESSIONS);
}

function getAllData() {
  return {
    kategori: getKategori(),
    satuan: getSatuan(),
    produk: getProduk(),
    pengguna: getPengguna(),
    unit: getUnit(),
    transaksi: getTransaksi(),
    transaksiItems: getTransaksiItems(),
    piutang: getPiutang(),
    kasMasuk: getKasMasuk(),
    pengeluaran: getPengeluaran(),
    laporan: getLaporan(),
    sessions: getSessions()
  };
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

function getSheetData(sheetName, headers) {
  const sheet = getSheet(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1); // Skip header
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(sheetName);
}

function generateId() {
  return 'POS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function logBackup(action, data, status, message) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEETS.BACKUP_LOG, CONFIG.HEADERS.BACKUP_LOG);
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
function setupBackupSheets() {
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
  
  // Hide backup log sheet
  const logSheet = ss.getSheetByName(CONFIG.SHEETS.BACKUP_LOG);
  if (logSheet) {
    logSheet.hideSheet();
  }
  
  return 'Backup sheets setup completed successfully!';
}

/**
 * Test function untuk debugging data structure
 */
function debugDataStructure() {
  return {
    expectedStructure: {
      kategori: 'array of category objects',
      satuan: 'array of unit objects', 
      produk: 'array of product objects',
      pengguna: 'array of user objects',
      unit: 'array of store objects',
      transaksi: 'array of transaction objects',
      transaksiItems: 'array of transaction item objects',
      piutang: 'array of debt objects',
      kasMasuk: 'array of cash in objects',
      pengeluaran: 'array of expense objects',
      laporan: 'array of report objects',
      sessions: 'array of session objects'
    },
    examplePayload: {
      action: 'backupAllData',
      data: {
        kategori: [
          { id: 'kat1', nama: 'Makanan', deskripsi: 'Kategori makanan' }
        ],
        satuan: [
          { id: 'sat1', nama: 'Pcs', deskripsi: 'Pieces' }
        ],
        produk: [
          { id: 'prod1', nama: 'Nasi Goreng', sku: 'NG001', kategori_id: 'kat1', satuan_id: 'sat1', harga: 15000, hpp: 10000, stok: 50 }
        ],
        pengguna: [
          { id: 'user1', nama: 'Admin', email: 'admin@store.com', password: 'hashed123', role: 'admin', unit_id: 'unit1', status: 'active' }
        ],
        unit: [
          { id: 'unit1', nama: 'Toko Utama', alamat: 'Jl. Merdeka No. 1', telepon: '08123456789' }
        ],
        transaksi: [],
        transaksiItems: [],
        piutang: [],
        kasMasuk: [],
        pengeluaran: [],
        laporan: [],
        sessions: []
      }
    }
  };
}

/**
 * Test backup dengan sample data
 */
function testBackupWithSampleData() {
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
  
  return backupAllData(sampleData);
}

/**
 * Test function
 */
function testBackupConnection() {
  return {
    success: true,
    message: 'Google Apps Script Backup connection successful',
    timestamp: new Date().toISOString(),
    spreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName(),
    availableSheets: Object.values(CONFIG.SHEETS),
    debugInfo: debugDataStructure()
  };
}

/**
 * Clear all data (for testing)
 */
function clearAllData() {
  Object.values(CONFIG.SHEETS).forEach(sheetName => {
    const sheet = getSheet(sheetName);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  });
  
  return 'All data cleared successfully!';
}
