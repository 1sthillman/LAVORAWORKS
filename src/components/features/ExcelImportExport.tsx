/**
 * Excel Import/Export Component (Simplified)
 * Bu component artık direkt ProjectsView içinde kullanılıyor
 */

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface ExcelImportExportProps {
  onImport?: (data: any) => void;
  onExport?: () => void;
  acceptedFormats?: string;
  className?: string;
}

export function ExcelImportExport({
  onImport,
  onExport,
  acceptedFormats = '.xlsx,.xls',
  className = '',
}: ExcelImportExportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      onImport?.(file);
    } catch (err) {
      setError((err as Error).message || 'Dosya yüklenemedi');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportClick = () => {
    onExport?.();
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Import Button */}
      <label className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleFileChange}
          disabled={isLoading}
          className="sr-only"
        />
        <button
          type="button"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Yükleniyor...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Excel İçe Aktar</span>
            </>
          )}
        </button>
      </label>

      {/* Export Button */}
      {onExport && (
        <button
          type="button"
          onClick={handleExportClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Excel Dışa Aktar</span>
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Icon */}
      {!isLoading && !error && (
        <FileSpreadsheet className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );
}
