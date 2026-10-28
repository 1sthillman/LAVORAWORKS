import React from 'react';
import type { Project } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PrintViewProps {
  project: Project;
}

export const PrintView: React.FC<PrintViewProps> = ({ project }) => {
  return (
    <div id="print-view" className="hidden print:block p-8 bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-primary-600 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">{project.name}</h1>
          <p className="text-sm text-gray-600">{project.client}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Lavora Design</p>
          <p className="text-xs text-gray-600">Proje Raporu</p>
          <p className="text-xs text-gray-600">{formatDate(new Date().toISOString(), 'short')}</p>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs font-bold text-gray-600 mb-1">Başlangıç Tarihi</p>
          <p className="font-semibold">{formatDate(project.startDate, 'short')}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-600 mb-1">Bitiş Tarihi</p>
          <p className="font-semibold">{project.dueDate ? formatDate(project.dueDate, 'short') : 'Belirsiz'}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-600 mb-1">Durum</p>
          <p className="font-semibold">
            {project.status === 'active' && 'Aktif'}
            {project.status === 'completed' && 'Tamamlandı'}
            {project.status === 'paused' && 'Beklemede'}
            {project.status === 'cancelled' && 'İptal'}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-600 mb-1">İlerleme</p>
          <p className="font-semibold">{project.progress}%</p>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">Açıklama</p>
          <p className="text-sm">{project.description}</p>
        </div>
      )}

      {/* Financial Summary */}
      <div className="border-t-2 border-gray-200 pt-4">
        <h2 className="text-lg font-bold mb-4">Finansal Özet</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold">Toplam Tutar:</span>
            <span className="font-bold">{formatCurrency(project.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Ödenen:</span>
            <span className="font-bold text-green-600">{formatCurrency(project.paidAmount)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-primary-600 pt-2 mt-2">
            <span className="font-bold">Kalan:</span>
            <span className="font-extrabold text-primary-600">{formatCurrency(project.totalAmount - project.paidAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add print styles
export const printStyles = `
@media print {
  body > *:not(#print-view) {
    display: none !important;
  }
  
  #print-view {
    display: block !important;
  }
  
  @page {
    margin: 15mm;
    size: A4;
  }
}
`;
