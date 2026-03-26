import React, { useState } from 'react';
import { Printer, FileText, Receipt, Settings, Bluetooth, Wifi, Dot } from 'lucide-react';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { Transaction } from '@/contexts/AppContext';

interface PrintButtonsProps {
  transaction?: Transaction;
  transactions?: Transaction[];
  type: 'invoice' | 'faktur' | 'session';
  sessionData?: {
    cashierName?: string;
    unitName?: string;
    sessionId?: string;
    openTime?: string;
    openingCash?: number;
    totalSales?: number;
    totalCashIn?: number;
    totalExpenses?: number;
    totalPaidToday?: number;
    finalBalance?: number;
    transactionCount?: number;
  };
  sessionTransactions?: any[];
}

interface PrinterConfig {
  type: 'bluetooth' | 'thermal' | 'dotmatrix';
  name: string;
  connected: boolean;
  paperWidth: number;
  paperSize?: '80mm' | '21x16.5cm' | '9.5x11in'; // Added paper size options
}

export default function PrintButtons({ 
  transaction, 
  transactions = [], 
  type = 'invoice', 
  sessionData, 
  sessionTransactions 
}: PrintButtonsProps) {
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterConfig>({
    type: 'thermal',
    name: 'Default Thermal Printer',
    connected: true,
    paperWidth: 58
  });

  const printers: PrinterConfig[] = [
    {
      type: 'thermal',
      name: 'Default Thermal Printer',
      connected: true,
      paperWidth: 58
    },
    {
      type: 'bluetooth',
      name: 'Bluetooth Portable Printer',
      connected: false,
      paperWidth: 58
    },
    {
      type: 'dotmatrix',
      name: 'Dot Matrix 80mm',
      connected: true,
      paperWidth: 80,
      paperSize: '80mm'
    },
    {
      type: 'dotmatrix',
      name: 'Dot Matrix 21x16.5cm',
      connected: false,
      paperWidth: 210, // 21cm in mm
      paperSize: '21x16.5cm'
    },
    {
      type: 'dotmatrix',
      name: 'Dot Matrix 9.5x11in',
      connected: false,
      paperWidth: 241, // 9.5in in mm
      paperSize: '9.5x11in'
    }
  ];

  const generateInvoiceHTML = (tx: Transaction) => {
    // Debug logging
    console.log('generateInvoiceHTML - tx:', tx);
    console.log('generateInvoiceHTML - tx.items:', tx.items);
    console.log('generateInvoiceHTML - tx.cashierName:', tx.cashierName);
    console.log('generateInvoiceHTML - tx.customerName:', tx.customerName);
    
    const isThermal = selectedPrinter.type === 'thermal';
    const isBluetooth = selectedPrinter.type === 'bluetooth';
    const isDotMatrix = selectedPrinter.type === 'dotmatrix';
    
    const paperWidth = selectedPrinter.paperWidth;
    const fontSize = isThermal || isBluetooth ? '10px' : '12px';
    const fontFamily = isDotMatrix ? 'Courier New, monospace' : 'Arial, sans-serif';
    
    return `
      <html>
        <head>
          <title>Invoice - ${tx.id.slice(-6).toUpperCase()}</title>
          <style>
            @page { 
              margin: ${isDotMatrix ? '20px' : '10px'}; 
              size: 9.5in 11in;
            }
            body { 
              font-family: ${fontFamily}; 
              font-size: ${fontSize};
              margin: 0; 
              padding: 10px;
              line-height: 1.2;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .title { 
              font-size: ${isDotMatrix ? '16px' : '14px'}; 
              font-weight: bold; 
              margin: 5px 0;
            }
            .subtitle { 
              font-size: ${isDotMatrix ? '12px' : '10px'}; 
              margin: 2px 0;
            }
            .info { 
              margin: 15px 0;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
              background: #f9f9f9;
              font-size: ${fontSize};
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0;
            }
            .items { 
              margin: 15px 0;
              padding: 10px 0;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              background: #fff;
            }
            .items-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
              font-weight: bold;
              font-size: ${isDotMatrix ? '10px' : '9px'};
            }
            .item-header-name {
              flex: 1;
              margin-right: 10px;
            }
            .item-header-qty {
              width: 30px;
              text-align: center;
            }
            .item-header-price {
              width: 60px;
              text-align: right;
            }
            .no-items {
              text-align: center;
              color: #666;
              font-style: italic;
              padding: 20px;
            }
            .item-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              font-size: ${fontSize};
            }
            .item-name { 
              flex: 1; 
              margin-right: 10px;
            }
            .item-qty { 
              width: 30px; 
              text-align: center;
            }
            .item-price { 
              width: 60px; 
              text-align: right;
            }
            .total { 
              margin-top: 15px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              font-weight: bold;
            }
            .payment { 
              margin-top: 10px;
              padding: 10px;
              background: ${isDotMatrix ? 'transparent' : '#f5f5f5'};
              border: ${isDotMatrix ? '1px solid #000' : 'none'};
            }
            .footer { 
              margin-top: 20px;
              text-align: center;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: ${isDotMatrix ? '10px' : '9px'};
            }
            .barcode { 
              text-align: center; 
              margin: 10px 0;
              font-family: 'Libre Barcode 39', cursive;
              font-size: 24px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">INVOICE</div>
            <div class="subtitle">SMART RETAIL POS</div>
            <div class="subtitle">Jl. Contoh No. 123, Jakarta</div>
            <div class="subtitle">Telp: (021) 1234-5678</div>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span>INVOICE</span>
              <span>${tx.id.slice(-6).toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span>Tanggal</span>
              <span>${formatDateTime(tx.date)}</span>
            </div>
            <div class="info-row">
              <span>Kasir</span>
              <span>${tx.cashierName || sessionData?.cashierName || 'System'}</span>
            </div>
            <div class="info-row">
              <span>Pelanggan</span>
              <span>${tx.customerName || 'Umum'}</span>
            </div>
          </div>
          
          <div class="items">
            <div class="items-header">
              <div class="item-header-name">Produk</div>
              <div class="item-header-qty">Qty</div>
              <div class="item-header-price">Harga</div>
            </div>
            ${tx.items && tx.items.length > 0 ? tx.items.map(item => `
              <div class="item-row">
                <div class="item-name">${item.productName}</div>
                <div class="item-qty">${item.qty}</div>
                <div class="item-price">${formatRupiah(item.price)}</div>
              </div>
            `).join('') : '<div class="no-items">Tidak ada item</div>'}
          </div>
          
          <div class="total">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${formatRupiah(tx.subtotal || tx.total || 0)}</span>
            </div>
            ${tx.discount > 0 ? `
              <div class="total-row">
                <span>Discount</span>
                <span>-${formatRupiah(tx.discount)}</span>
              </div>
            ` : ''}
            ${tx.tax > 0 ? `
              <div class="total-row">
                <span>Tax (${tx.taxRate}%)</span>
                <span>${formatRupiah(tx.tax)}</span>
              </div>
            ` : ''}
            <div class="total-row" style="font-size: ${isDotMatrix ? '14px' : '12px'}; border-top: 2px solid #000; padding-top: 5px;">
              <span>TOTAL</span>
              <span>${formatRupiah(tx.grandTotal)}</span>
            </div>
          </div>
          
          <div class="payment">
            <div class="info-row">
              <span>Payment</span>
              <span>${tx.paymentType === 'cash' ? 'Tunai' : tx.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}</span>
            </div>
            ${tx.paymentType === 'cash' && tx.cashReceived ? `
              <div class="info-row">
                <span>Tunai</span>
                <span>${formatRupiah(tx.cashReceived)}</span>
              </div>
              <div class="info-row">
                <span>Kembali</span>
                <span>${formatRupiah(tx.cashChange || 0)}</span>
              </div>
            ` : ''}
            ${tx.paymentType === 'credit' ? `
              <div class="info-row">
                <span>DP</span>
                <span>${formatRupiah(tx.dp || 0)}</span>
              </div>
              <div class="info-row">
                <span>Sisa</span>
                <span>${formatRupiah(tx.grandTotal - (tx.dp || 0))}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="barcode">
            *${tx.id.slice(-6).toUpperCase()}*
          </div>
          
          <div class="footer">
            <div>Terima Kasih</div>
            <div>Selamat Berbelanja Kembali</div>
            ${isDotMatrix ? '<div>***</div>' : ''}
          </div>
        </body>
      </html>
    `;
  };

  const generateFakturHTML = (txs: Transaction[]) => {
    // For single transaction, use the first transaction
    const tx = txs[0];
    const isThermal = selectedPrinter.type === 'thermal';
    const isBluetooth = selectedPrinter.type === 'bluetooth';
    const isDotMatrix = selectedPrinter.type === 'dotmatrix';
    
    const paperWidth = selectedPrinter.paperWidth;
    const fontSize = isThermal || isBluetooth ? '10px' : '12px';
    const fontFamily = isDotMatrix ? 'Courier New, monospace' : 'Arial, sans-serif';
    
    return `
      <html>
        <head>
          <title>FAKTUR - ${tx.id.slice(-6).toUpperCase()}</title>
          <style>
            @page { 
              margin: ${isDotMatrix ? '20px' : '10px'}; 
              size: 9.5in 11in;
            }
            body { 
              font-family: ${fontFamily}; 
              font-size: ${fontSize};
              margin: 0; 
              padding: 10px;
              line-height: 1.2;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .title { 
              font-size: ${isDotMatrix ? '16px' : '14px'}; 
              font-weight: bold; 
              margin: 5px 0;
            }
            .subtitle { 
              font-size: ${isDotMatrix ? '12px' : '10px'}; 
              margin: 2px 0;
            }
            .info { 
              margin: 15px 0;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
              background: #f9f9f9;
              font-size: ${fontSize};
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0;
            }
            .items { 
              margin: 15px 0;
              padding: 10px 0;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              background: #fff;
            }
            .items-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
              font-weight: bold;
              font-size: ${isDotMatrix ? '10px' : '9px'};
            }
            .item-header-name {
              flex: 1;
              margin-right: 10px;
            }
            .item-header-qty {
              width: 30px;
              text-align: center;
            }
            .item-header-price {
              width: 60px;
              text-align: right;
            }
            .no-items {
              text-align: center;
              color: #666;
              font-style: italic;
              padding: 20px;
            }
            .item-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              font-size: ${fontSize};
            }
            .item-name { 
              flex: 1; 
              margin-right: 10px;
            }
            .item-qty { 
              width: 30px; 
              text-align: center;
            }
            .item-price { 
              width: 60px; 
              text-align: right;
            }
            .total { 
              margin-top: 15px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              font-weight: bold;
            }
            .payment { 
              margin-top: 10px;
              padding: 10px;
              background: #f0f0f0;
              border-radius: 5px;
            }
            .footer { 
              margin-top: 20px;
              text-align: center;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: ${isDotMatrix ? '10px' : '9px'};
            }
            .signature {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
            }
            .sig-box { 
              width: 45%; 
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 20px;
              font-size: ${fontSize};
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">FAKTUR</div>
            <div class="subtitle">SMART RETAIL POS</div>
            <div class="subtitle">Jl. Contoh No. 123, Jakarta</div>
            <div class="subtitle">Telp: (021) 1234-5678</div>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span>FAKTUR</span>
              <span>FK-${tx.id.slice(-6).toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span>Tanggal</span>
              <span>${formatDateTime(tx.date)}</span>
            </div>
            <div class="info-row">
              <span>Kasir</span>
              <span>${tx.cashierName || sessionData?.cashierName || 'System'}</span>
            </div>
            <div class="info-row">
              <span>Pelanggan</span>
              <span>${tx.customerName || 'Umum'}</span>
            </div>
          </div>
          
          <div class="items">
            <div class="items-header">
              <div class="item-header-name">Produk</div>
              <div class="item-header-qty">Qty</div>
              <div class="item-header-price">Harga</div>
            </div>
            ${tx.items && tx.items.length > 0 ? tx.items.map(item => `
              <div class="item-row">
                <div class="item-name">${item.productName}</div>
                <div class="item-qty">${item.qty}</div>
                <div class="item-price">${formatRupiah(item.price)}</div>
              </div>
            `).join('') : '<div class="no-items">Tidak ada item</div>'}
          </div>
          
          <div class="total">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${formatRupiah(tx.subtotal || tx.total || 0)}</span>
            </div>
            ${tx.discount > 0 ? `
              <div class="total-row">
                <span>Discount</span>
                <span>-${formatRupiah(tx.discount)}</span>
              </div>
            ` : ''}
            ${tx.tax > 0 ? `
              <div class="total-row">
                <span>Tax (${tx.taxRate}%)</span>
                <span>${formatRupiah(tx.tax)}</span>
              </div>
            ` : ''}
            ${tx.dp && tx.dp < tx.grandTotal ? `
              <div class="total-row">
                <span>DP</span>
                <span>${formatRupiah(tx.dp)}</span>
              </div>
              <div class="total-row">
                <span>Sisa</span>
                <span>${formatRupiah(tx.grandTotal - tx.dp)}</span>
              </div>
            ` : ''}
            <div class="total-row" style="font-size: ${isDotMatrix ? '12px' : '14px'}; border-top: 1px solid #000; padding-top: 5px;">
              <span>TOTAL</span>
              <span>${formatRupiah(tx.grandTotal)}</span>
            </div>
          </div>
          
          <div class="payment">
            <div class="info-row">
              <span>Payment</span>
              <span>${tx.paymentType === 'cash' ? 'Tunai' : tx.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}</span>
            </div>
            ${tx.paymentType === 'cash' && (tx.cashPaid || tx.cashReceived) ? `
              <div class="info-row">
                <span>Tunai</span>
                <span>${formatRupiah(tx.cashPaid || tx.cashReceived)}</span>
              </div>
              <div class="info-row">
                <span>Kembali</span>
                <span>${formatRupiah(tx.change || tx.cashChange || 0)}</span>
              </div>
            ` : ''}
            ${tx.paymentType === 'credit' ? `
              <div class="info-row">
                <span>DP</span>
                <span>${formatRupiah(tx.dp || 0)}</span>
              </div>
              <div class="info-row">
                <span>Sisa</span>
                <span>${formatRupiah(tx.grandTotal - (tx.dp || 0))}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <div>Terima kasih atas kunjungan Anda</div>
            <div>Barang yang sudah dibeli tidak dapat dikembalikan</div>
            <div>${formatDateTime(new Date().toISOString())}</div>
          </div>
          
          <div class="signature">
            <div class="sig-box">
              <div>Pelanggan</div>
              <div style="margin-top: 20px; font-size: ${isDotMatrix ? '10px' : '9px'}">(_________________________)</div>
            </div>
            <div class="sig-box">
              <div>Kasir</div>
              <div style="margin-top: 20px; font-size: ${isDotMatrix ? '10px' : '9px'}">(_________________________)</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generateSessionReportHTML = () => {
    const isThermal = selectedPrinter.type === 'thermal';
    const isBluetooth = selectedPrinter.type === 'bluetooth';
    const isDotMatrix = selectedPrinter.type === 'dotmatrix';
    
    const paperWidth = selectedPrinter.paperWidth;
    const paperSize = selectedPrinter.paperSize;
    
    // Dynamic sizing based on paper size
    let fontSize, fontFamily, pageMargin, pageSize;
    
    if (isDotMatrix) {
      fontFamily = 'Courier New, monospace';
      
      if (paperSize === '80mm') {
        fontSize = '8px';
        pageMargin = '5px';
        pageSize = '80mm 297mm'; // 80mm x A4 height
      } else if (paperSize === '21x16.5cm') {
        fontSize = '10px';
        pageMargin = '15px';
        pageSize = '21cm 16.5cm';
      } else if (paperSize === '9.5x11in') {
        fontSize = '11px';
        pageMargin = '20px';
        pageSize = '9.5in 11in';
      } else {
        fontSize = '10px';
        pageMargin = '20px';
        pageSize = '9.5in 11in';
      }
    } else {
      fontFamily = 'Arial, sans-serif';
      fontSize = isThermal || isBluetooth ? '9px' : '11px';
      pageMargin = isDotMatrix ? '20px' : '10px';
      pageSize = '9.5in 11in';
    }
    
    // Filter transactions from sessionTransactions
    const transactions = sessionTransactions?.filter(item => item.Tipe === 'Transaksi') || [];
    const payments = sessionTransactions?.filter(item => item.Tipe === 'Pembayaran') || [];
    const cashIn = sessionTransactions?.filter(item => item.Tipe === 'Kas Masuk') || [];
    const expenses = sessionTransactions?.filter(item => item.Tipe === 'Pengeluaran') || [];
    const debtPayments = sessionTransactions?.filter(item => item.Tipe === 'Pelunasan Piutang') || [];
    
    // Adjust layout for different paper sizes
    const isCompact = paperSize === '80mm';
    const isLarge = paperSize === '21x16.5cm';
    
    return `
      <html>
        <head>
          <title>LAPORAN SESI KASIR</title>
          <style>
            @page { 
              margin: ${pageMargin}; 
              size: ${pageSize};
            }
            body { 
              font-family: ${fontFamily}; 
              font-size: ${fontSize};
              margin: 0; 
              padding: ${isCompact ? '5px' : '10px'};
              line-height: ${isCompact ? '1.0' : '1.1'};
              width: ${isCompact ? '80mm' : 'auto'};
            }
            .header { 
              text-align: center; 
              margin-bottom: ${isCompact ? '8px' : '15px'};
              border-bottom: 2px solid #000;
              padding-bottom: ${isCompact ? '5px' : '10px'};
            }
            .title { 
              font-size: ${isDotMatrix ? (isCompact ? '12px' : '14px') : (isCompact ? '10px' : '12px')}; 
              font-weight: bold; 
              margin: 3px 0;
            }
            .subtitle { 
              font-size: ${isDotMatrix ? (isCompact ? '9px' : '11px') : (isCompact ? '7px' : '9px')}; 
              margin: 1px 0;
            }
            .section { 
              margin: ${isCompact ? '8px' : '15px'} 0;
              border: 1px solid #000;
              padding: ${isCompact ? '5px' : '8px'};
            }
            .section-title { 
              font-weight: bold; 
              margin-bottom: ${isCompact ? '3px' : '5px'};
              border-bottom: 1px dashed #000;
              padding-bottom: 2px;
              font-size: ${isCompact ? '9px' : '10px'};
            }
            .summary-row { 
              display: flex; 
              justify-content: space-between; 
              margin: ${isCompact ? '1px' : '3px'} 0;
            }
            .sub-row { 
              display: flex; 
              justify-content: space-between; 
              margin: ${isCompact ? '1px' : '2px'} 0;
              padding-left: ${isCompact ? '10px' : '15px'};
              font-size: ${isDotMatrix ? (isCompact ? '7px' : '9px') : (isCompact ? '6px' : '8px')};
            }
            .transaction-row { 
              margin: ${isCompact ? '3px' : '5px'} 0;
              border-bottom: 1px dotted #ccc;
              padding-bottom: ${isCompact ? '2px' : '3px'};
            }
            .transaction-header { 
              font-weight: bold;
              font-size: ${isDotMatrix ? (isCompact ? '8px' : '10px') : (isCompact ? '7px' : '9px')};
            }
            .transaction-detail { 
              font-size: ${isDotMatrix ? (isCompact ? '7px' : '8px') : (isCompact ? '6px' : '7px')};
              margin: 1px 0;
            }
            .total-row { 
              font-weight: bold;
              border-top: 1px solid #000;
              padding-top: 2px;
              margin-top: ${isCompact ? '3px' : '5px'};
            }
            .footer { 
              margin-top: ${isCompact ? '10px' : '20px'};
              text-align: center;
              border-top: 1px dashed #000;
              padding-top: ${isCompact ? '5px' : '10px'};
              font-size: ${isDotMatrix ? (isCompact ? '7px' : '9px') : (isCompact ? '6px' : '8px')};
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">LAPORAN SESI KASIR</div>
            <div class="subtitle">SMART RETAIL POS</div>
          </div>
          
          <div class="section">
            <div class="summary-row">
              <span>Kasir:</span>
              <span>${sessionData?.cashierName || '-'}</span>
            </div>
            ${!isCompact ? `
            <div class="summary-row">
              <span>Unit:</span>
              <span>${sessionData?.unitName || '-'}</span>
            </div>
            ` : ''}
            <div class="summary-row">
              <span>Sesi ID:</span>
              <span>${sessionData?.sessionId || '-'}</span>
            </div>
            <div class="summary-row">
              <span>Waktu Buka:</span>
              <span>${sessionData?.openTime || '-'}</span>
            </div>
            <div class="summary-row">
              <span>Waktu Tutup:</span>
              <span>${formatDateTime(new Date().toISOString())}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="summary-row">
              <span>Modal Awal:</span>
              <span>${formatRupiah(sessionData?.openingCash || 0)}</span>
            </div>
            <div class="summary-row">
              <span>Total Penjualan:</span>
              <span>${formatRupiah(sessionData?.totalSales || 0)}</span>
            </div>
            <div class="sub-row">
              <span>  • Tunai:</span>
              <span>${formatRupiah(sessionData?.cashSales || 0)}</span>
            </div>
            <div class="sub-row">
              <span>  • Transfer:</span>
              <span>${formatRupiah(sessionData?.transferSales || 0)}</span>
            </div>
            <div class="sub-row">
              <span>  • Kredit:</span>
              <span>${formatRupiah(sessionData?.creditSales || 0)}</span>
            </div>
            <div class="sub-row">
              <span>  • DP:</span>
              <span>${formatRupiah(sessionData?.dpPayments || 0)}</span>
            </div>
            <div class="sub-row">
              <span>  • Sisa Kredit:</span>
              <span>${formatRupiah(sessionData?.remainingCredit || 0)}</span>
            </div>
            <div class="summary-row">
              <span>Kas Masuk:</span>
              <span>${formatRupiah(sessionData?.totalCashIn || 0)}</span>
            </div>
            <div class="summary-row">
              <span>Pengeluaran:</span>
              <span>${formatRupiah(sessionData?.totalExpenses || 0)}</span>
            </div>
            <div class="summary-row">
              <span>Piutang Dibayar:</span>
              <span>${formatRupiah(sessionData?.totalPaidToday || 0)}</span>
            </div>
            <div class="summary-row total-row">
              <span>SALDO AKHIR:</span>
              <span>${formatRupiah(sessionData?.finalBalance || 0)}</span>
            </div>
          </div>
          
          ${!isCompact && expenses.length > 0 ? `
          <div class="section">
            <div class="section-title">PENGELUARAN (${expenses.length})</div>
            ${expenses.slice(0, 5).map(exp => `
              <div class="transaction-row">
                <div class="transaction-header">
                  ${exp.ID}
                </div>
                <div class="transaction-detail">
                  ${exp.Deskripsi} - ${formatRupiah(exp.Jumlah)}
                </div>
              </div>
            `).join('')}
            ${expenses.length > 5 ? `
              <div class="transaction-detail">
                ... dan ${expenses.length - 5} pengeluaran lainnya
              </div>
            ` : ''}
          </div>
          ` : ''}
          
          ${!isCompact && debtPayments.length > 0 ? `
          <div class="section">
            <div class="section-title">PELUNASAN PIUTANG (${debtPayments.length})</div>
            ${debtPayments.slice(0, 5).map(payment => `
              <div class="transaction-row">
                <div class="transaction-header">
                  ${payment.ID} - ${payment.Pelanggan}
                </div>
                <div class="transaction-detail">
                  ${formatRupiah(payment.Jumlah)}
                </div>
              </div>
            `).join('')}
            ${debtPayments.length > 5 ? `
              <div class="transaction-detail">
                ... dan ${debtPayments.length - 5} pelunasan lainnya
              </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="footer">
            <div>Laporan sesi kasir berhasil dicetak</div>
            <div>${formatDateTime(new Date().toISOString())}</div>
            ${isDotMatrix ? '<div>***</div>' : ''}
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = (printType: 'invoice' | 'faktur' | 'session') => {
    let htmlContent = '';
    
    if (printType === 'invoice' && transaction) {
      htmlContent = generateInvoiceHTML(transaction);
    } else if (printType === 'faktur' && transaction) {
      // For faktur, convert single transaction to array format
      htmlContent = generateFakturHTML([transaction]);
    } else if (printType === 'faktur' && transactions.length > 0) {
      htmlContent = generateFakturHTML(transactions);
    } else if (printType === 'session' && sessionData) {
      htmlContent = generateSessionReportHTML();
    }
    
    if (!htmlContent) return;
    
    const printWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
    if (!printWindow) {
      alert('Please allow popups for this website to print');
      return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Simulate printer connection
    setTimeout(() => {
      if (selectedPrinter.type === 'bluetooth') {
        console.log('Printing via Bluetooth:', selectedPrinter.name);
      } else if (selectedPrinter.type === 'thermal') {
        console.log('Printing via Thermal:', selectedPrinter.name);
      } else if (selectedPrinter.type === 'dotmatrix') {
        console.log('Printing via Dot Matrix:', selectedPrinter.name);
      }
      
      printWindow.print();
    }, 500);
  };

  const getPrinterIcon = (type: string) => {
    switch (type) {
      case 'bluetooth': return <Bluetooth className="w-4 h-4" />;
      case 'thermal': return <Receipt className="w-4 h-4" />;
      case 'dotmatrix': return <Dot className="w-4 h-4" />;
      default: return <Printer className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Invoice Print */}
      {transaction && (
        <button
          onClick={() => handlePrint('invoice')}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          title="Cetak Invoice"
        >
          <FileText className="w-4 h-4" />
          Invoice
        </button>
      )}
      
      {/* Faktur Print */}
      {transaction && (
        <button
          onClick={() => handlePrint('faktur')}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          title="Cetak Faktur"
        >
          <Receipt className="w-4 h-4" />
          Faktur
        </button>
      )}
      
      {/* Faktur Print for transactions array */}
      {!transaction && transactions.length > 0 && (
        <button
          onClick={() => handlePrint('faktur')}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          title="Cetak Faktur"
        >
          <Receipt className="w-4 h-4" />
          Faktur
        </button>
      )}
      
      {/* Session Report Print */}
      {sessionData && (
        <button
          onClick={() => handlePrint('session')}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          title="Cetak Laporan Sesi"
        >
          <FileText className="w-4 h-4" />
          Laporan
        </button>
      )}
      
      {/* Printer Settings */}
      <button
        onClick={() => setShowPrinterModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        title="Pengaturan Printer"
      >
        <Settings className="w-4 h-4" />
        Printer
      </button>
      
      {/* Printer Selection Modal */}
      {showPrinterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-elevated w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Pengaturan Printer</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tipe Printer</label>
                <div className="space-y-2">
                  {printers.map(printer => (
                    <button
                      key={printer.type}
                      onClick={() => setSelectedPrinter(printer)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        selectedPrinter.type === printer.type
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getPrinterIcon(printer.type)}
                        <div className="text-left">
                          <p className="font-medium text-foreground">{printer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {printer.connected ? 'Tersambung' : 'Tidak tersambung'} • 
                            {printer.paperSize ? ` ${printer.paperSize.toUpperCase()}` : ` ${printer.paperWidth}mm`}
                          </p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        printer.connected ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPrinterModal(false)}
                  className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={() => setShowPrinterModal(false)}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
