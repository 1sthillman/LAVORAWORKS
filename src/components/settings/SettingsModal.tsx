import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, settings, setSettings } = useAppStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ayarlar" size="md">
      <div className="space-y-6">
        {/* Theme */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Tema</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                theme === 'light'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              )}
            >
              <Sun className={cn('w-6 h-6', theme === 'light' ? 'text-primary-600' : 'text-gray-600')} />
              <span className={cn('text-sm font-bold', theme === 'light' ? 'text-primary-600' : 'text-gray-600')}>
                Aydınlık
              </span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                theme === 'dark'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              )}
            >
              <Moon className={cn('w-6 h-6', theme === 'dark' ? 'text-primary-600' : 'text-gray-600')} />
              <span className={cn('text-sm font-bold', theme === 'dark' ? 'text-primary-600' : 'text-gray-600')}>
                Karanlık
              </span>
            </button>

            <button
              onClick={() => {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                setTheme(systemTheme);
              }}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              )}
            >
              <Monitor className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-bold text-gray-600">
                Sistem
              </span>
            </button>
          </div>
        </div>

        {/* Language */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Dil</h3>
          <select
            className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-xl px-4 py-3 text-base font-semibold transition-all duration-150 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            value={settings.language}
            onChange={(e) => setSettings({ language: e.target.value as 'tr' | 'en' })}
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Para Birimi</h3>
          <select
            className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-xl px-4 py-3 text-base font-semibold transition-all duration-150 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
            value={settings.currency}
            onChange={(e) => setSettings({ currency: e.target.value })}
          >
            <option value="₺">₺ Türk Lirası</option>
            <option value="$">$ Dolar</option>
            <option value="€">€ Euro</option>
            <option value="£">£ Sterlin</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Bildirimler</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
              Önemli güncellemeleri al
            </p>
          </div>
          <button
            onClick={() => setSettings({ notifications: !settings.notifications })}
            className={cn(
              'relative w-12 h-7 rounded-full transition-colors',
              settings.notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform',
                settings.notifications ? 'left-6' : 'left-1'
              )}
            />
          </button>
        </div>

        {/* Auto Save */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Otomatik Kaydet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
              Değişiklikleri otomatik kaydet
            </p>
          </div>
          <button
            onClick={() => setSettings({ autoSave: !settings.autoSave })}
            className={cn(
              'relative w-12 h-7 rounded-full transition-colors',
              settings.autoSave ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform',
                settings.autoSave ? 'left-6' : 'left-1'
              )}
            />
          </button>
        </div>

        {/* App Info */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <p className="font-extrabold text-lg text-gray-900 dark:text-gray-100 mb-1">
              Lavora Workflow
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
              Versiyon 2.0.0
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © 2024 Lavora Design
            </p>
          </div>
        </div>

        {/* Close Button */}
        <Button variant="primary" className="w-full" onClick={onClose}>
          Tamam
        </Button>
      </div>
    </Modal>
  );
};
