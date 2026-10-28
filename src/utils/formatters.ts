/**
 * Türkçe format yardımcı fonksiyonlar
 * HTML v17'den alınan formatter'lar
 */

// Sayı formatı: 1.234,56 (Türkçe)
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Para formatı: ₺1.234,56
export const formatCurrency = (value: number, currency: string = '₺'): string => {
  const formatted = formatNumber(value, 2);
  return `${currency}${formatted}`;
};

// String'den sayıya (Türkçe format desteği)
// "1.234,56" veya "1,234.56" veya "1234,56" -> 1234.56
export const parseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  
  const v = String(value).trim();
  if (!v) return 0;

  // Virgül ve nokta kontrolü
  if (v.includes(',') && v.includes('.')) {
    const lastComma = v.lastIndexOf(',');
    const lastDot = v.lastIndexOf('.');
    
    // Hangisi daha sonra geliyorsa o ondalık ayırıcı
    if (lastComma > lastDot) {
      // TR format: 1.234,56
      return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      // EN format: 1,234.56
      return parseFloat(v.replace(/,/g, '')) || 0;
    }
  } else if (v.includes(',')) {
    // Sadece virgül var
    // 1.234,56 veya 1234,56 gibi
    return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
  } else if (/^[\d\s]{1,3}(,\d{3})+\D*$/.test(v)) {
    // EN binlik ayırıcı: 1,234
    return parseFloat(v.replace(/,/g, '')) || 0;
  } else if ((v.match(/\./g) || []).length > 1) {
    // Birden fazla nokta: 1.234.567
    return parseFloat(v.replace(/\./g, '')) || 0;
  }

  // Tek noktalı sayılar
  return parseFloat(v.replace(/[^\d.\-]/g, '')) || 0;
};

// Türkçe tarih formatı: "15 Tem 2024" veya "15 Temmuz 2024"
export const formatDateTR = (date: Date | string | number, short: boolean = true): string => {
  const d = new Date(date);
  
  const months = short 
    ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    : ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Tarih formatı: DD/MM/YYYY
export const formatDate = (date: Date | string | number, format: string = 'DD/MM/YYYY'): string => {
  const d = new Date(date);
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', String(year));
};

// Saat formatı: 14:30
export const formatTime = (date: Date | string | number): string => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Tarih ve saat: "15 Tem 2024, 14:30"
export const formatDateTime = (date: Date | string | number, short: boolean = true): string => {
  return `${formatDateTR(date, short)}, ${formatTime(date)}`;
};

// Göreli zaman: "2 saat önce", "3 gün önce"
export const formatRelativeTime = (date: Date | string | number): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return 'Az önce';
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  if (weeks < 4) return `${weeks} hafta önce`;
  if (months < 12) return `${months} ay önce`;
  return `${years} yıl önce`;
};

// Dosya boyutu: "1.5 MB", "256 KB"
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Avatar baş harfleri: "İsmail Sarıkaya" -> "İS"
export const generateAvatar = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Renk kodu üretimi (isme göre)
export const generateColorFromString = (str: string): string => {
  const colors = [
    '#0F766E', // Teal
    '#DC2626', // Red
    '#D97706', // Amber
    '#059669', // Emerald
    '#7C3AED', // Violet
    '#DB2777', // Pink
    '#2563EB', // Blue
    '#EA580C', // Orange
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// UID generator (HTML v17'den)
export const generateUID = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
};

// Türkçe karakterleri normalize et (arama için)
export const normalizeTurkish = (str: string): string => {
  return str
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .toLowerCase();
};

// Fiyat kolonu tespit et (HTML v17'den)
export const detectPriceColumn = (header: string): boolean => {
  const normalized = normalizeTurkish(header);
  return /fiyat|tutar|toplam|bedel|price|ucret/.test(normalized);
};

// Miktar kolonu tespit et
export const detectQuantityColumn = (header: string): boolean => {
  const normalized = normalizeTurkish(header);
  return /adet|miktar|quantity|qty|sayi/.test(normalized);
};

// Toplam hesapla (tablo için)
export const calculateTableTotal = (
  rows: string[][],
  headers: string[]
): { total: number; columnIndex: number } | null => {
  // Toplam kolonunu bul
  const totalColIndex = headers.findIndex(h => /toplam|tutar|total/i.test(h));
  if (totalColIndex === -1) return null;
  
  const total = rows.reduce((sum, row) => {
    const value = parseNumber(row[totalColIndex]);
    return sum + value;
  }, 0);
  
  return { total, columnIndex: totalColIndex };
};

// Otomatik kolon tespiti (HTML v17'den)
export const detectTableColumns = (headers: string[]): {
  quantity?: number;
  price?: number;
  total?: number;
  hasAutoCalc: boolean;
} => {
  const quantityCol = headers.findIndex(detectQuantityColumn);
  const priceCol = headers.findIndex(detectPriceColumn);
  const totalCol = headers.findIndex(h => /toplam|tutar|total/i.test(normalizeTurkish(h)));
  
  const hasAutoCalc = 
    quantityCol >= 0 && 
    priceCol >= 0 && 
    totalCol >= 0 && 
    quantityCol !== priceCol && 
    quantityCol !== totalCol && 
    priceCol !== totalCol;
  
  return {
    quantity: quantityCol >= 0 ? quantityCol : undefined,
    price: priceCol >= 0 ? priceCol : undefined,
    total: totalCol >= 0 ? totalCol : undefined,
    hasAutoCalc,
  };
};

// Yüzde hesapla
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// KDV hesapla
export const calculateVAT = (amount: number, rate: number = 20): {
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
} => {
  const netAmount = amount / (1 + rate / 100);
  const vatAmount = amount - netAmount;
  
  return {
    netAmount,
    vatAmount,
    totalAmount: amount,
  };
};
