export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  progress: number;
  description?: string;
  avatar?: string; // İlk 2 harf (İS, TD gibi)
  color?: string; // Renk kodu
  createdAt: string;
  updatedAt: string;
  workflowItems?: WorkflowItem[];
  // HTML'den eksik özellikler:
  clientContact?: string; // Müşteri iletişim
  clientEmail?: string;
  clientPhone?: string;
  tags?: string[]; // Etiketler
  priority?: 'low' | 'normal' | 'high'; // Proje önceliği
  // Tablo projesi (Excel'den gelen tablolar)
  tableData?: Array<{
    name: string;
    pre?: any[][]; // Header öncesi satırlar (HTML v17: s.pre)
    headers: string[];
    rows: any[][];
    columnInfo?: {
      quantityCol: number;
      priceCol: number;
      totalCol: number;
      hasAutoCalc: boolean;
    };
  }>;
  // HTML v17 workflow structure (p.w)
  workflow?: {
    stages: WorkflowStage[]; // Default: ['Tasarım', 'Sipariş', 'Teslimat']
    items: WorkflowItem[]; // Her satır bir workflow item
    todo: Array<{ id: string; text: string; done: boolean }>; // Yapılacaklar listesi
    due?: string; // Termin tarihi
    note?: string; // Proje notu
  };
}

export interface WorkflowItem {
  id: string;
  projectId: string;
  name: string; // n: Ürün adı
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  stage: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  notes?: string;
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  // HTML v17 fields
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[]; // Bağımlı iş ID'leri
  attachments?: string[]; // Dosya ID'leri
  comments?: WorkflowComment[];
  // Excel/Table row fields (HTML v17 uyumluluğu için)
  sheetName?: string; // sh: Hangi sheet'ten geldiği
  rowIndex?: number; // Orijinal satır numarası
  quantity?: string; // q: Adet
  dimension?: string; // dim: Ölçü/Boyut
  material?: string; // mat: Malzeme
  price?: number; // Birim fiyat
  total?: number; // Toplam tutar
  pricePending?: boolean; // pend: Fiyat girilmemiş mi?
  stageStatus?: Record<string, number>; // st: {stageId: 0|1|2|3} - 0:bekliyor, 1:devam, 2:tamam, 3:yarıda
  photos?: string[]; // ph: Fotoğraf ID'leri
  group?: string; // grp: Grup/Kategori
  multiplier?: number; // mul: Çarpan (ör. 2 oda için x2)
}

export interface WorkflowComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: number;
}

export interface LedgerEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  projectId?: string;
  vatRate?: number;
  vatAmount?: number;
  totalWithVat?: number;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'other';
  createdAt: string;
  updatedAt: string;
  // HTML'den eksik özellikler:
  receiptId?: string; // Fiş/fatura fotoğrafı ID'si
  recurring?: boolean; // Tekrarlayan mı?
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  merchant?: string; // Satıcı/Alıcı
  invoiceNumber?: string; // Fatura numarası
  tags?: string[];
}

export interface LedgerCategory {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color?: string;
  icon?: string;
  parent?: string; // Ana kategori ID'si (alt kategoriler için)
}

export interface Receipt {
  id: string;
  ledgerId?: string;
  date: number;
  type: 'income' | 'expense';
  amount?: number;
  imageData: string;
  thumbnail?: string;
  description?: string;
  merchant?: string;
  ocrData?: ReceiptOCRData;
}

export interface ReceiptOCRData {
  merchant?: string;
  date?: string;
  total?: number;
  vat?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  rawText?: string;
}

export interface FileEntry {
  id: string;
  projectId?: string;
  name: string;
  type: string; // mime type
  size: number;
  category?: 'document' | 'image' | 'video' | 'other';
  uploadDate: number;
  data: string | ArrayBuffer;
  thumbnail?: string;
  description?: string;
  tags?: string[];
}

export interface OCRScan {
  id: string;
  timestamp: number;
  type: 'table' | 'receipt' | 'text';
  data: any;
  imageData?: string;
  thumbnail?: string;
  title?: string;
  processed: boolean;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  metadata?: {
    autoDetectedColumns?: {
      quantity?: number;
      price?: number;
      total?: number;
    };
    totalAmount?: number;
    currency?: string;
  };
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  currency: string;
  dateFormat: string;
  notifications: boolean;
  autoSave: boolean;
  // HTML'den eksik özellikler:
  companyName?: string;
  companyLogo?: string; // Base64 image
  companyPhone?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyWebsite?: string;
  taxNumber?: string;
  apiKeys?: {
    ocr?: string[];
  };
}

export interface Statistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  thisMonthRevenue: number;
  thisMonthExpenses: number;
}

export type ViewMode = 'projects' | 'workflow' | 'ledger' | 'files' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
