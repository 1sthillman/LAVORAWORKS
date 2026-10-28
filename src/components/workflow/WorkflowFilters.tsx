/**
 * Advanced Workflow Filters Panel
 * Modern, kullanıcı dostu filtreleme arayüzü
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useWorkflowStore, type WorkflowStatus, type WorkflowPriority } from '@/store/useWorkflowStore';
import { cn } from '@/lib/utils';

export function WorkflowFilters() {
  const { filters, setFilters, clearFilters, getStats } = useWorkflowStore();
  const [isOpen, setIsOpen] = useState(false);
  const stats = getStats();

  const statusOptions: Array<{ value: WorkflowStatus; label: string; icon: any; color: string; count: number }> = [
    { value: 'pending', label: 'Beklemede', icon: Clock, color: 'text-amber-500', count: stats.pending },
    { value: 'in-progress', label: 'Devam Ediyor', icon: TrendingUp, color: 'text-blue-500', count: stats.inProgress },
    { value: 'completed', label: 'Tamamlandı', icon: CheckCircle2, color: 'text-emerald-500', count: stats.completed },
    { value: 'cancelled', label: 'İptal', icon: XCircle, color: 'text-red-500', count: stats.cancelled },
  ];

  const priorityOptions: Array<{ value: WorkflowPriority; label: string; color: string; dotColor: string }> = [
    { value: 'low', label: 'Düşük', color: 'text-gray-600', dotColor: 'bg-gray-400' },
    { value: 'medium', label: 'Orta', color: 'text-blue-600', dotColor: 'bg-blue-500' },
    { value: 'high', label: 'Yüksek', color: 'text-orange-600', dotColor: 'bg-orange-500' },
    { value: 'urgent', label: 'Acil', color: 'text-red-600', dotColor: 'bg-red-500' },
  ];

  const activeFilterCount =
    filters.status.length +
    filters.priority.length +
    filters.projectIds.length +
    (filters.dueDateFrom ? 1 : 0) +
    (filters.dueDateTo ? 1 : 0);

  const handleStatusToggle = (status: WorkflowStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    setFilters({ status: newStatus });
  };

  const handlePriorityToggle = (priority: WorkflowPriority) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    setFilters({ priority: newPriority });
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center gap-2 px-4 py-2.5',
          'bg-white dark:bg-gray-800',
          'border-2 border-gray-200 dark:border-gray-700',
          'rounded-xl font-semibold text-sm',
          'transition-all duration-200',
          'hover:border-teal-500 dark:hover:border-teal-400',
          isOpen && 'border-teal-500 dark:border-teal-400 shadow-lg shadow-teal-500/20'
        )}
      >
        <Filter className="w-4 h-4" />
        <span>Filtrele</span>
        {activeFilterCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute -top-2 -right-2',
              'w-6 h-6 rounded-full',
              'bg-gradient-to-br from-teal-500 to-teal-600',
              'text-white text-xs font-bold',
              'flex items-center justify-center',
              'shadow-lg'
            )}
          >
            {activeFilterCount}
          </motion.span>
        )}
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={cn(
                'absolute top-full left-0 mt-2 z-50',
                'w-[500px] max-h-[600px] overflow-y-auto',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'rounded-2xl shadow-2xl',
                'p-6'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Gelişmiş Filtreler
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Durum
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = filters.status.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusToggle(option.value)}
                        className={cn(
                          'relative flex items-center gap-3 p-3',
                          'border-2 rounded-xl',
                          'transition-all duration-200',
                          'text-left',
                          isSelected
                            ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            isSelected
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {option.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {option.count} iş
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Öncelik
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((option) => {
                    const isSelected = filters.priority.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePriorityToggle(option.value)}
                        className={cn(
                          'relative flex items-center gap-3 p-3',
                          'border-2 rounded-xl',
                          'transition-all duration-200',
                          'text-left',
                          isSelected
                            ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className={cn('w-3 h-3 rounded-full', option.dotColor)} />
                        <p className="flex-1 font-semibold text-sm text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Termin Tarihi</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      Başlangıç
                    </label>
                    <input
                      type="date"
                      value={filters.dueDateFrom || ''}
                      onChange={(e) => setFilters({ dueDateFrom: e.target.value || undefined })}
                      className={cn(
                        'w-full px-3 py-2',
                        'bg-gray-50 dark:bg-gray-900',
                        'border border-gray-200 dark:border-gray-700',
                        'rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-teal-500',
                        'text-gray-900 dark:text-white'
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      Bitiş
                    </label>
                    <input
                      type="date"
                      value={filters.dueDateTo || ''}
                      onChange={(e) => setFilters({ dueDateTo: e.target.value || undefined })}
                      className={cn(
                        'w-full px-3 py-2',
                        'bg-gray-50 dark:bg-gray-900',
                        'border border-gray-200 dark:border-gray-700',
                        'rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-teal-500',
                        'text-gray-900 dark:text-white'
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-4 rounded-xl mb-6',
                    'bg-gradient-to-br from-teal-50 to-blue-50',
                    'dark:from-teal-950/30 dark:to-blue-950/30',
                    'border border-teal-200 dark:border-teal-800'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">
                      {activeFilterCount} aktif filtre uygulandı
                    </p>
                  </div>
                  {stats.overdue > 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      ⚠️ {stats.overdue} gecikmiş iş var
                    </p>
                  )}
                  {stats.urgent > 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      🔥 {stats.urgent} acil iş var
                    </p>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    clearFilters();
                    setIsOpen(false);
                  }}
                  disabled={activeFilterCount === 0}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm',
                    'border-2 border-gray-200 dark:border-gray-700',
                    'text-gray-700 dark:text-gray-300',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  Temizle
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm',
                    'bg-gradient-to-r from-teal-500 to-teal-600',
                    'text-white shadow-lg shadow-teal-500/30',
                    'transition-all duration-200',
                    'hover:shadow-xl hover:shadow-teal-500/40'
                  )}
                >
                  Uygula
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
