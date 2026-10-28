/**
 * Ledger (Defter) Store
 * HTML v17'deki tam gelir/gider yönetimi
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LedgerEntry } from '@/types';
import { db } from '@/lib/db';

export type LedgerType = 'income' | 'expense';

interface LedgerFilters {
  type: LedgerType[];
  categories: string[];
  projectIds: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: string[];
}

interface LedgerState {
  // Data
  entries: LedgerEntry[];
  selectedEntry: LedgerEntry | null;

  // Filters
  filters: LedgerFilters;
  setFilters: (filters: Partial<LedgerFilters>) => void;
  clearFilters: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // CRUD operations
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<LedgerEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<LedgerEntry>;
  updateEntry: (id: string, updates: Partial<LedgerEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setSelectedEntry: (entry: LedgerEntry | null) => void;

  // Bulk operations
  bulkDelete: (ids: string[]) => Promise<void>;

  // Getters (filtered)
  getFilteredEntries: () => LedgerEntry[];
  getEntriesByType: (type: LedgerType) => LedgerEntry[];
  getEntriesByCategory: (category: string) => LedgerEntry[];
  getEntriesByProject: (projectId: string) => LedgerEntry[];
  getEntriesByDateRange: (from: string, to: string) => LedgerEntry[];

  // Stats
  getStats: () => {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    thisMonthIncome: number;
    thisMonthExpense: number;
    thisYearIncome: number;
    thisYearExpense: number;
    averageIncome: number;
    averageExpense: number;
  };

  // Monthly summary
  getMonthlySummary: (year: number, month: number) => {
    income: number;
    expense: number;
    net: number;
    incomeCount: number;
    expenseCount: number;
  };

  // Category summary
  getCategorySummary: (type?: LedgerType) => Array<{
    category: string;
    total: number;
    count: number;
    percentage: number;
  }>;
}

const defaultFilters: LedgerFilters = {
  type: [],
  categories: [],
  projectIds: [],
  paymentMethod: [],
};

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      // Data
      entries: [],
      selectedEntry: null,

      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      clearFilters: () => set({ filters: defaultFilters }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Load entries
      loadEntries: async () => {
        try {
          const entries = await db.getLedgerEntries();
          set({ entries });
        } catch (error) {
          console.error('Defter yükleme hatası:', error);
          throw error;
        }
      },

      // Add entry
      addEntry: async (entryData) => {
        const now = new Date().toISOString();
        const entry: LedgerEntry = {
          ...entryData,
          id: `ledger-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };

        await db.saveLedgerEntry(entry);
        set((state) => ({
          entries: [...state.entries, entry],
        }));

        return entry;
      },

      // Update entry
      updateEntry: async (id, updates) => {
        const updatedEntry = {
          ...get().entries.find((e) => e.id === id)!,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await db.saveLedgerEntry(updatedEntry);
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? updatedEntry : e)),
          selectedEntry: state.selectedEntry?.id === id ? updatedEntry : state.selectedEntry,
        }));
      },

      // Delete entry
      deleteEntry: async (id) => {
        await db.deleteLedgerEntry(id);
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
          selectedEntry: state.selectedEntry?.id === id ? null : state.selectedEntry,
        }));
      },

      setSelectedEntry: (entry) => set({ selectedEntry: entry }),

      // Bulk delete
      bulkDelete: async (ids) => {
        const promises = ids.map((id) => get().deleteEntry(id));
        await Promise.all(promises);
      },

      // Getters
      getFilteredEntries: () => {
        const { entries, filters, searchQuery } = get();
        let filtered = [...entries];

        // Type filter
        if (filters.type.length > 0) {
          filtered = filtered.filter((e) => filters.type.includes(e.type));
        }

        // Category filter
        if (filters.categories.length > 0) {
          filtered = filtered.filter((e) => filters.categories.includes(e.category));
        }

        // Project filter
        if (filters.projectIds.length > 0) {
          filtered = filtered.filter((e) => e.projectId && filters.projectIds.includes(e.projectId));
        }

        // Payment method filter
        if (filters.paymentMethod && filters.paymentMethod.length > 0) {
          filtered = filtered.filter((e) => e.paymentMethod && filters.paymentMethod!.includes(e.paymentMethod));
        }

        // Date range filter
        if (filters.dateFrom) {
          filtered = filtered.filter((e) => e.date >= filters.dateFrom!);
        }
        if (filters.dateTo) {
          filtered = filtered.filter((e) => e.date <= filters.dateTo!);
        }

        // Amount range filter
        if (filters.amountMin !== undefined) {
          filtered = filtered.filter((e) => e.amount >= filters.amountMin!);
        }
        if (filters.amountMax !== undefined) {
          filtered = filtered.filter((e) => e.amount <= filters.amountMax!);
        }

        // Search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.description.toLowerCase().includes(query) ||
              e.category.toLowerCase().includes(query) ||
              e.merchant?.toLowerCase().includes(query)
          );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return filtered;
      },

      getEntriesByType: (type) => {
        return get().entries.filter((e) => e.type === type);
      },

      getEntriesByCategory: (category) => {
        return get().entries.filter((e) => e.category === category);
      },

      getEntriesByProject: (projectId) => {
        return get().entries.filter((e) => e.projectId === projectId);
      },

      getEntriesByDateRange: (from, to) => {
        return get().entries.filter((e) => e.date >= from && e.date <= to);
      },

      // Stats
      getStats: () => {
        const entries = get().entries;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const income = entries.filter((e) => e.type === 'income');
        const expense = entries.filter((e) => e.type === 'expense');

        const totalIncome = income.reduce((sum, e) => sum + e.amount, 0);
        const totalExpense = expense.reduce((sum, e) => sum + e.amount, 0);

        const thisMonthIncome = income
          .filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        const thisMonthExpense = expense
          .filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        const thisYearIncome = income
          .filter((e) => new Date(e.date).getFullYear() === currentYear)
          .reduce((sum, e) => sum + e.amount, 0);

        const thisYearExpense = expense
          .filter((e) => new Date(e.date).getFullYear() === currentYear)
          .reduce((sum, e) => sum + e.amount, 0);

        return {
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense,
          thisMonthIncome,
          thisMonthExpense,
          thisYearIncome,
          thisYearExpense,
          averageIncome: income.length > 0 ? totalIncome / income.length : 0,
          averageExpense: expense.length > 0 ? totalExpense / expense.length : 0,
        };
      },

      // Monthly summary
      getMonthlySummary: (year, month) => {
        const entries = get().entries.filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });

        const income = entries.filter((e) => e.type === 'income');
        const expense = entries.filter((e) => e.type === 'expense');

        const incomeTotal = income.reduce((sum, e) => sum + e.amount, 0);
        const expenseTotal = expense.reduce((sum, e) => sum + e.amount, 0);

        return {
          income: incomeTotal,
          expense: expenseTotal,
          net: incomeTotal - expenseTotal,
          incomeCount: income.length,
          expenseCount: expense.length,
        };
      },

      // Category summary
      getCategorySummary: (type) => {
        let entries = get().entries;
        if (type) {
          entries = entries.filter((e) => e.type === type);
        }

        const total = entries.reduce((sum, e) => sum + e.amount, 0);
        const categoryMap = new Map<string, { total: number; count: number }>();

        entries.forEach((e) => {
          const current = categoryMap.get(e.category) || { total: 0, count: 0 };
          categoryMap.set(e.category, {
            total: current.total + e.amount,
            count: current.count + 1,
          });
        });

        return Array.from(categoryMap.entries())
          .map(([category, data]) => ({
            category,
            total: data.total,
            count: data.count,
            percentage: total > 0 ? (data.total / total) * 100 : 0,
          }))
          .sort((a, b) => b.total - a.total);
      },
    }),
    {
      name: 'lavora-ledger-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
