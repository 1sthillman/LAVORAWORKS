/**
 * Kategori Yönetim Servisi
 * Defter (Ledger) için gelir/gider kategorileri
 */

import type { LedgerCategory } from '@/types';

// Varsayılan kategoriler (HTML v17'den)
const DEFAULT_INCOME_CATEGORIES: LedgerCategory[] = [
  { id: 'income-1', name: 'Proje Ödemesi', type: 'income', color: '#059669', icon: '💰' },
  { id: 'income-2', name: 'Danışmanlık', type: 'income', color: '#0F766E', icon: '🎯' },
  { id: 'income-3', name: 'Ürün Satışı', type: 'income', color: '#2563EB', icon: '📦' },
  { id: 'income-4', name: 'Hizmet Bedeli', type: 'income', color: '#7C3AED', icon: '⚡' },
  { id: 'income-5', name: 'Diğer Gelir', type: 'income', color: '#6B7280', icon: '💵' },
];

const DEFAULT_EXPENSE_CATEGORIES: LedgerCategory[] = [
  { id: 'expense-1', name: 'Maaş ve Ücretler', type: 'expense', color: '#DC2626', icon: '👥' },
  { id: 'expense-2', name: 'Kira', type: 'expense', color: '#EA580C', icon: '🏢' },
  { id: 'expense-3', name: 'Elektrik ve Su', type: 'expense', color: '#D97706', icon: '💡' },
  { id: 'expense-4', name: 'İnternet ve Telefon', type: 'expense', color: '#0891B2', icon: '📱' },
  { id: 'expense-5', name: 'Malzeme ve Ekipman', type: 'expense', color: '#7C3AED', icon: '🛠️' },
  { id: 'expense-6', name: 'Pazarlama ve Reklam', type: 'expense', color: '#DB2777', icon: '📢' },
  { id: 'expense-7', name: 'Ulaşım', type: 'expense', color: '#2563EB', icon: '🚗' },
  { id: 'expense-8', name: 'Yemek ve İkram', type: 'expense', color: '#059669', icon: '🍽️' },
  { id: 'expense-9', name: 'Vergi ve Harçlar', type: 'expense', color: '#DC2626', icon: '📋' },
  { id: 'expense-10', name: 'Diğer Gider', type: 'expense', color: '#6B7280', icon: '💸' },
];

class CategoryService {
  private readonly STORAGE_KEY = 'lavora_categories';
  private categories: LedgerCategory[] = [];

  constructor() {
    this.loadCategories();
  }

  // Kategorileri localStorage'dan yükle
  private loadCategories(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.categories = JSON.parse(stored);
      } else {
        // İlk kez çalışıyorsa varsayılan kategorileri yükle
        this.categories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
        this.saveCategories();
      }
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      this.categories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
    }
  }

  // Kategorileri kaydet
  private saveCategories(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categories));
    } catch (error) {
      console.error('Kategori kaydetme hatası:', error);
    }
  }

  // Tüm kategorileri getir
  getAll(): LedgerCategory[] {
    return [...this.categories];
  }

  // Tip bazlı kategorileri getir
  getByType(type: 'income' | 'expense'): LedgerCategory[] {
    return this.categories.filter(cat => cat.type === type || cat.type === 'both');
  }

  // ID ile kategori bul
  getById(id: string): LedgerCategory | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  // İsme göre kategori bul
  getByName(name: string): LedgerCategory | undefined {
    return this.categories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase()
    );
  }

  // Yeni kategori ekle
  add(category: Omit<LedgerCategory, 'id'>): LedgerCategory {
    const newCategory: LedgerCategory = {
      ...category,
      id: `${category.type}-${Date.now()}`,
    };
    
    this.categories.push(newCategory);
    this.saveCategories();
    return newCategory;
  }

  // Kategori güncelle
  update(id: string, updates: Partial<Omit<LedgerCategory, 'id'>>): boolean {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) return false;
    
    this.categories[index] = { ...this.categories[index], ...updates };
    this.saveCategories();
    return true;
  }

  // Kategori sil
  delete(id: string): boolean {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) return false;
    
    this.categories.splice(index, 1);
    this.saveCategories();
    return true;
  }

  // Varsayılan kategorileri geri yükle
  resetToDefaults(): void {
    this.categories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
    this.saveCategories();
  }

  // Kategori istatistikleri
  getStats(): {
    totalIncome: number;
    totalExpense: number;
    totalCustom: number;
  } {
    const incomeCount = this.categories.filter(c => c.type === 'income').length;
    const expenseCount = this.categories.filter(c => c.type === 'expense').length;
    
    return {
      totalIncome: incomeCount,
      totalExpense: expenseCount,
      totalCustom: this.categories.length - DEFAULT_INCOME_CATEGORIES.length - DEFAULT_EXPENSE_CATEGORIES.length,
    };
  }

  // Alt kategorileri getir
  getChildren(parentId: string): LedgerCategory[] {
    return this.categories.filter(cat => cat.parent === parentId);
  }

  // Ana kategorileri getir
  getRootCategories(type?: 'income' | 'expense'): LedgerCategory[] {
    let categories = this.categories.filter(cat => !cat.parent);
    if (type) {
      categories = categories.filter(cat => cat.type === type || cat.type === 'both');
    }
    return categories;
  }

  // Kategori ağacı oluştur
  getCategoryTree(type?: 'income' | 'expense'): LedgerCategory[] {
    const rootCategories = this.getRootCategories(type);
    return rootCategories.map(root => ({
      ...root,
      children: this.getChildren(root.id),
    })) as any;
  }
}

export const categoryService = new CategoryService();
