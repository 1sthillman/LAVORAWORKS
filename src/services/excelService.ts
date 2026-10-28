import ExcelJS from 'exceljs';
import type { Project, LedgerEntry } from '@/types';
import { formatDate } from '@/lib/utils';

export class ExcelService {
  // Export Projects to Excel
  async exportProjects(projects: Project[]): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Projeler');

    // Add headers
    worksheet.columns = [
      { header: 'Proje Adı', key: 'name', width: 25 },
      { header: 'Müşteri', key: 'client', width: 20 },
      { header: 'Durum', key: 'status', width: 15 },
      { header: 'Başlangıç', key: 'startDate', width: 15 },
      { header: 'Bitiş', key: 'dueDate', width: 15 },
      { header: 'Toplam Tutar', key: 'totalAmount', width: 15 },
      { header: 'Ödenen', key: 'paidAmount', width: 15 },
      { header: 'İlerleme %', key: 'progress', width: 12 },
      { header: 'Açıklama', key: 'description', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F766E' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data
    projects.forEach((project) => {
      worksheet.addRow({
        name: project.name,
        client: project.client,
        status: this.getStatusText(project.status),
        startDate: formatDate(project.startDate, 'short'),
        dueDate: project.dueDate ? formatDate(project.dueDate, 'short') : '-',
        totalAmount: project.totalAmount,
        paidAmount: project.paidAmount,
        progress: project.progress,
        description: project.description || '-',
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  // Export Ledger to Excel
  async exportLedger(entries: LedgerEntry[]): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Masraf Defteri');

    // Add headers
    worksheet.columns = [
      { header: 'Tarih', key: 'date', width: 15 },
      { header: 'Tip', key: 'type', width: 12 },
      { header: 'Açıklama', key: 'description', width: 30 },
      { header: 'Kategori', key: 'category', width: 15 },
      { header: 'Tutar', key: 'amount', width: 15 },
      { header: 'KDV Oranı %', key: 'vatRate', width: 12 },
      { header: 'KDV Tutarı', key: 'vatAmount', width: 15 },
      { header: 'Toplam', key: 'totalWithVat', width: 15 },
      { header: 'Ödeme Yöntemi', key: 'paymentMethod', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F766E' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data
    entries.forEach((entry) => {
      const row = worksheet.addRow({
        date: formatDate(entry.date, 'short'),
        type: entry.type === 'income' ? 'Gelir' : 'Gider',
        description: entry.description,
        category: entry.category,
        amount: entry.amount,
        vatRate: entry.vatRate || 0,
        vatAmount: entry.vatAmount || 0,
        totalWithVat: entry.totalWithVat || entry.amount,
        paymentMethod: this.getPaymentMethodText(entry.paymentMethod),
      });

      // Color code by type
      if (entry.type === 'income') {
        row.getCell('type').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' },
        };
      } else {
        row.getCell('type').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEF4444' },
        };
      }
    });

    // Add summary
    const lastRow = worksheet.rowCount + 2;
    const totalIncome = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + (e.totalWithVat || e.amount), 0);
    const totalExpense = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + (e.totalWithVat || e.amount), 0);
    
    worksheet.getCell(`D${lastRow}`).value = 'Toplam Gelir:';
    worksheet.getCell(`D${lastRow}`).font = { bold: true };
    worksheet.getCell(`H${lastRow}`).value = totalIncome;
    worksheet.getCell(`H${lastRow}`).font = { bold: true };
    worksheet.getCell(`H${lastRow}`).numFmt = '#,##0.00';

    worksheet.getCell(`D${lastRow + 1}`).value = 'Toplam Gider:';
    worksheet.getCell(`D${lastRow + 1}`).font = { bold: true };
    worksheet.getCell(`H${lastRow + 1}`).value = totalExpense;
    worksheet.getCell(`H${lastRow + 1}`).font = { bold: true };
    worksheet.getCell(`H${lastRow + 1}`).numFmt = '#,##0.00';

    worksheet.getCell(`D${lastRow + 2}`).value = 'Net:';
    worksheet.getCell(`D${lastRow + 2}`).font = { bold: true };
    worksheet.getCell(`H${lastRow + 2}`).value = totalIncome - totalExpense;
    worksheet.getCell(`H${lastRow + 2}`).font = { bold: true };
    worksheet.getCell(`H${lastRow + 2}`).numFmt = '#,##0.00';

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  // Import from Excel
  async importFromExcel(file: File): Promise<any[]> {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const data: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = worksheet.getRow(1).getCell(colNumber).value;
        rowData[String(header)] = cell.value;
      });
      data.push(rowData);
    });

    return data;
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      active: 'Aktif',
      completed: 'Tamamlandı',
      paused: 'Beklemede',
      cancelled: 'İptal',
    };
    return statusMap[status] || status;
  }

  private getPaymentMethodText(method?: string): string {
    if (!method) return '-';
    const methodMap: Record<string, string> = {
      cash: 'Nakit',
      card: 'Kart',
      transfer: 'Havale',
      other: 'Diğer',
    };
    return methodMap[method] || method;
  }
}

export const excelService = new ExcelService();
