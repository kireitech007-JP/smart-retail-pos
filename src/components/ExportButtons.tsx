import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  title?: string;
}

export default function ExportButtons({ data, filename, title }: ExportButtonsProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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

  const exportToGoogleSheets = () => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
    
    // Create a data URI for the CSV
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show instructions for Google Sheets
    alert('CSV file downloaded! You can now:\n1. Open Google Sheets\n2. Click "File" > "Import"\n3. Upload the downloaded CSV file');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToGoogleSheets}
        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        title="Export to Google Sheets (CSV)"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Sheets
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
