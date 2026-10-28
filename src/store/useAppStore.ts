import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewMode, Settings, ToastMessage } from '@/types';

interface AppState {
  // View
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;

  // Settings
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Modal state
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // View
      currentView: 'projects',
      setCurrentView: (view) => set({ currentView: view }),

      // Settings
      settings: {
        theme: 'system',
        language: 'tr',
        currency: '₺',
        dateFormat: 'DD/MM/YYYY',
        notifications: true,
        autoSave: true,
        // Firma bilgileri (HTML v17'den)
        companyName: 'Lavora Design',
        companyLogo: '',
        companyPhone: '',
        companyAddress: '',
        companyEmail: '',
        companyWebsite: '',
        taxNumber: '',
        apiKeys: {
          ocr: [
            import.meta.env.VITE_OCR_API_KEY_1 || '',
            import.meta.env.VITE_OCR_API_KEY_2 || '',
            import.meta.env.VITE_OCR_API_KEY_3 || '',
            import.meta.env.VITE_OCR_API_KEY_4 || '',
          ].filter(Boolean),
        },
      },
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      updateSettings: async (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        // Optionally save to DB
        // await db.saveSettings(get().settings);
      },

      // Theme
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Toast notifications
      toasts: [],
      addToast: (toast) => {
        const id = `toast-${Date.now()}`;
        const newToast = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto remove after duration
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration || 3000);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      // Loading states
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Modal state
      activeModal: null,
      setActiveModal: (modal) => set({ activeModal: modal }),
    }),
    {
      name: 'lavora-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        settings: state.settings,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = useAppStore.getState().theme;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemTheme;
  useAppStore.getState().setTheme(theme);
}
