/**
 * Modern Project Card Component
 * HTML v17'den daha güzel ve özellik dolu
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  Pause,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import type { Project } from '@/types';
import { formatCurrency, formatDateTR } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
  onExportPDF?: (project: Project) => void;
  onExportExcel?: (project: Project) => void;
  className?: string;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onViewDetails,
  onExportPDF,
  onExportExcel,
  className,
}: ProjectCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = {
    active: {
      icon: TrendingUp,
      label: 'Aktif',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    completed: {
      icon: CheckCircle2,
      label: 'Tamamlandı',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
    },
    paused: {
      icon: Pause,
      label: 'Beklemede',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
    },
    cancelled: {
      icon: XCircle,
      label: 'İptal',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
    },
  };

  const priorityConfig = {
    low: { color: 'bg-gray-400', label: 'Düşük' },
    normal: { color: 'bg-blue-500', label: 'Normal' },
    high: { color: 'bg-orange-500', label: 'Yüksek' },
  };

  const status = statusConfig[project.status];
  const StatusIcon = status.icon;
  const priority = project.priority ? priorityConfig[project.priority] : null;
  
  const remainingAmount = project.totalAmount - project.paidAmount;
  const paymentProgress = project.totalAmount > 0 ? (project.paidAmount / project.totalAmount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-2xl overflow-hidden cursor-pointer',
        'transition-all duration-300',
        'hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50',
        className
      )}
      onClick={() => onViewDetails?.(project)}
    >
      {/* Priority indicator */}
      {priority && (
        <div className={cn('absolute top-0 left-0 w-1 h-full', priority.color)} />
      )}

      {/* Card Header */}
      <div className="relative p-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <motion.div
            className="relative flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center',
                'text-white font-bold text-lg shadow-lg',
                'bg-gradient-to-br from-teal-500 to-teal-600',
                'dark:from-teal-600 dark:to-teal-700'
              )}
              style={{
                background: project.color
                  ? `linear-gradient(135deg, ${project.color}, ${project.color}dd)`
                  : undefined,
              }}
            >
              {project.avatar || '?'}
            </div>
            
            {/* Status badge on avatar */}
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full',
                'border-2 border-white dark:border-gray-800',
                'flex items-center justify-center',
                status.bg
              )}
            >
              <StatusIcon className={cn('w-3 h-3', status.color)} />
            </div>
          </motion.div>

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {project.name}
              </h3>
              
              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'absolute right-0 top-full mt-2 z-10',
                        'bg-white dark:bg-gray-800',
                        'border border-gray-200 dark:border-gray-700',
                        'rounded-xl shadow-xl overflow-hidden',
                        'min-w-[180px]'
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionButton
                        icon={Edit}
                        label="Düzenle"
                        onClick={() => {
                          setShowActions(false);
                          onEdit?.(project);
                        }}
                      />
                      <ActionButton
                        icon={FileText}
                        label="PDF İndir"
                        onClick={() => {
                          setShowActions(false);
                          onExportPDF?.(project);
                        }}
                      />
                      <ActionButton
                        icon={Download}
                        label="Excel İndir"
                        onClick={() => {
                          setShowActions(false);
                          onExportExcel?.(project);
                        }}
                      />
                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                      <ActionButton
                        icon={Trash2}
                        label="Sil"
                        onClick={() => {
                          setShowActions(false);
                          onDelete?.(project);
                        }}
                        danger
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
              {project.client}
            </p>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1',
                  'text-xs font-semibold rounded-lg',
                  status.bg,
                  status.color,
                  status.border,
                  'border'
                )}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>

              {priority && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {priority.label} Öncelik
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Body - Financial Info */}
      <div className="px-5 pb-4 space-y-3">
        {/* Amount Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Toplam Tutar</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {formatCurrency(project.totalAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Kalan</p>
            <p className={cn(
              'text-lg font-semibold',
              remainingAmount > 0 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-emerald-600 dark:text-emerald-400'
            )}>
              {formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>

        {/* Payment Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-400">Ödeme Durumu</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {Math.round(paymentProgress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${paymentProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                paymentProgress === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-r from-teal-500 to-teal-600'
              )}
            />
          </div>
        </div>

        {/* Project Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-400">İlerleme</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {project.progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Card Footer - Dates */}
      <div
        className={cn(
          'px-5 py-3 border-t border-gray-100 dark:border-gray-700',
          'bg-gray-50 dark:bg-gray-800/50'
        )}
      >
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateTR(project.startDate, true)}</span>
          </div>
          {project.dueDate && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Bitiş: {formatDateTR(project.dueDate, true)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect - External Link */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-3 right-3 pointer-events-auto">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  'bg-teal-500 text-white shadow-lg',
                  'transform transition-transform hover:scale-110'
                )}
              >
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Action Button Component
function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5',
        'text-sm font-medium text-left',
        'transition-colors',
        danger
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
