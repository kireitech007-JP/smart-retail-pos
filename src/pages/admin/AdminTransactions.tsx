import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { Receipt, Printer, MessageSquare, Download } from 'lucide-react';
import { toast } from 'sonner';
import ExportButtons from '@/components/ExportButtons';
import PrintButtons from '@/components/PrintButtons';
import { backupTransaksi } from '@/lib/googleSheets';

export default function AdminTransactions() {
  const { transactions, units } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  const filtered = selectedUnit === 'all' ? transactions : transactions.filter(t => t.unitId === selectedUnit);
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSyncToSheets = async () => {
    toast.info('Sinkronisasi data transaksi ke Google Sheets...');
    await backupTransaksi(transactions);
  };

  const handlePrintInvoice = (transaction: any) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
    if (!printWindow) return;
    
    const htmlContent = generateInvoiceHTML(transaction);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleWhatsApp = (transaction: any) => {
    const message = `*INVOICE SMART RETAIL POS*\n\n` +
      `No: ${transaction.id.slice(-6).toUpperCase()}\n` +
      `Tanggal: ${formatDateTime(transaction.date)}\n` +
      `Pelanggan: ${transaction.customerName || 'Umum'}\n` +
      `Total: ${formatRupiah(transaction.grandTotal)}\n` +
      `Pembayaran: ${transaction.paymentType === 'cash' ? 'Tunai' : transaction.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}\n\n` +
      `Terima kasih atas pembelian Anda!`;
    
    const phoneNumber = transaction.customerPhone || '';
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      // Copy to clipboard if no phone number
      navigator.clipboard.writeText(message);
      alert('Pesan WhatsApp disalin ke clipboard. Nomor telepon pelanggan tidak tersedia.');
    }
  };

  const generateInvoiceHTML = (tx: any) => {
    return `
      <html>
        <head>
          <title>Invoice - ${tx.id.slice(-6).toUpperCase()}</title>
          <style>
            @page { 
              margin: 10px; 
              size: 80mm auto;
            }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px;
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
              font-size: 16px; 
              font-weight: bold; 
              margin: 5px 0;
            }
            .subtitle { 
              font-size: 11px; 
              margin: 2px 0;
            }
            .info { 
              margin: 10px 0;
              font-size: 11px;
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0;
            }
            .items { 
              margin: 15px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
            }
            .item-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              font-size: 11px;
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
              background: #f5f5f5;
            }
            .footer { 
              margin-top: 20px;
              text-align: center;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">SMART RETAIL POS</div>
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
              <span>${tx.cashierName}</span>
            </div>
            <div class="info-row">
              <span>Pelanggan</span>
              <span>${tx.customerName || 'Umum'}</span>
            </div>
          </div>
          
          <div class="items">
            ${tx.items.map(item => `
              <div class="item-row">
                <span>${item.productName} x${item.qty}</span>
                <span>${formatRupiah(item.price)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${formatRupiah(tx.total)}</span>
            </div>
            ${tx.discount > 0 ? `
              <div class="total-row">
                <span>Discount</span>
                <span>-${formatRupiah(tx.discount)}</span>
              </div>
            ` : ''}
            <div class="total-row" style="font-size: 14px; border-top: 2px solid #000; padding-top: 5px;">
              <span>TOTAL</span>
              <span>${formatRupiah(tx.grandTotal)}</span>
            </div>
          </div>
          
          <div class="payment">
            <div class="info-row">
              <span>Payment</span>
              <span>${tx.paymentType === 'cash' ? 'Tunai' : tx.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Terima Kasih</div>
            <div>Selamat Berbelanja Kembali</div>
          </div>
        </body>
      </html>
    `;
  };

  const exportData = sorted.map(t => ({
    'ID Transaksi': t.id,
    'Tanggal': formatDateTime(t.date),
    Unit: units.find(u => u.id === t.unitId)?.name || '-',
    'Nama Kasir': t.cashierName,
    'Jumlah Item': t.items.length,
    'Total': formatRupiah(t.total),
    'Diskon': formatRupiah(t.discount),
    'Grand Total': formatRupiah(t.grandTotal),
    'Tipe Pembayaran': t.paymentType === 'cash' ? 'Tunai' : t.paymentType === 'transfer' ? 'Transfer' : 'Kredit'
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSelectedUnit('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUnit === 'all' ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
          Semua Unit
        </button>
        {units.map(u => (
          <button key={u.id} onClick={() => setSelectedUnit(u.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUnit === u.id ? 'primary-gradient text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            {u.name}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Receipt className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Riwayat Transaksi</h3>
          <div className="ml-auto flex items-center gap-2">
            <PrintButtons transactions={sorted} type="faktur" />
            <ExportButtons data={exportData} filename="transaksi" title="Riwayat Transaksi" onSheetsClick={handleSyncToSheets} />
            <span className="text-sm text-muted-foreground">{sorted.length} transaksi</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {['ID', 'Tanggal', 'Pelanggan', 'Unit', 'Kasir', 'Item', 'Total', 'Diskon', 'Grand Total', 'Pembayaran', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map(tx => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{tx.id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatDateTime(tx.date)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{tx.customerName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tx.unitName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tx.cashierName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tx.items.length}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatRupiah(tx.total)}</td>
                  <td className="px-4 py-3 text-sm text-accent">{tx.discount > 0 ? formatRupiah(tx.discount) : '-'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">{formatRupiah(tx.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                      ${tx.paymentType === 'cash' ? 'bg-success/10 text-success' : tx.paymentType === 'transfer' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                      {tx.paymentType === 'cash' ? 'Tunai' : tx.paymentType === 'transfer' ? 'Transfer' : 'Kredit'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePrintInvoice(tx)}
                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Cetak Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleWhatsApp(tx)}
                        className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        title="Kirim WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">Belum ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
