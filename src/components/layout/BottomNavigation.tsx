/**
 * Bottom Navigation - Mobile-First Design
 * HTML v17'deki dock navigation'ın modern versiyonu
 */

import { motion } from 'framer-motion';
import {
  FolderOpen,
  ListTodo,
  Camera,
  BookOpen,
  Download,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ViewMode } from '@/types';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const { currentView, setCurrentView, setActiveModal } = useAppStore();

  const navItems: Array<{
    id: ViewMode | 'photo';
    label: string;
    icon: any;
    isCenter?: boolean;
  }> = [
    { id: 'projects', label: 'Projeler', icon: FolderOpen },
    { id: 'workflow', label: 'İş Akışı', icon: ListTodo },
    { id: 'photo', label: 'Fotoğraf', icon: Camera, isCenter: true },
    { id: 'ledger', label: 'Defter', icon: BookOpen },
    { id: 'files', label: 'Dosya', icon: Download },
  ];

  const handleNavClick = (id: ViewMode | 'photo') => {
    if (id === 'photo') {
      setActiveModal('photo-capture');
    } else {
      setCurrentView(id);
    }
  };

  return (
    <>
      {/* Desktop/Tablet - Top Navigation (Hidden on Mobile) */}
      <nav className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1">
            {navItems.filter(item => !item.isCenter).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-3',
                    'font-semibold text-sm transition-colors',
                    'rounded-t-xl',
                    isActive
                      ? 'text-teal-600 dark:text-teal-400 bg-gray-50 dark:bg-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
            
            {/* Photo Button - Always visible on desktop */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick('photo')}
              className={cn(
                'ml-auto flex items-center gap-2 px-4 py-2',
                'bg-gradient-to-r from-teal-500 to-teal-600',
                'text-white rounded-xl font-semibold text-sm',
                'shadow-lg shadow-teal-500/30',
                'hover:shadow-xl hover:shadow-teal-500/40',
                'transition-all'
              )}
            >
              <Camera className="w-5 h-5" />
              <span>Fotoğraftan Tablo</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile - Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={cn(
          'md:hidden',
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white/80 dark:bg-gray-800/80',
          'backdrop-blur-xl backdrop-saturate-150',
          'border-t border-gray-200/50 dark:border-gray-700/50',
          'shadow-2xl',
          'safe-area-inset-bottom'
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isCenter = item.isCenter;

            if (isCenter) {
              // Center photo button - Floating
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'relative -mt-8',
                    'w-16 h-16 rounded-2xl',
                    'bg-gradient-to-br from-teal-500 to-teal-600',
                    'text-white shadow-2xl shadow-teal-500/50',
                    'flex items-center justify-center',
                    'border-4 border-white dark:border-gray-900',
                    'transform transition-all duration-300',
                    'hover:shadow-teal-500/60'
                  )}
                >
                  <Icon className="w-7 h-7" />
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.button>
              );
            }

            // Regular nav items
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'relative flex flex-col items-center gap-1',
                  'px-4 py-2 rounded-xl',
                  'transition-all duration-200',
                  isActive
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <div
                  className={cn(
                    'relative p-2 rounded-xl transition-all',
                    isActive && 'bg-teal-50 dark:bg-teal-950/30'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileTab"
                      className="absolute inset-0 bg-teal-500/10 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold whitespace-nowrap',
                    'transition-all'
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 dark:bg-teal-400 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      {/* Safe area spacer for mobile */}
      <div className="md:hidden h-20" style={{ height: 'calc(5rem + env(safe-area-inset-bottom))' }} />
    </>
  );
}
