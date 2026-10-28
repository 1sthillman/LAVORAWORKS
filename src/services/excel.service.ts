/**
 * Excel Import/Export Service
 * Proje, defter ve tablo verilerini Excel'e çevirmek için
 * XLSX.js: .xls (eski Excel) dosyaları için
 * ExcelJS: .xlsx (modern Excel) dışa aktarma için
 */

import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Project, LedgerEntry, WorkflowItem } from '@/types';
import { formatCurrency, formatDateTR, generateAvatar, generateColorFromString } from '@/utils/formatters';
import { db } from '@/lib/db';

class ExcelService {
  /**
   * Projeleri Excel'e aktar
   */
  async exportProjects(projects: Project[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Lavora Workflow';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Projeler');

    // Headers
    worksheet.columns = [
      { header: 'Proje Adı', key: 'name', width: 25 },
      { header: 'Müşteri', key: 'client', width: 20 },
      { header: 'Durum', key: 'status', width: 12 },
      { header: 'Öncelik', key: 'priority', width: 10 },
      { header: 'Başlangıç', key: 'startDate', width: 12 },
      { header: 'Bitiş', key: 'dueDate', width: 12 },
      { header: 'Toplam Tutar', key: 'totalAmount', width: 15 },
      { header: 'Ödenen', key: 'paidAmount', width: 15 },
      { header: 'Kalan', key: 'remaining', width: 15 },
      { header: 'İlerleme (%)', key: 'progress', width: 12 },
      { header: 'İletişim Kişisi', key: 'clientContact', width: 20 },
      { header: 'E-posta', key: 'clientEmail', width: 25 },
      { header: 'Telefon', key: 'clientPhone', width: 15 },
      { header: 'Açıklama', key: 'description', width: 40 },
      { header: 'Etiketler', key: 'tags', width: 30 },
    ];

    // Header style
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F766E' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    projects.forEach((project) => {
      worksheet.addRow({
        name: project.name,
        client: project.client,
        status: this.getStatusLabel(project.status),
        priority: this.getPriorityLabel(project.priority),
        startDate: formatDateTR(project.startDate),
        dueDate: project.dueDate ? formatDateTR(project.dueDate) : '-',
        totalAmount: project.totalAmount,
        paidAmount: project.paidAmount,
        remaining: project.totalAmount - project.paidAmount,
        progress: project.progress,
        clientContact: project.clientContact || '-',
        clientEmail: project.clientEmail || '-',
        clientPhone: project.clientPhone || '-',
        description: project.description || '-',
        tags: project.tags?.join(', ') || '-',
      });
    });

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const fileName = `Projeler_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  }

  /**
   * Tek bir projeyi Excel'e aktar
   */
  async exportProject(project: Project): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Lavora Workflow';

    // Sheet 1: Proje Bilgileri
    const infoSheet = workbook.addWorksheet('Proje Bilgileri');
    infoSheet.columns = [
      { header: 'Alan', key: 'field', width: 20 },
      { header: 'Değer', key: 'value', width: 50 },
    ];

    infoSheet.addRow({ field: 'Proje Adı', value: project.name });
    infoSheet.addRow({ field: 'Müşteri', value: project.client });
    infoSheet.addRow({ field: 'Durum', value: this.getStatusLabel(project.status) });
    infoSheet.addRow({ field: 'Öncelik', value: this.getPriorityLabel(project.priority) });
    infoSheet.addRow({ field: 'Başlangıç Tarihi', value: formatDateTR(project.startDate) });
    infoSheet.addRow({ field: 'Bitiş Tarihi', value: project.dueDate ? formatDateTR(project.dueDate) : '-' });
    infoSheet.addRow({ field: '', value: '' });
    infoSheet.addRow({ field: 'Finansal Bilgiler', value: '' });
    infoSheet.addRow({ field: 'Toplam Tutar', value: formatCurrency(project.totalAmount) });
    infoSheet.addRow({ field: 'Ödenen Tutar', value: formatCurrency(project.paidAmount) });
    infoSheet.addRow({ field: 'Kalan Tutar', value: formatCurrency(project.totalAmount - project.paidAmount) });
    infoSheet.addRow({ field: 'İlerleme', value: `%${project.progress}` });
    infoSheet.addRow({ field: '', value: '' });
    infoSheet.addRow({ field: 'İletişim Bilgileri', value: '' });
    infoSheet.addRow({ field: 'İletişim Kişisi', value: project.clientContact || '-' });
    infoSheet.addRow({ field: 'E-posta', value: project.clientEmail || '-' });
    infoSheet.addRow({ field: 'Telefon', value: project.clientPhone || '-' });

    if (project.description) {
      infoSheet.addRow({ field: '', value: '' });
      infoSheet.addRow({ field: 'Açıklama', value: '' });
      infoSheet.addRow({ field: project.description, value: '' });
    }

    if (project.tags && project.tags.length > 0) {
      infoSheet.addRow({ field: '', value: '' });
      infoSheet.addRow({ field: 'Etiketler', value: project.tags.join(', ') });
    }

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const fileName = `${project.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  }

  /**
   * Excel'den proje içe aktar
   * İki mod: 1) Proje listesi (header'lar var), 2) Tablo projesi (HTML v17 gibi)
   * Desteklenen formatlar: .xlsx, .xls (XLSX.js kullanarak)
   */
  async importProjects(file: File): Promise<Project[]> {
    try {
      const buffer = await file.arrayBuffer();
      
      // XLSX.js kullanarak okuma (hem .xls hem .xlsx destekler)
      const workbook = XLSX.read(buffer, {
        type: 'array',
        cellDates: true,
      });

      if (!workbook.SheetNames.length) {
        throw new Error('Excel dosyasında sayfa bulunamadı');
      }

      // İlk sayfayı kontrol et
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];
      
      // Sheet'i array'e çevir
      const data: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      
      if (data.length === 0) {
        throw new Error('Excel dosyası boş');
      }

      const firstRow = data[0] || [];
      
      // Proje listesi header kontrolü
      const hasProjectHeaders = firstRow.some((v: any) => 
        v && String(v).toLowerCase().match(/proje|müşteri|durum|client|project/i)
      );

      if (hasProjectHeaders) {
        // Mode 1: Proje listesi
        return this.importProjectListFromXLSX(workbook);
      } else {
        // Mode 2: Tablo projesi (HTML v17 style)
        return this.importTableProjectFromXLSX(file.name, workbook);
      }
    } catch (error) {
      console.error('Excel import error:', error);
      throw new Error(error instanceof Error ? error.message : 'Excel dosyası okunamadı');
    }
  }

  /**
   * Proje listesi formatında içe aktar (XLSX.js ile)
   */
  private async importProjectListFromXLSX(workbook: XLSX.WorkBook): Promise<Project[]> {
    const projects: Project[] = [];
    const now = new Date().toISOString();

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = row[0];
      const client = row[1];

      if (!name || !client) continue;

      const totalAmount = this.parseNumber(row[6]);
      const paidAmount = this.parseNumber(row[7]);
      const progress = this.parseNumber(row[9]);

      const project: Project = {
        id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: String(name),
        client: String(client),
        status: this.parseStatus(row[2]) || 'active',
        priority: this.parsePriority(row[3]),
        startDate: this.parseDate(row[4]) || now,
        dueDate: this.parseDate(row[5]),
        totalAmount,
        paidAmount,
        progress: Math.min(100, Math.max(0, progress)),
        description: row[13] || '',
        clientContact: row[10] || '',
        clientEmail: row[11] || '',
        clientPhone: row[12] || '',
        tags: this.parseTags(row[14]),
        avatar: generateAvatar(String(client)),
        color: generateColorFromString(String(client)),
        createdAt: now,
        updatedAt: now,
      };

      projects.push(project);
    }

    // Save to DB
    for (const project of projects) {
      await db.saveProject(project);
    }

    return projects;
  }

  /**
   * Tablo projesi formatında içe aktar (XLSX.js ile - HTML v17 style)
   * HTML v17 mantığı: Her sheet'i proje sheets'e ekle + Her satır bir workflow item
   */
  private async importTableProjectFromXLSX(fileName: string, workbook: XLSX.WorkBook): Promise<Project[]> {
    const projectName = fileName.replace(/\.(xlsx?|xls)$/i, '');
    const now = new Date().toISOString();

    // Default workflow stages (HTML v17: DST)
    const defaultStages = [
      { id: `stage-${Date.now()}-1`, name: 'Tasarım', order: 0 },
      { id: `stage-${Date.now()}-2`, name: 'Sipariş', order: 1 },
      { id: `stage-${Date.now()}-3`, name: 'Teslimat', order: 2 },
    ];

    // Parse all sheets (HTML v17: fromWb)
    const sheets = workbook.SheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const allRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      // Find header row (HTML v17: smart detection)
      const headerIndex = this.detectHeaderRow(allRows);
      const preRows = allRows.slice(0, headerIndex); // Rows before header
      const headers = allRows[headerIndex] || [];
      const dataRows = allRows.slice(headerIndex + 1);

      // Detect column types
      const colInfo = this.detectColumnTypes(headers);

      // Calculate total if possible
      let totalAmount = 0;
      if (colInfo.totalCol >= 0) {
        totalAmount = dataRows.reduce((sum, row) => {
          const val = this.parseNumber(row[colInfo.totalCol]);
          return sum + val;
        }, 0);
      }

      return {
        name: sheetName || 'Sayfa',
        pre: preRows.map(row => row.map((cell: any) => cell === undefined || cell === null ? '' : String(cell))),
        headers: headers.map((h: any, i: number) => String(h || `Sütun ${i + 1}`)),
        rows: dataRows.map(row => row.map((cell: any) => cell === undefined || cell === null ? '' : String(cell))),
        totalAmount,
        columnInfo: colInfo,
      };
    });

    // Create workflow items from rows (HTML v17: wrws + wfromSheet)
    const workflowItems: WorkflowItem[] = [];
    let itemCounter = 0;

    sheets.forEach((sheet) => {
      sheet.rows.forEach((row, rowIndex) => {
        // Skip empty rows
        if (row.every(cell => !String(cell).trim())) return;

        // Detect product info from row
        const itemName = this.detectItemName(row, sheet.headers);
        const quantity = this.detectQuantity(row, sheet.headers, sheet.columnInfo);
        const dimension = this.detectDimension(row, sheet.headers);
        const material = this.detectMaterial(row, sheet.headers);
        const price = this.detectPrice(row, sheet.headers, sheet.columnInfo);
        const total = this.detectTotal(row, sheet.headers, sheet.columnInfo);
        const group = this.detectGroup(row, sheet.headers);

        // Skip header-like rows or total rows (HTML v17 logic)
        const nameNormalized = (itemName || '').toLowerCase().trim();
        if (!itemName || 
            /^[-+]?\d[\d.,\s]*$/.test(itemName) ||
            /(^|\s)(genel\s+)?toplam(i)?(\s|$)|^not\b|imza|kase|fiyat teklifi|revizyon/.test(nameNormalized)) {
          return;
        }

        // Check if row has meaningful data (HTML v17 logic)
        const hasQuantity = quantity && String(quantity).trim();
        const hasPrice = price && price > 0;
        const hasTotal = total && total > 0;
        const hasDimension = dimension && String(dimension).trim();

        // Skip if no meaningful data
        if (!hasQuantity && !hasPrice && !hasTotal && !hasDimension) {
          return;
        }

        // Fiyat kontrolü (HTML v17: pend flag)
        const pricePending = !price || price === 0;

        // Create workflow item
        const item: WorkflowItem = {
          id: `item-${Date.now()}-${itemCounter++}`,
          projectId: '', // Will be set after project creation
          name: itemName || `Ürün ${rowIndex + 1}`,
          status: 'pending',
          stage: defaultStages[0].name,
          priority: pricePending ? 'high' : 'medium',
          progress: 0,
          createdAt: now,
          updatedAt: now,
          // Excel/Table specific (HTML v17 fields)
          sheetName: sheet.name,
          rowIndex: rowIndex,
          quantity: quantity || '',
          dimension: dimension || '',
          material: material || '',
          price: price,
          total: total || (price && quantity ? price * parseFloat(quantity) : undefined),
          pricePending: pricePending,
          stageStatus: {},
          photos: [],
          group: group || '',
        };

        // Initialize stage status (HTML v17: st object)
        defaultStages.forEach(stage => {
          if (item.stageStatus) {
            item.stageStatus[stage.id] = 0; // 0: bekliyor
          }
        });

        workflowItems.push(item);
      });
    });

    // Create project (HTML v17: newP + wEns + wauto)
    const totalAmount = sheets.reduce((sum, s) => sum + s.totalAmount, 0);
    const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Set projectId for all items
    workflowItems.forEach(item => {
      item.projectId = projectId;
    });

    const project: Project = {
      id: projectId,
      name: projectName,
      client: 'Excel İçe Aktarma',
      status: 'active',
      startDate: now,
      totalAmount: totalAmount,
      paidAmount: 0,
      progress: 0,
      description: `${sheets.length} sayfa, ${workflowItems.length} ürün${workflowItems.filter(i => i.pricePending).length ? ` (${workflowItems.filter(i => i.pricePending).length} fiyat bekliyor)` : ''}`,
      avatar: generateAvatar(projectName),
      color: generateColorFromString(projectName),
      createdAt: now,
      updatedAt: now,
      // Store table data (HTML v17: p.s - sheets array)
      tableData: sheets.map(s => ({
        name: s.name,
        pre: s.pre,
        headers: s.headers,
        rows: s.rows,
        columnInfo: s.columnInfo,
      })),
      // HTML v17 workflow structure (p.w)
      workflow: {
        stages: defaultStages,
        items: workflowItems,
        todo: [],
        due: undefined,
        note: '',
      },
    };

    // Save to DB
    await db.saveProject(project);

    // Save workflow items separately
    for (const item of workflowItems) {
      await db.saveWorkflowItem(item);
    }

    return [project];
  }

  /**
   * Satırdan ürün adını algıla
   */
  private detectItemName(row: any[], headers: string[]): string {
    // Look for "ürün", "kalem", "açıklama", "imalat" columns
    const namePatterns = /urun|kalem|imalat|aciklama|tanim|detay|parca|ad/i;
    
    for (let i = 0; i < headers.length; i++) {
      if (namePatterns.test(headers[i])) {
        const value = String(row[i] || '').trim();
        if (value && value.length > 0) return value;
      }
    }

    // Fallback: first non-empty string column
    for (let i = 0; i < row.length; i++) {
      const value = String(row[i] || '').trim();
      if (value && value.length > 2 && !/^\d+([.,]\d+)?$/.test(value)) {
        return value;
      }
    }

    return '';
  }

  /**
   * Adet/Miktar algıla
   */
  private detectQuantity(row: any[], headers: string[], colInfo?: any): string {
    if (colInfo?.quantityCol >= 0) {
      return String(row[colInfo.quantityCol] || '').trim();
    }

    const qtyPattern = /adet|miktar|quantity|qty|sayi/i;
    for (let i = 0; i < headers.length; i++) {
      if (qtyPattern.test(headers[i])) {
        return String(row[i] || '').trim();
      }
    }

    return '';
  }

  /**
   * Ölçü/Boyut algıla
   */
  private detectDimension(row: any[], headers: string[]): string {
    const dimPattern = /olcu|ebat|boyut|enboy|olculer|dimension|size/i;
    
    for (let i = 0; i < headers.length; i++) {
      if (dimPattern.test(headers[i])) {
        const value = String(row[i] || '').trim();
        if (value) return value;
      }
    }

    return '';
  }

  /**
   * Malzeme algıla
   */
  private detectMaterial(row: any[], headers: string[]): string {
    const matPattern = /malzeme|materyal|kaplama|marka|material/i;
    
    for (let i = 0; i < headers.length; i++) {
      if (matPattern.test(headers[i])) {
        const value = String(row[i] || '').trim();
        if (value) return value;
      }
    }

    return '';
  }

  /**
   * Birim fiyat algıla
   */
  private detectPrice(row: any[], headers: string[], colInfo?: any): number | undefined {
    if (colInfo?.priceCol >= 0) {
      const val = this.parseNumber(row[colInfo.priceCol]);
      return val > 0 ? val : undefined;
    }

    const pricePattern = /fiyat|price|ucret|birimfiyat|bfiyat/i;
    for (let i = 0; i < headers.length; i++) {
      if (pricePattern.test(headers[i]) && !/toplam/i.test(headers[i])) {
        const val = this.parseNumber(row[i]);
        if (val > 0) return val;
      }
    }

    return undefined;
  }

  /**
   * Toplam tutar algıla
   */
  private detectTotal(row: any[], headers: string[], colInfo?: any): number | undefined {
    if (colInfo?.totalCol >= 0) {
      const val = this.parseNumber(row[colInfo.totalCol]);
      return val > 0 ? val : undefined;
    }

    const totalPattern = /toplam|tutar|total|bedel/i;
    for (let i = 0; i < headers.length; i++) {
      if (totalPattern.test(headers[i])) {
        const val = this.parseNumber(row[i]);
        if (val > 0) return val;
      }
    }

    return undefined;
  }

  /**
   * Grup/Kategori algıla (HTML v17: grp field)
   */
  private detectGroup(row: any[], headers: string[]): string {
    const groupPattern = /grup|kategori|group|category|bolum/i;
    
    for (let i = 0; i < headers.length; i++) {
      if (groupPattern.test(headers[i])) {
        const value = String(row[i] || '').trim();
        if (value) return value;
      }
    }

    return '';
  }

  /**
   * Akıllı header satırı tespiti (HTML v17'den uyarlandı)
   */
  private detectHeaderRow(rows: any[][]): number {
    const keywords = /gorsel|resim|foto|image|urun|kalem|imalat|aciklama|tanim|olcu|ebat|boyut|enboy|adet|miktar|metraj|qty|birim|fiyat|price|tutar|toplam|total|bedel|malzeme|materyal|kaplama|kod|tedarik|poz|sira|marka|stok|mekan|detay|parca|olculer|miktari|bfiyat|fiyati|tutari|ttr|meblag/i;
    
    let bestRow = 0;
    let bestScore = 0;

    rows.slice(0, 20).forEach((row, i) => {
      let score = 0;
      row.forEach((cell) => {
        const text = String(cell || '').toLowerCase().replace(/ı/g, 'i').trim();
        if (text && text.length < 40 && keywords.test(text)) {
          score += /(adet|miktar|fiyat|tutar|toplam|urun|kalem|birim)/i.test(text) ? 2 : 1;
        }
      });

      // Penalty for rows with too many numbers
      const numberCount = row.filter((cell) => {
        const val = this.parseNumber(cell);
        return val > 0 && String(cell).trim().length < 18;
      }).length;
      score -= numberCount * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestRow = i;
      }
    });

    return bestRow;
  }

  /**
   * Sütun tiplerini algıla (adet, fiyat, toplam)
   */
  private detectColumnTypes(headers: any[]): {
    quantityCol: number;
    priceCol: number;
    totalCol: number;
    hasAutoCalc: boolean;
  } {
    let quantityCol = -1;
    let priceCol = -1;
    let totalCol = -1;

    headers.forEach((header, i) => {
      const text = String(header || '').toLowerCase().replace(/ı/g, 'i');
      
      if (/adet|miktar|quantity|qty|sayi/i.test(text)) {
        quantityCol = i;
      }
      if (/fiyat|price|ucret|birimfiyat/i.test(text) && !/toplam/i.test(text)) {
        priceCol = i;
      }
      if (/toplam|tutar|total|bedel/i.test(text)) {
        totalCol = i;
      }
    });

    const hasAutoCalc =
      quantityCol >= 0 &&
      priceCol >= 0 &&
      totalCol >= 0 &&
      quantityCol !== priceCol &&
      quantityCol !== totalCol &&
      priceCol !== totalCol;

    return {
      quantityCol,
      priceCol,
      totalCol,
      hasAutoCalc,
    };
  }

  /**
   * Defter kayıtlarını Excel'e aktar
   */
  async exportLedger(entries: LedgerEntry[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Defter');

    worksheet.columns = [
      { header: 'Tarih', key: 'date', width: 12 },
      { header: 'Tip', key: 'type', width: 8 },
      { header: 'Tutar', key: 'amount', width: 15 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Açıklama', key: 'description', width: 40 },
      { header: 'Ödeme Yöntemi', key: 'paymentMethod', width: 15 },
      { header: 'KDV Oranı (%)', key: 'vatRate', width: 12 },
      { header: 'KDV Tutarı', key: 'vatAmount', width: 15 },
      { header: 'Toplam', key: 'total', width: 15 },
    ];

    entries.forEach((entry) => {
      worksheet.addRow({
        date: formatDateTR(entry.date),
        type: entry.type === 'income' ? 'Gelir' : 'Gider',
        amount: entry.amount,
        category: entry.category,
        description: entry.description,
        paymentMethod: this.getPaymentMethodLabel(entry.paymentMethod),
        vatRate: entry.vatRate || 0,
        vatAmount: entry.vatAmount || 0,
        total: entry.totalWithVat || entry.amount,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const fileName = `Defter_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  }

  // Helper methods
  private getStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      active: 'Aktif',
      completed: 'Tamamlandı',
      paused: 'Beklemede',
      cancelled: 'İptal',
    };
    return labels[status || 'active'] || 'Aktif';
  }

  private getPriorityLabel(priority?: string): string {
    const labels: Record<string, string> = {
      low: 'Düşük',
      normal: 'Normal',
      high: 'Yüksek',
    };
    return labels[priority || 'normal'] || 'Normal';
  }

  private getPaymentMethodLabel(method?: string): string {
    const labels: Record<string, string> = {
      cash: 'Nakit',
      card: 'Kredi Kartı',
      transfer: 'Havale/EFT',
      other: 'Diğer',
    };
    return labels[method || 'cash'] || 'Nakit';
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private parseDate(value: any): string | undefined {
    if (!value) return undefined;

    try {
      if (value instanceof Date) {
        return value.toISOString();
      }

      if (typeof value === 'string') {
        const parts = value.split(/[./-]/);
        if (parts.length === 3) {
          const [d, m, y] = parts.map(Number);
          if (d && m && y) {
            return new Date(y, m - 1, d).toISOString();
          }
        }

        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
    } catch (error) {
      console.warn('Date parse error:', value, error);
    }

    return undefined;
  }

  private parseStatus(value: any): 'active' | 'completed' | 'paused' | 'cancelled' | undefined {
    if (!value) return undefined;

    const str = String(value).toLowerCase().trim();
    const mapping: Record<string, 'active' | 'completed' | 'paused' | 'cancelled'> = {
      aktif: 'active',
      active: 'active',
      tamamlandı: 'completed',
      completed: 'completed',
      beklemede: 'paused',
      paused: 'paused',
      iptal: 'cancelled',
      cancelled: 'cancelled',
    };

    return mapping[str];
  }

  private parsePriority(value: any): 'low' | 'normal' | 'high' | undefined {
    if (!value) return undefined;

    const str = String(value).toLowerCase().trim();
    const mapping: Record<string, 'low' | 'normal' | 'high'> = {
      düşük: 'low',
      low: 'low',
      normal: 'normal',
      yüksek: 'high',
      high: 'high',
    };

    return mapping[str];
  }

  private parseTags(value: any): string[] | undefined {
    if (!value) return undefined;

    const str = String(value).trim();
    if (!str || str === '-') return undefined;

    return str
      .split(/[,;]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

export const excelService = new ExcelService();
