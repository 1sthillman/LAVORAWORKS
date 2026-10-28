/**
 * Dashboard Statistics Component
 * Özet istatistikler ve grafikler
 */

import { motion } from 'framer-motion';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useLedgerStore } from '@/store/useLedgerStore';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export function DashboardStats() {
  // Selector functions to prevent re-rendering
  const projectStats = useProjectStore((state) => {
    const projects = state.projects;
    const active = projects.filter((p) => p.status === 'active').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const totalRevenue = projects.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = projects.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalUnpaid = totalRevenue - totalPaid;
    const averageProgress =
      projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0;

    return {
      total: projects.length,
      active,
      completed,
      totalRevenue,
      totalPaid,
      totalUnpaid,
      averageProgress: Math.round(averageProgress),
    };
  });

  const workflowStats = useWorkflowStore((state) => {
    const items = state.workflows || []; // Correct property name
    return {
      total: items.length,
      inProgress: items.filter((i) => i.status === 'in-progress').length,
      completed: items.filter((i) => i.status === 'completed').length,
      pending: items.filter((i) => i.status === 'pending').length,
      cancelled: items.filter((i) => i.status === 'cancelled').length,
      urgent: items.filter((i) => i.priority === 'urgent').length,
      overdue: 0,
    };
  });

  const ledgerStats = useLedgerStore((state) => {
    const entries = state.entries || []; // Add fallback
    const totalIncome = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    const thisMonth = new Date();
    const thisMonthEntries = entries.filter((e) => {
      const entryDate = new Date(e.date);
      return (
        entryDate.getMonth() === thisMonth.getMonth() &&
        entryDate.getFullYear() === thisMonth.getFullYear()
      );
    });

    const thisMonthIncome = thisMonthEntries
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netProfit,
      thisMonthIncome,
    };
  });

  const stats = [
    {
      label: 'Toplam Projeler',
      value: projectStats.total.toString(),
      change: '+12%',
      trend: 'up',
      icon: Briefcase,
      color: 'blue',
      subtitle: `${projectStats.active} aktif`,
    },
    {
      label: 'Toplam Gelir',
      value: formatCurrency(ledgerStats.totalIncome),
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald',
      subtitle: 'Bu ay',
    },
    {
      label: 'Aktif İşler',
      value: workflowStats.inProgress.toString(),
      change: '-5%',
      trend: 'down',
      icon: TrendingUp,
      color: 'purple',
      subtitle: `${workflowStats.urgent} acil`,
    },
    {
      label: 'Net Kâr',
      value: formatCurrency(ledgerStats.netProfit),
      change: '+18%',
      trend: 'up',
      icon: TrendingUp,
      color: 'teal',
      subtitle: 'Genel',
    },
  ];

  const quickStats = [
    {
      label: 'Tamamlanan',
      value: projectStats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Bekleyen',
      value: workflowStats.pending,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Geciken',
      value: workflowStats.overdue,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      label: 'Bu Ay',
      value: Math.round(ledgerStats.thisMonthIncome / 1000) + 'K',
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            emerald: 'from-emerald-500 to-emerald-600',
            purple: 'from-purple-500 to-purple-600',
            teal: 'from-teal-500 to-teal-600',
          }[stat.color];

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={cn(
                'relative overflow-hidden',
                'bg-gradient-to-br p-6 rounded-2xl',
                'text-white shadow-xl',
                colorClasses
              )}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white rounded-full" />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm opacity-90 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs opacity-75">{stat.subtitle}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className={cn(
                'flex items-center gap-3 p-4',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'rounded-xl',
                'hover:shadow-lg hover:border-teal-500',
                'transition-all duration-200'
              )}
            >
              <div className={cn('p-2.5 rounded-lg', stat.bg)}>
                <Icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className={cn(
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-2xl p-6'
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Proje İlerlemesi
            </h3>
          </div>

          <div className="space-y-4">
            <ProgressBar
              label="Tamamlanma Oranı"
              value={projectStats.averageProgress}
              color="teal"
            />
            <ProgressBar
              label="Ödeme Oranı"
              value={Math.round((projectStats.totalPaid / projectStats.totalRevenue) * 100)}
              color="emerald"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Toplam Gelir</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(projectStats.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">Ödenen</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(projectStats.totalPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">Kalan</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(projectStats.totalUnpaid)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Workflow Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className={cn(
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-2xl p-6'
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              İş Akışı Durumu
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatusCard
              label="Devam Ediyor"
              value={workflowStats.inProgress}
              total={workflowStats.total}
              color="blue"
            />
            <StatusCard
              label="Tamamlandı"
              value={workflowStats.completed}
              total={workflowStats.total}
              color="emerald"
            />
            <StatusCard
              label="Beklemede"
              value={workflowStats.pending}
              total={workflowStats.total}
              color="amber"
            />
            <StatusCard
              label="İptal"
              value={workflowStats.cancelled}
              total={workflowStats.total}
              color="red"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'teal' | 'emerald';
}) {
  const colorClasses = {
    teal: 'from-teal-500 to-teal-600',
    emerald: 'from-emerald-500 to-emerald-600',
  }[color];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {value}%
        </span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', colorClasses)}
        />
      </div>
    </div>
  );
}

// Status Card Component
function StatusCard({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: 'blue' | 'emerald' | 'amber' | 'red';
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
  }[color];

  return (
    <div className={cn('p-4 rounded-xl', colorClasses)}>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs font-semibold mb-2">{label}</p>
      <p className="text-xs opacity-75">{percentage}% toplam</p>
    </div>
  );
}
