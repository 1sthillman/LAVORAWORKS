import React from 'react';
import { Search, Sun, Moon, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const Header: React.FC = () => {
  const { theme, toggleTheme, searchQuery, setSearchQuery, setActiveModal } = useAppStore();

  return (
    <header className="sticky top-0 z-20 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 px-4 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/20">
            <span className="text-white font-extrabold text-lg">L</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
              Lavora Design
            </h1>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Çalışma Masası
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-transparent focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 transition-all outline-none text-sm font-semibold"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Temayı değiştir"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setActiveModal('settings')}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Ayarlar"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
