import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Workspace } from '../types';

const thaiFontUrl = new URL('../assets/fonts/NotoSansThai.ttf', import.meta.url).href;

async function embedThaiFont(doc: jsPDF) {
  const response = await fetch(thaiFontUrl);
  if (!response.ok) {
    throw new Error(`Unable to load Thai PDF font: ${response.status} ${response.statusText}`);
  }

  const fontBytes = new Uint8Array(await response.arrayBuffer());
  let binaryFont = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < fontBytes.length; offset += chunkSize) {
    binaryFont += String.fromCharCode(...fontBytes.subarray(offset, offset + chunkSize));
  }

  doc.addFileToVFS('NotoSansThai.ttf', btoa(binaryFont));
  doc.addFont('NotoSansThai.ttf', 'NotoSansThai', 'normal');
  doc.setFont('NotoSansThai', 'normal');
}

export function formatCurrency(amount: number, currency: string = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ` ${currency === 'THB' ? 'บาท' : currency}`;
}

export function exportToCSV(
  transactions: Transaction[], 
  workspace: Workspace,
  filterName: string = 'รายงานรายรับรายจ่าย'
) {
  // UTF-8 BOM (\uFEFF) ensures Thai language renders perfectly in MS Excel
  const BOM = '\uFEFF';
  const headers = ['วันที่ (Date)', 'ประเภท (Type)', 'หมวดหมู่ (Category)', 'รายการ (Title)', 'จำนวนเงิน (Amount)', 'หมายเหตุ (Notes)'];
  
  const rows = transactions.map((t) => [
    `"${t.date}"`,
    `"${t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}"`,
    `"${t.category_name || '-'}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `${workspace.name.replace(/\s+/g, '_')}_${filterName}_${new Date().toISOString().split('T')[0]}.csv`;

  // Check if browser
  if (typeof window !== 'undefined' && window.document) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export async function exportToPDF(
  transactions: Transaction[],
  workspace: Workspace,
  dateRangeText: string = 'ทั้งหมด'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  await embedThaiFont(doc);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Header - Modern Minimal Title
  doc.setFontSize(20);
  doc.setTextColor(24, 24, 27); // Zinc 900
  doc.text('SAVE - Financial Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(113, 113, 122); // Zinc 500
  doc.text(`Account / Workspace: ${workspace.name} (${workspace.type.toUpperCase()})`, 14, 28);
  doc.text(`Period: ${dateRangeText}  |  Generated Date: ${new Date().toLocaleDateString('en-GB')}`, 14, 34);

  // Financial Summary Cards
  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(244, 244, 245);
  doc.roundedRect(14, 40, 58, 20, 3, 3, 'FD');
  doc.roundedRect(76, 40, 58, 20, 3, 3, 'FD');
  doc.roundedRect(138, 40, 58, 20, 3, 3, 'FD');

  // Income Card
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text('TOTAL INCOME', 18, 47);
  doc.setFontSize(12);
  doc.setTextColor(24, 24, 27);
  doc.text(`+${totalIncome.toLocaleString()} THB`, 18, 55);

  // Expense Card
  doc.setFontSize(9);
  doc.setTextColor(244, 63, 94); // Rose
  doc.text('TOTAL EXPENSE', 80, 47);
  doc.setFontSize(12);
  doc.setTextColor(24, 24, 27);
  doc.text(`-${totalExpense.toLocaleString()} THB`, 80, 55);

  // Balance Card
  doc.setFontSize(9);
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text('NET BALANCE', 142, 47);
  doc.setFontSize(12);
  doc.setTextColor(24, 24, 27);
  doc.text(`${balance >= 0 ? '+' : ''}${balance.toLocaleString()} THB`, 142, 55);

  // Table Data
  const tableData = transactions.map((t) => [
    t.date,
    t.type.toUpperCase(),
    t.category_name || '-',
    t.title,
    `${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()} THB`,
    t.notes || '',
  ]);

  autoTable(doc, {
    startY: 68,
    head: [['Date', 'Type', 'Category', 'Description', 'Amount', 'Notes']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontSize: 9,
      font: 'NotoSansThai',
      fontStyle: 'normal',
      halign: 'left',
    },
    styles: {
      font: 'NotoSansThai',
      fontStyle: 'normal',
      fontSize: 8,
      cellPadding: 3,
      textColor: [50, 50, 50],
      lineColor: [240, 240, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 43 },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 34 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [244, 63, 94];
        }
      }
    },
  });

  const filename = `${workspace.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
