import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Yazdırma ve PDF servisi
 */
class PrintService {
  /**
   * Elementi PDF olarak kaydet
   */
  async exportToPDF(
    element: HTMLElement,
    filename: string = 'document.pdf',
    options?: {
      title?: string;
      orientation?: 'portrait' | 'landscape';
    }
  ): Promise<void> {
    try {
      // Element'i canvas'a çevir
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = options?.orientation === 'landscape' ? 297 : 210;
      const pageHeight = options?.orientation === 'landscape' ? 210 : 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: options?.orientation || 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let heightLeft = imgHeight;
      let position = 0;

      // İlk sayfa
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Çok sayfalı içerik
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Metadata
      if (options?.title) {
        pdf.setProperties({
          title: options.title,
          subject: 'Lavora Workflow Export',
          author: 'Lavora Design',
          creator: 'Lavora Workflow',
        });
      }

      pdf.save(filename);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      throw new Error('PDF oluşturulamadı');
    }
  }

  /**
   * Proje raporunu PDF olarak kaydet
   */
  async exportProjectReport(project: any): Promise<void> {
    const reportHtml = this.generateProjectReportHtml(project);
    
    // Geçici bir div oluştur
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = reportHtml;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);

    try {
      await this.exportToPDF(
        tempDiv,
        `${project.name}_rapor_${Date.now()}.pdf`,
        {
          title: `${project.name} - Proje Raporu`,
          orientation: 'portrait',
        }
      );
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Proje raporu HTML şablonu
   */
  private generateProjectReportHtml(project: any): string {
    const now = new Date().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a;">
        <!-- Header -->
        <div style="border-bottom: 3px solid #0F766E; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="margin: 0; font-size: 28px; color: #0F766E;">
                ${this.escapeHtml(project.name)}
              </h1>
              <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
                Proje Raporu
              </p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #64748b;">
                ${now}
              </div>
              ${project.client ? `
                <div style="font-size: 14px; font-weight: 600; margin-top: 4px;">
                  ${this.escapeHtml(project.client)}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Proje Bilgileri -->
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; color: #1e293b; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            Proje Bilgileri
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; width: 30%; font-weight: 600; color: #64748b;">Durum:</td>
              <td style="padding: 8px;">${this.escapeHtml(project.status || '-')}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 8px; font-weight: 600; color: #64748b;">İlerleme:</td>
              <td style="padding: 8px;">%${project.progress || 0}</td>
            </tr>
            ${project.start ? `
              <tr>
                <td style="padding: 8px; font-weight: 600; color: #64748b;">Başlangıç:</td>
                <td style="padding: 8px;">${new Date(project.start).toLocaleDateString('tr-TR')}</td>
              </tr>
            ` : ''}
            ${project.end ? `
              <tr style="background-color: #f8fafc;">
                <td style="padding: 8px; font-weight: 600; color: #64748b;">Bitiş:</td>
                <td style="padding: 8px;">${new Date(project.end).toLocaleDateString('tr-TR')}</td>
              </tr>
            ` : ''}
            ${project.budget ? `
              <tr>
                <td style="padding: 8px; font-weight: 600; color: #64748b;">Bütçe:</td>
                <td style="padding: 8px;">₺${project.budget.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
              </tr>
            ` : ''}
          </table>
        </div>

        ${project.workflow && project.workflow.length > 0 ? `
          <!-- İş Akışı -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #1e293b; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              İş Akışı (${project.workflow.length} görev)
            </h2>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background-color: #0F766E; color: white;">
                  <th style="padding: 10px; text-align: left; font-weight: 600;">Görev</th>
                  <th style="padding: 10px; text-align: center; font-weight: 600;">Durum</th>
                  <th style="padding: 10px; text-align: center; font-weight: 600;">Öncelik</th>
                </tr>
              </thead>
              <tbody>
                ${project.workflow.map((task: any, index: number) => `
                  <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
                    <td style="padding: 10px;">${this.escapeHtml(task.title)}</td>
                    <td style="padding: 10px; text-align: center;">
                      <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                        ${task.status === 'completed' ? 'background-color: #dcfce7; color: #15803d;' : 
                          task.status === 'in-progress' ? 'background-color: #fef3c7; color: #a16207;' : 
                          'background-color: #f3f4f6; color: #6b7280;'}">
                        ${task.status === 'completed' ? 'Tamamlandı' : task.status === 'in-progress' ? 'Devam Ediyor' : 'Bekliyor'}
                      </span>
                    </td>
                    <td style="padding: 10px; text-align: center;">${this.escapeHtml(task.priority || '-')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${project.ledger && project.ledger.length > 0 ? `
          <!-- Masraf Defteri -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #1e293b; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              Masraf Defteri
            </h2>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background-color: #0F766E; color: white;">
                  <th style="padding: 10px; text-align: left; font-weight: 600;">Tarih</th>
                  <th style="padding: 10px; text-align: left; font-weight: 600;">Açıklama</th>
                  <th style="padding: 10px; text-align: right; font-weight: 600;">Tutar</th>
                  <th style="padding: 10px; text-align: center; font-weight: 600;">Tip</th>
                </tr>
              </thead>
              <tbody>
                ${project.ledger.map((entry: any, index: number) => `
                  <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
                    <td style="padding: 10px; white-space: nowrap;">
                      ${entry.date ? new Date(entry.date).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td style="padding: 10px;">${this.escapeHtml(entry.description)}</td>
                    <td style="padding: 10px; text-align: right; font-weight: 600;">
                      ₺${(entry.total || entry.amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style="padding: 10px; text-align: center;">
                      <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;
                        ${entry.type === 'income' ? 'background-color: #dcfce7; color: #15803d;' : 'background-color: #fee2e2; color: #b91c1c;'}">
                        ${entry.type === 'income' ? 'Gelir' : 'Gider'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
                <tr style="background-color: #f1f5f9; font-weight: 700;">
                  <td colspan="2" style="padding: 12px; text-align: right;">TOPLAM:</td>
                  <td style="padding: 12px; text-align: right; color: #0F766E;">
                    ₺${this.calculateTotal(project.ledger).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">Lavora Workflow tarafından oluşturuldu</p>
          <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Lavora Design</p>
        </div>
      </div>
    `;
  }

  /**
   * HTML karakterlerini escape et
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Masraf defteri toplamını hesapla
   */
  private calculateTotal(ledger: any[]): number {
    return ledger.reduce((sum, entry) => {
      const amount = entry.total || entry.amount || 0;
      return sum + (entry.type === 'income' ? amount : -amount);
    }, 0);
  }

  /**
   * Normal tarayıcı yazdırma
   */
  print(element?: HTMLElement): void {
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Yazdır</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                @media print {
                  body { margin: 0; padding: 20px; }
                  @page { margin: 1cm; }
                }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    } else {
      window.print();
    }
  }

  /**
   * Projeyi PDF olarak dışa aktar
   */
  async exportProjectPDF(project: any): Promise<void> {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.backgroundColor = 'white';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    
    container.innerHTML = `
      <h1 style="color: #0F766E; margin-bottom: 10px;">${project.name}</h1>
      <p style="color: #666; margin-bottom: 30px;">Müşteri: ${project.client}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Durum:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${project.status}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Başlangıç:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(project.startDate).toLocaleDateString('tr-TR')}</td>
        </tr>
        ${
          project.dueDate
            ? `<tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Bitiş:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(project.dueDate).toLocaleDateString('tr-TR')}</td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Toplam Tutar:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">₺${project.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ödenen:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">₺${project.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>İlerleme:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">%${project.progress}</td>
        </tr>
      </table>
      
      ${project.description ? `<p style="margin-top: 20px;"><strong>Açıklama:</strong><br>${project.description}</p>` : ''}
    `;
    
    document.body.appendChild(container);
    
    try {
      await this.exportToPDF(container, `${project.name}.pdf`, {
        title: project.name,
        orientation: 'portrait',
      });
    } finally {
      document.body.removeChild(container);
    }
  }
}

export const printService = new PrintService();
