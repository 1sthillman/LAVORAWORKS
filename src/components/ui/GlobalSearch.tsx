/**
 * Global Search Component
 * Tüm veriler üzerinde akıllı arama
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  FileText,
  Briefcase,
  DollarSign,
  Image,
  Loader2,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { searchService, type SearchResult } from '@/services/search.service';
import { formatCurrency, formatDateTR } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export function GlobalSearch({ onResultClick, className }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Keyboard shortcut: Cmd/Ctrl + K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchService.search(
          { query },
          { limit: 10, sortBy: 'relevance' }
        );
        setResults(searchResults.results);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Arama hatası:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return Briefcase;
      case 'workflow':
        return TrendingUp;
      case 'ledger':
        return DollarSign;
      case 'file':
        return FileText;
      case 'scan':
        return Image;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'Proje';
      case 'workflow':
        return 'İş Akışı';
      case 'ledger':
        return 'Defter';
      case 'file':
        return 'Dosya';
      case 'scan':
        return 'Tarama';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400';
      case 'workflow':
        return 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400';
      case 'ledger':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400';
      case 'file':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400';
      case 'scan':
        return 'bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <>
      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={cn(
          'relative flex items-center gap-3 px-4 py-2.5',
          'bg-white dark:bg-gray-800',
          'border-2 border-gray-200 dark:border-gray-700',
          'rounded-xl transition-all duration-200',
          'hover:border-teal-500 dark:hover:border-teal-400',
          'group',
          className
        )}
      >
        <Search className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Ara... <kbd className="text-xs opacity-50">⌘K</kbd>
        </span>
      </motion.button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={cn(
                'fixed top-[10vh] left-1/2 -translate-x-1/2 z-50',
                'w-full max-w-2xl',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'rounded-2xl shadow-2xl overflow-hidden'
              )}
            >
              {/* Search Input */}
              <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ne aramak istiyorsunuz?"
                    className={cn(
                      'flex-1 bg-transparent',
                      'text-lg font-medium',
                      'text-gray-900 dark:text-white',
                      'placeholder-gray-400 dark:placeholder-gray-500',
                      'outline-none'
                    )}
                  />
                  {isSearching && (
                    <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                  )}
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      )}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Tips */}
                {!query && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Proje ara', 'Müşteri bul', 'Gelir/Gider', 'Dosya ara'].map((tip) => (
                      <button
                        key={tip}
                        onClick={() => setQuery(tip)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium',
                          'bg-gray-100 dark:bg-gray-700',
                          'text-gray-600 dark:text-gray-300',
                          'hover:bg-teal-50 dark:hover:bg-teal-950/30',
                          'hover:text-teal-600 dark:hover:text-teal-400',
                          'transition-colors'
                        )}
                      >
                        {tip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.length < 2 ? (
                  <div className="p-8 text-center">
                    <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aramaya başlamak için en az 2 karakter girin
                    </p>
                  </div>
                ) : results.length === 0 && !isSearching ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Sonuç bulunamadı
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      &quot;{query}&quot; için eşleşme yok
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.map((result, index) => {
                      const Icon = getTypeIcon(result.type);
                      const isSelected = index === selectedIndex;
                      
                      return (
                        <motion.button
                          key={`${result.type}-${result.item.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleResultClick(result)}
                          className={cn(
                            'w-full flex items-center gap-4 p-4',
                            'text-left transition-colors',
                            'border-l-4',
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-500'
                              : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          )}
                        >
                          <div
                            className={cn(
                              'p-3 rounded-xl',
                              getTypeColor(result.type)
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-md text-xs font-semibold',
                                  getTypeColor(result.type)
                                )}
                              >
                                {getTypeLabel(result.type)}
                              </span>
                              {result.matchedFields.length > 0 && (
                                <span className="text-xs text-gray-400">
                                  • {result.matchedFields.join(', ')}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {result.item.name || result.item.description || result.item.title || 'Başlıksız'}
                            </p>
                            {result.item.client && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {result.item.client}
                              </p>
                            )}
                            {result.item.amount && (
                              <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                                {formatCurrency(result.item.amount)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {result.item.date && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateTR(result.item.date, true)}
                              </div>
                            )}
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {results.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{results.length} sonuç bulundu</span>
                    <div className="flex items-center gap-3">
                      <span>↑↓ Gezin</span>
                      <span>↵ Seç</span>
                      <span>ESC Kapat</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
