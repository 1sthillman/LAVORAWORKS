import imageCompression from 'browser-image-compression';

export interface OCRResult {
  text: string;
  confidence: number;
  lines: string[];
  boundingBoxes?: BoundingBox[];
}

export interface BoundingBox {
  text: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  confidence: number;
}

/**
 * OCR servisi - API Ninjas kullanarak fotoğraflardan metin ve tablo çıkarır
 * Self-Healing: 4 API key ile otomatik yedekleme sistemi
 * Optimize edilmiş: Görsel sıkıştırma + akıllı tablo algılama
 */
class OCRService {
  private readonly API_KEYS = [
    import.meta.env.VITE_OCR_API_KEY_1,
    import.meta.env.VITE_OCR_API_KEY_2,
    import.meta.env.VITE_OCR_API_KEY_3,
    import.meta.env.VITE_OCR_API_KEY_4,
  ].filter(Boolean); // Boş olanları filtrele

  private readonly API_URL = 'https://api.api-ninjas.com/v1/imagetotext';
  private readonly MAX_SIZE_KB = 180; // 200KB limitinin altında güvenli alan
  
  private currentKeyIndex = 0;
  private failedKeys = new Set<number>();
  private lastResetTime = Date.now();
  private readonly RESET_INTERVAL = 60 * 60 * 1000; // 1 saat sonra başarısız key'leri sıfırla

  /**
   * Aktif API key'i al (self-healing)
   */
  private getActiveAPIKey(): string {
    // 1 saat geçtiyse başarısız key'leri sıfırla
    if (Date.now() - this.lastResetTime > this.RESET_INTERVAL) {
      this.failedKeys.clear();
      this.lastResetTime = Date.now();
      this.currentKeyIndex = 0;
      console.log('🔄 API key havuzu sıfırlandı');
    }

    // Tüm key'ler bittiyse en başa dön
    if (this.failedKeys.size >= this.API_KEYS.length) {
      console.warn('⚠️ Tüm API key\'ler limit aştı, 1 saat sonra tekrar deneyin');
      throw new Error('Tüm OCR API limitleri doldu. Lütfen 1 saat sonra tekrar deneyin.');
    }

    // Kullanılabilir ilk key'i bul
    for (let i = 0; i < this.API_KEYS.length; i++) {
      const index = (this.currentKeyIndex + i) % this.API_KEYS.length;
      if (!this.failedKeys.has(index)) {
        this.currentKeyIndex = index;
        return this.API_KEYS[index];
      }
    }

    throw new Error('Kullanılabilir API key bulunamadı');
  }

  /**
   * API key'i başarısız olarak işaretle ve bir sonrakine geç
   */
  private markKeyAsFailed(): void {
    console.log(`❌ API Key ${this.currentKeyIndex + 1} başarısız, yedek key'e geçiliyor...`);
    this.failedKeys.add(this.currentKeyIndex);
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.API_KEYS.length;
  }

  /**
   * API durumunu logla
   */
  private logAPIStatus(): void {
    const available = this.API_KEYS.length - this.failedKeys.size;
    console.log(`🔑 API Durumu: ${available}/${this.API_KEYS.length} key kullanılabilir`);
  }

