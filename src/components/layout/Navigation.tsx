import React from 'react';
import { Folder, ListChecks, Camera, BookOpen, Download } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ViewMode } from '@/types';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'projects' as ViewMode, label: 'Projeler', icon: Folder },
  { id: 'workflow' as ViewMode, label: 'İş Akışı', icon: ListChecks },
  { id: 'ledger' as ViewMode, label: 'Defter', icon: BookOpen },
  { id: 'files' as ViewMode, label: 'Dosyalar', icon: Download },
];

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, setActiveModal } = useAppStore();

  return (
    <nav className="fixed left-3 right-3 bottom-3 max-w-[540px] mx-auto z-30 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[28px] shadow-2xl">
      <div className="grid grid-cols-5 items-center gap-1 p-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={cn(
              'flex flex-col items-center gap-1 px-2 py-2.5 rounded-2xl text-[10.5px] font-bold transition-all duration-200',
              currentView === id
                ? 'text-primary-600 dark:text-primary-400 bg-primary-600/10'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}

        {/* Photo Capture Button (Center) */}
        <button
          onClick={() => setActiveModal('photo-capture')}
          className="w-[50px] h-[46px] bg-primary-600 hover:bg-primary-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30 transition-all active:scale-95 -my-2"
          title="Fotoğraftan Tablo"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
