import React from 'react';
import { Download, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  title?: string;
  onSheetsClick?: () => void;
}

export default function ExportButtons({ data, filename, title, onSheetsClick }: ExportButtonsProps) {
  const { storeSettings } = useApp();

  const exportToPDF = () => {
    if (!data || data.length === 0) return;
    
    // Create HTML content for PDF
    const headers = Object.keys(data[0]);
    const tableHTML = `
      <html>
        <head>
          <title>${title || filename}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.4;
            }
            h1 { 
              color: #2563eb; 
              text-align: center; 
              margin-bottom: 10px;
              font-size: 24px;
            }
            .subtitle { 
              text-align: center; 
              color: #666; 
              margin-bottom: 30px;
              font-size: 14px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-top: 20px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 12px;
            }
            th { 
              background-color: #3b82f6; 
              color: white; 
              font-weight: bold;
              text-transform: uppercase;
            }
            tr:nth-child(even) { background-color: #f9fafb; }
            tr:hover { background-color: #f3f4f6; }
            .numeric { text-align: right; font-family: 'Courier New', monospace; }
            .header-row { background-color: #1e40af !important; }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <h1>${title || filename}</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
          
          <table>
            <thead>
              <tr class="header-row">
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map((row, index) => `
                <tr>
                  ${headers.map(header => {
                    const value = row[header] || '';
                    const isNumeric = typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value.replace(/[^0-9.-]/g, ''))));
                    return `<td class="${isNumeric ? 'numeric' : ''}">${value}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report was generated automatically from Smart Retail POS System</p>
            <p>Total Records: ${data.length}</p>
          </div>
        </body>
      </html>
    `;
    
    // Create and open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (!printWindow) {
      alert('Please allow popups for this website to export PDF');
      return;
    }
    
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    
    // Wait for content to load, then show print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const openGoogleSheets = () => {
    if (onSheetsClick) {
      onSheetsClick();
    }
    
    if (storeSettings.spreadsheetUrl) {
      window.open(storeSettings.spreadsheetUrl, '_blank');
      toast.success('Membuka Google Spreadsheet...');
    } else {
      toast.error('URL Google Spreadsheet belum diatur di Pengaturan.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={openGoogleSheets}
        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        title="Lihat di Google Sheets"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Sheets
        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        title="Export to PDF"
      >
        <Download className="w-4 h-4" />
        PDF
      </button>
    </div>
  );
}
