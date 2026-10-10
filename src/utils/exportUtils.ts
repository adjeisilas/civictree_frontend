import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Customer, SalesReport, ReportStats } from '../types/admin';

/**
 * CSV helpers. These replace the 'xlsx' package, which has unfixed security advisories.
 * Spreadsheet apps open CSV directly.
 */
export type CsvRow = Record<string, string | number>

export const toCsv = (rows: CsvRow[]): string => {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) => {
    const text = String(value ?? '')
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\r\n')
}

export const downloadCsv = (filename: string, csv: string) => {
  // The byte order mark keeps accents readable when the file is opened in Excel
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename.replace(/\.(xlsx|xls)$/i, '.csv')
  link.click()
  URL.revokeObjectURL(link.href)
}

export const exportCustomerHistoryToPDF = (customer: Customer) => {
  if (!customer) return;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Customer Report: ${customer.name || 'Unknown'}`, 14, 22);

  // Profile Summary
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Phone: ${customer.phone}`, 14, 32);
  doc.text(`Status: ${customer.status || 'Unknown'}`, 14, 38);
  doc.text(`Lifetime Spend: GHC ${(customer.lifetimeSpend || 0).toFixed(2)}`, 14, 44);
  doc.text(`Total Orders: ${customer.totalOrders || 0}`, 14, 50);

  // Table
  if (customer.purchaseHistory && customer.purchaseHistory.length > 0) {
    autoTable(doc, {
      startY: 60,
      head: [['Order ID', 'Date', 'Voucher Type', 'Qty', 'Amount', 'Payment', 'Delivery']],
      body: customer.purchaseHistory.map(item => [
        item.id,
        item.date,
        item.voucherType,
        item.quantity.toString(),
        `GHC ${(Number(item.amount) || 0).toFixed(2)}`,
        item.paymentStatus,
        item.deliveryStatus,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [56, 102, 65] }, // Dark green to match app primary color
    });
  } else {
    doc.text('No purchase history available.', 14, 60);
  }

  doc.save(`customer_${customer.phone}_history.pdf`);
};

export const exportCustomersToCSV = (customers: Customer[], filename = 'customers_list.csv') => {
  if (!customers || customers.length === 0) return;

  const exportData = customers.map(c => ({
    'ID / Phone': c.id,
    'Name': c.name || 'Unknown Customer',
    'Phone': c.phone,
    'Channel': c.channel,
    'Status': c.status || 'Unknown',
    'Total Orders': c.totalOrders || 0,
    'Lifetime Spend (GHC)': (c.lifetimeSpend || 0).toFixed(2),
    'First Purchase': c.firstPurchase || 'N/A',
    'Last Purchase': c.lastPurchase || 'N/A',
    'Preferred Payment': c.preferredPayment || 'Unknown'
  }));

  downloadCsv(filename, toCsv(exportData));
};

export const exportCustomerPhonesToCSV = (customers: Customer[], filename = 'customer_phones.csv') => {
  if (!customers || customers.length === 0) return;

  const exportData = customers.map(c => ({
    'Phone Number': c.phone
  }));

  downloadCsv(filename, toCsv(exportData));
};

export const exportReportsToPDF = (sales: SalesReport[], stats: ReportStats[], period: string) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('CivicTree Sales Analytics Report', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} | Period: ${period.toUpperCase()}`, 14, 32);

  // Stats table
  if (stats && stats.length > 0) {
    autoTable(doc, {
      startY: 40,
      head: [['Period', 'WASSCE Rev', 'BECE Rev', 'Success Rate', 'New Cust', 'Returning', 'Web', 'USSD']],
      body: stats.map(s => [
        `${s.month} ${s.year}`,
        `GHC ${s.revenue.WASSCE_NOVDEC.toFixed(2)}`,
        `GHC ${s.revenue.BECE.toFixed(2)}`,
        `${s.orderRates.successRate}%`,
        s.customers.new.toString(),
        s.customers.returning.toString(),
        s.channels.WEB.toString(),
        s.channels.USSD.toString(),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [56, 102, 65] },
    });
  }

  // Sales Table
  if (sales && sales.length > 0) {
    // jspdf-autotable adds this property at runtime
    const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 40;

    doc.text('Sales Breakdown', 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 15,
      head: [['Period', 'Total Sales', 'Total Orders', 'WASSCE / NOVDEC', 'BECE', 'Revenue']],
      body: sales.map(s => [
        s.period,
        s.totalSales.toString(),
        s.totalOrders.toString(),
        s.wassceNovdec.toString(),
        s.bece.toString(),
        `GHC ${s.revenue.toFixed(2)}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [56, 102, 65] },
    });
  }

  doc.save(`civictree-reports-${period}.pdf`);
};

export const exportReportsToExcel = (sales: SalesReport[], stats: ReportStats[], period: string, isCsv = false) => {
  const statsRows: CsvRow[] = (stats || []).map(s => ({
    'Period': `${s.month} ${s.year}`,
    'WASSCE Revenue': s.revenue.WASSCE_NOVDEC,
    'BECE Revenue': s.revenue.BECE,
    'Success Rate %': s.orderRates.successRate,
    'Failure Rate %': s.orderRates.failureRate,
    'New Customers': s.customers.new,
    'Returning Customers': s.customers.returning,
    'Web Channels': s.channels.WEB,
    'USSD Channels': s.channels.USSD,
  }))

  const salesRows: CsvRow[] = (sales || []).map(s => ({
    'Period': s.period,
    'Total Sales': s.totalSales,
    'Total Orders': s.totalOrders,
    'WASSCE / NOVDEC Qty': s.wassceNovdec,
    'BECE Qty': s.bece,
    'Revenue (GHC)': s.revenue,
  }))

  // The sales breakdown alone, or both sections in one file
  const csv = isCsv || statsRows.length === 0
    ? toCsv(salesRows)
    : ['Aggregate Stats', toCsv(statsRows), '', 'Sales Breakdown', toCsv(salesRows)].join('\r\n')

  downloadCsv(`civictree-reports-${period}.csv`, csv)
};