  /**
   * Görseli sıkıştır (200KB altına indir)
   */
  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: this.MAX_SIZE_KB / 1024, // KB to MB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Görsel sıkıştırıldı: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
      return compressedFile;
    } catch (error) {
      console.error('Sıkıştırma hatası:', error);
      throw new Error('Görsel sıkıştırılamadı');
    }
  }

  /**
   * Base64 string'i File'a çevir
   */
  private base64ToFile(base64: string, filename: string = 'image.jpg'): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * API Ninjas ile OCR yap (Self-Healing Retry)
   */
  private async callAPI(file: File, retryCount = 0): Promise<BoundingBox[]> {
    const maxRetries = this.API_KEYS.length;
    
    if (retryCount >= maxRetries) {
      throw new Error('Tüm API key\'leri denendi, işlem başarısız');
    }

    const apiKey = this.getActiveAPIKey();
    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log(`🔍 OCR işlemi başlatılıyor (API Key ${this.currentKeyIndex + 1})...`);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 429 (Rate Limit) veya 403 (Forbidden) ise başka key dene
        if (response.status === 429 || response.status === 403) {
          console.warn(`⚠️ API Key ${this.currentKeyIndex + 1} limit aştı (${response.status})`);
          this.markKeyAsFailed();
          this.logAPIStatus();
          
          // Başka key varsa tekrar dene
          if (this.failedKeys.size < this.API_KEYS.length) {
            console.log('🔄 Yedek API key ile yeniden deneniyor...');
            return this.callAPI(file, retryCount + 1);
          }
        }
        
        console.error('API Hatası:', response.status, errorText);
        throw new Error(`OCR API hatası: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('API geçersiz veri döndü');
      }

      console.log(`✅ OCR başarılı! ${data.length} kelime tanındı`);
      this.logAPIStatus();

      return data.map((item: any) => ({
        text: item.text || '',
        x1: item.bounding_box?.x1 || 0,
        y1: item.bounding_box?.y1 || 0,
        x2: item.bounding_box?.x2 || 0,
        y2: item.bounding_box?.y2 || 0,
      }));
    } catch (error) {
      // Network hatası veya diğer hatalar
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ Ağ hatası, yeniden deneniyor...');
        
        // Başka key varsa tekrar dene
        if (retryCount < maxRetries - 1) {
          this.markKeyAsFailed();
          return this.callAPI(file, retryCount + 1);
        }
      }
      
      console.error('OCR API çağrı hatası:', error);
      throw error;
    }
  }

  /**
   * Resimden metin çıkar
   */
  async recognizeText(
    image: string | File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    onProgress?.(0.1);

    // File'a çevir
    let file: File;
    if (typeof image === 'string') {
      file = this.base64ToFile(image);
    } else if (image instanceof Blob && !(image instanceof File)) {
      file = new File([image], 'image.jpg', { type: 'image/jpeg' });
    } else {
      file = image as File;
    }

    onProgress?.(0.3);

    // Sıkıştır
    const compressedFile = await this.compressImage(file);
    onProgress?.(0.5);

    // API çağrısı
    const boundingBoxes = await this.callAPI(compressedFile);
    onProgress?.(0.9);

    // Metni birleştir
    const text = boundingBoxes.map((box) => box.text).join(' ');
    
    // Satırlara ayır (y koordinatına göre grupla)
    const lines = this.groupIntoLines(boundingBoxes);

    onProgress?.(1.0);

    return {
      text,
      confidence: 90, // API Ninjas confidence vermiyor, sabit değer
      lines,
      boundingBoxes,
    };
  }

  /**
   * Bounding box'ları satırlara grupla (y koordinatına göre)
   */
  private groupIntoLines(boxes: BoundingBox[]): string[] {
    if (boxes.length === 0) return [];

    // Y koordinatına göre sırala
    const sorted = [...boxes].sort((a, b) => a.y1 - b.y1);

    const lines: BoundingBox[][] = [];
    let currentLine: BoundingBox[] = [sorted[0]];
    let currentY = sorted[0].y1;

    for (let i = 1; i < sorted.length; i++) {
      const box = sorted[i];
      const yDiff = Math.abs(box.y1 - currentY);

      // Aynı satırda mı? (15px tolerans)
      if (yDiff < 15) {
        currentLine.push(box);
      } else {
        // Yeni satır başlat
        lines.push(currentLine);
        currentLine = [box];
        currentY = box.y1;
      }
    }
    
    // Son satırı ekle
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Her satırdaki kelimeleri x koordinatına göre sırala ve birleştir
    return lines.map((line) => {
      const sorted = line.sort((a, b) => a.x1 - b.x1);
      return sorted.map((box) => box.text).join(' ').trim();
    });
  }

  /**
   * Resimden tablo çıkar (Akıllı Sütun Algılama)
   */
  async recognizeTable(
    image: string | File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<TableData> {
    const ocrResult = await this.recognizeText(image, onProgress);

    if (!ocrResult.boundingBoxes || ocrResult.boundingBoxes.length === 0) {
      return {
        headers: [],
        rows: [],
        confidence: 0,
      };
    }

    // Satırlara grupla
    const lineGroups = this.groupIntoRows(ocrResult.boundingBoxes);

    if (lineGroups.length === 0) {
      return {
        headers: [],
        rows: [],
        confidence: 0,
      };
    }

    // İlk satırı header olarak al
    const headers = lineGroups[0].map((box) => box.text);
    
    // Diğer satırları rows olarak al
    const rows = lineGroups.slice(1).map((row) => 
      row.map((box) => box.text)
    );

    return {
      headers,
      rows,
      confidence: ocrResult.confidence,
    };
  }

  /**
   * Bounding box'ları satır ve sütunlara grupla
   */
  private groupIntoRows(boxes: BoundingBox[]): BoundingBox[][] {
    if (boxes.length === 0) return [];

    // Y koordinatına göre sırala
    const sorted = [...boxes].sort((a, b) => a.y1 - b.y1);

    const rows: BoundingBox[][] = [];
    let currentRow: BoundingBox[] = [sorted[0]];
    let currentY = sorted[0].y1;

    for (let i = 1; i < sorted.length; i++) {
      const box = sorted[i];
      const yDiff = Math.abs(box.y1 - currentY);

      // Aynı satırda mı? (20px tolerans - tablo için biraz daha geniş)
      if (yDiff < 20) {
        currentRow.push(box);
      } else {
        // Satırı x koordinatına göre sırala ve ekle
        currentRow.sort((a, b) => a.x1 - b.x1);
        rows.push(currentRow);
        currentRow = [box];
        currentY = box.y1;
      }
    }
    
    // Son satırı ekle
    if (currentRow.length > 0) {
      currentRow.sort((a, b) => a.x1 - b.x1);
      rows.push(currentRow);
    }

    return rows;
  }

  /**
   * Fatura/fiş analizi - Akıllı toplam ve ürün çıkarma
   */
  async recognizeReceipt(
    image: string | File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<{
    items: Array<{ name: string; quantity?: number; price?: number; total?: number }>;
    total?: number;
    subtotal?: number;
    vat?: number;
    date?: string;
    merchant?: string;
  }> {
    const result = await this.recognizeText(image, onProgress);
    const lines = result.lines;

    const items: Array<{ name: string; quantity?: number; price?: number; total?: number }> = [];
    let total: number | undefined;
    let subtotal: number | undefined;
    let vat: number | undefined;
    let date: string | undefined;
    let merchant: string | undefined;

    // İlk 3 satırda firma adını ara
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      if (lines[i].length > 3 && !merchant) {
        merchant = lines[i];
        break;
      }
    }

    // Tarih formatlarını ara (DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY)
    const dateRegex = /(\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4})/;
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match && !date) {
        date = match[1];
        break;
      }
    }

    // Fiyat regex'leri (Türk formatı)
    const priceRegex = /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d+[.,]\d{2}|\d+)\s*(?:TL|₺|EUR|USD|\$)?/gi;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Toplam satırı
      if (/toplam|total|genel\s*top/i.test(lowerLine)) {
        const prices = Array.from(line.matchAll(priceRegex));
        if (prices.length > 0) {
          const lastPrice = prices[prices.length - 1];
          total = this.parsePrice(lastPrice[1]);
        }
      }
      // Ara toplam
      else if (/ara\s*top|subtotal/i.test(lowerLine)) {
        const prices = Array.from(line.matchAll(priceRegex));
        if (prices.length > 0) {
          subtotal = this.parsePrice(prices[prices.length - 1][1]);
        }
      }
      // KDV
      else if (/kdv|vat|vergi/i.test(lowerLine)) {
        const prices = Array.from(line.matchAll(priceRegex));
        if (prices.length > 0) {
          vat = this.parsePrice(prices[prices.length - 1][1]);
        }
      }
      // Ürün satırı (en az 1 fiyat içeren ve toplam/kdv olmayan)
      else {
        const prices = Array.from(line.matchAll(priceRegex));
        
        if (prices.length > 0) {
          // Satır numarasını kaldır
          let itemName = line
            .replace(priceRegex, '')
            .trim()
            .replace(/^\d+\.?\s*/, '');

          if (itemName.length > 2) {
            const price = prices[prices.length - 1];
            items.push({
              name: itemName,
              price: this.parsePrice(price[1]),
            });
          }
        }
      }
    }

    return {
      items,
      total,
      subtotal,
      vat,
      date,
      merchant,
    };
  }

  /**
   * Fiyat string'ini sayıya çevir (Türk formatı)
   */
  private parsePrice(priceStr: string): number {
    // Nokta veya virgülle binlik ayraç ve ondalık ayracı temizle
    let cleaned = priceStr.trim();
    
    // Türk formatı: 1.234,56 → 1234.56
    // Amerikan formatı: 1,234.56 → 1234.56
    
    const commaCount = (cleaned.match(/,/g) || []).length;
    const dotCount = (cleaned.match(/\./g) || []).length;

    if (commaCount > 0 && dotCount > 0) {
      // Her ikisi de var - hangisi ondalık ayracı?
      const lastComma = cleaned.lastIndexOf(',');
      const lastDot = cleaned.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // Virgül ondalık: 1.234,56
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Nokta ondalık: 1,234.56
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (commaCount > 0) {
      // Sadece virgül var
      if (commaCount === 1 && cleaned.split(',')[1].length <= 2) {
        // Ondalık ayracı: 12,50
        cleaned = cleaned.replace(',', '.');
      } else {
        // Binlik ayracı: 1,234
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (dotCount > 1) {
      // Birden fazla nokta - binlik ayracı: 1.234.567
      cleaned = cleaned.replace(/\./g, '');
    }

    return parseFloat(cleaned) || 0;
  }

  /**
   * Worker temizleme (API kullanımında gerek yok ama interface uyumu için)
   */
  async terminate(): Promise<void> {
    // API kullanımında worker yok
    return Promise.resolve();
  }
}

export const ocrService = new OCRService();
