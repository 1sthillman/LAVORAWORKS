/**
 * Ledger View Component
 * Gelir/Gider yönetimi - HTML v17'den daha gelişmiş
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Receipt,
  Sparkles,
  Search,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { useLedgerStore } from '@/store/useLedgerStore';
import { formatCurrency, formatDateTR } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export function LedgerView() {
  const {
    loadEntries,
    getFilteredEntries,
    getStats,
    getMonthlySummary,
    getCategorySummary,
    searchQuery,
    setSearchQuery,
  } = useLedgerStore();

  const [view, setView] = useState<'list' | 'stats'>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const stats = getStats();
  const monthlySummary = getMonthlySummary(selectedYear, selectedMonth);
  const categorySummary = getCategorySummary();
  const filteredEntries = getFilteredEntries();

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gelir & Gider Defteri
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Finansal kayıtlarınızı yönetin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5',
                'bg-gradient-to-r from-emerald-500 to-emerald-600',
                'text-white rounded-xl font-semibold text-sm',
                'shadow-lg shadow-emerald-500/30',
                'hover:shadow-xl hover:shadow-emerald-500/40',
                'transition-all'
              )}
            >
              <Plus className="w-4 h-4" />
              Yeni Kayıt
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            label="Toplam Gelir"
            value={formatCurrency(stats.totalIncome)}
            trend="+12%"
            icon={TrendingUp}
            color="emerald"
          />
          <StatsCard
            label="Toplam Gider"
            value={formatCurrency(stats.totalExpense)}
            trend="-8%"
            icon={TrendingDown}
            color="red"
          />
          <StatsCard
            label="Net Kâr"
            value={formatCurrency(stats.netProfit)}
            subtitle={`${stats.netProfit >= 0 ? 'Kâr' : 'Zarar'}`}
            icon={DollarSign}
            color={stats.netProfit >= 0 ? 'teal' : 'amber'}
          />
          <StatsCard
            label="Bu Ay"
            value={formatCurrency(stats.thisMonthIncome - stats.thisMonthExpense)}
            subtitle={`${monthlySummary.incomeCount + monthlySummary.expenseCount} işlem`}
            icon={Calendar}
            color="blue"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Açıklama, kategori veya satıcı ara..."
              className={cn(
                'w-full pl-10 pr-4 py-2.5',
                'bg-gray-50 dark:bg-gray-900',
                'border border-gray-200 dark:border-gray-700',
                'rounded-xl text-sm',
                'focus:outline-none focus:ring-2 focus:ring-teal-500',
                'placeholder-gray-400 dark:placeholder-gray-500'
              )}
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
            <button
              onClick={() => setView('list')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                view === 'list'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Liste
            </button>
            <button
              onClick={() => setView('stats')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                view === 'stats'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              İstatistikler
            </button>
          </div>

          <button className="p-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 transition-colors">
            <Filter className="w-5 h-5" />
          </button>

          <button className="p-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {view === 'list' ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    'bg-white dark:bg-gray-800',
                    'border-2 border-gray-200 dark:border-gray-700',
                    'rounded-xl p-4',
                    'hover:shadow-lg hover:border-teal-500',
                    'transition-all duration-200',
                    'group'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'p-3 rounded-xl',
                        entry.type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30'
                          : 'bg-red-50 dark:bg-red-950/30'
                      )}
                    >
                      {entry.type === 'income' ? (
                        <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                            {entry.description}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-semibold">
                              {entry.category}
                            </span>
                            {entry.merchant && (
                              <>
                                <span>•</span>
                                <span>{entry.merchant}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateTR(entry.date, true)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={cn(
                              'text-2xl font-bold mb-1',
                              entry.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {entry.type === 'income' ? '+' : '-'}
                            {formatCurrency(entry.amount)}
                          </p>
                          {entry.paymentMethod && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {entry.paymentMethod === 'cash' && '💵 Nakit'}
                              {entry.paymentMethod === 'card' && '💳 Kart'}
                              {entry.paymentMethod === 'transfer' && '🏦 Havale'}
                              {entry.paymentMethod === 'other' && '📝 Diğer'}
                            </p>
                          )}
                        </div>
                      </div>

                      {entry.receiptId && (
                        <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400">
                          <Receipt className="w-4 h-4" />
                          <span>Fiş/Fatura ekli</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 hover:text-red-600 dark:hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredEntries.length === 0 && (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Henüz kayıt yok
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  İlk gelir veya gider kaydınızı oluşturun
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Plus className="w-5 h-5 inline mr-2" />
                  Yeni Kayıt Ekle
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Monthly Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Aylık Özet
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Gelir</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(monthlySummary.income)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {monthlySummary.incomeCount} kayıt
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Gider</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(monthlySummary.expense)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {monthlySummary.expenseCount} kayıt
                  </p>
                </div>
                <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                  <p className="text-sm text-teal-600 dark:text-teal-400 mb-1">Net</p>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {formatCurrency(monthlySummary.net)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {monthlySummary.net >= 0 ? 'Kâr' : 'Zarar'}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Kategori Dağılımı
              </h3>
              <div className="space-y-3">
                {categorySummary.slice(0, 8).map((cat) => (
                  <div key={cat.category} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {cat.category}
                        </span>
                        <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  label,
  value,
  subtitle,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  icon: any;
  color: 'emerald' | 'red' | 'teal' | 'blue' | 'amber';
}) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    red: 'from-red-500 to-red-600 shadow-red-500/30',
    teal: 'from-teal-500 to-teal-600 shadow-teal-500/30',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'bg-gradient-to-br p-5 rounded-xl text-white shadow-lg',
        colorClasses[color]
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6" />
        {trend && (
          <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm opacity-90 mb-1">{label}</p>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
    </motion.div>
  );
}
