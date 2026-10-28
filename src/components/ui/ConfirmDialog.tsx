import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  type = 'danger',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative w-full max-w-md bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl animate-slideUp">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          type === 'danger' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
        }`}>
          <AlertTriangle className={`w-6 h-6 ${
            type === 'danger' ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>
        
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 font-semibold mb-6">
          {message}
        </p>
        
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="flex-1"
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
