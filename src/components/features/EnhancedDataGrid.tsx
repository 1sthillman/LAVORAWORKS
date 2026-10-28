/**
 * Enhanced DataGrid Component
 * Excel benzeri tam özellikli tablo editörü
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Copy,
  Calculator,
  Sparkles,
  Save,
} from 'lucide-react';
import { formatNumber, parseNumber, detectTableColumns } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface EnhancedDataGridProps {
  headers: string[];
  rows: string[][];
  onDataChange?: (headers: string[], rows: string[][]) => void;
  onSave?: (headers: string[], rows: string[][]) => void;
  editable?: boolean;
  showStats?: boolean;
  className?: string;
}

export function EnhancedDataGrid({
  headers: initialHeaders,
  rows: initialRows,
  onDataChange,
  onSave,
  editable = true,
  showStats = true,
  className,
}: EnhancedDataGridProps) {
  const [headers, setHeaders] = useState(initialHeaders);
  const [rows, setRows] = useState(initialRows);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Otomatik kolon tespiti
  const detectedColumns = detectTableColumns(headers);
  const hasAutoCalc = detectedColumns.hasAutoCalc;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !editable) return;

      const { row, col } = selectedCell;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (row > 0) setSelectedCell({ row: row - 1, col });
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (row < rows.length - 1) setSelectedCell({ row: row + 1, col });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (col > 0) setSelectedCell({ row, col: col - 1 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (col < headers.length - 1) setSelectedCell({ row, col: col + 1 });
          break;
        case 'Enter':
          e.preventDefault();
          if (row < rows.length - 1) {
            setSelectedCell({ row: row + 1, col });
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();
          handleCellChange(row, col, '');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, rows, headers, editable]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;

    // Otomatik hesaplama (Miktar x Fiyat = Toplam)
    if (hasAutoCalc && (colIndex === detectedColumns.quantity || colIndex === detectedColumns.price)) {
      const qty = parseNumber(newRows[rowIndex][detectedColumns.quantity!]);
      const price = parseNumber(newRows[rowIndex][detectedColumns.price!]);
      if (detectedColumns.total !== undefined) {
        newRows[rowIndex][detectedColumns.total] = formatNumber(qty * price);
      }
    }

    setRows(newRows);
    onDataChange?.(headers, newRows);
  };

  const handleHeaderChange = (colIndex: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    setHeaders(newHeaders);
    onDataChange?.(newHeaders, rows);
  };

  const addRow = () => {
    const newRow = Array(headers.length).fill('');
    const newRows = [...rows, newRow];
    setRows(newRows);
    onDataChange?.(headers, newRows);
  };

  const deleteRow = (rowIndex: number) => {
    const newRows = rows.filter((_, i) => i !== rowIndex);
    setRows(newRows);
    onDataChange?.(headers, newRows);
    if (selectedCell?.row === rowIndex) {
      setSelectedCell(null);
    }
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Sütun ${headers.length + 1}`];
    const newRows = rows.map(row => [...row, '']);
    setHeaders(newHeaders);
    setRows(newRows);
    onDataChange?.(newHeaders, newRows);
  };

  const deleteColumn = (colIndex: number) => {
    const newHeaders = headers.filter((_, i) => i !== colIndex);
    const newRows = rows.map(row => row.filter((_, i) => i !== colIndex));
    setHeaders(newHeaders);
    setRows(newRows);
    onDataChange?.(newHeaders, newRows);
    if (selectedCell?.col === colIndex) {
      setSelectedCell(null);
    }
  };

  const copyCell = () => {
    if (selectedCell) {
      const value = rows[selectedCell.row][selectedCell.col];
      navigator.clipboard.writeText(value);
    }
  };

  // İstatistikler - Toplam tutar
  const getTotalAmount = () => {
    if (!detectedColumns.total) return 0;
    return rows.reduce((sum, row) => sum + parseNumber(row[detectedColumns.total!]), 0);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Gelişmiş Tablo Editörü</h3>
          {hasAutoCalc && (
            <span className="px-2 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 text-xs font-semibold rounded-lg">
              <Calculator className="w-3 h-3 inline mr-1" />
              Otomatik Hesaplama
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {editable && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addRow}
                className={cn(
                  'flex items-center gap-2 px-3 py-2',
                  'bg-teal-50 dark:bg-teal-950/30',
                  'text-teal-600 dark:text-teal-400',
                  'rounded-lg font-semibold text-sm',
                  'hover:bg-teal-100 dark:hover:bg-teal-950/50',
                  'transition-colors'
                )}
              >
                <Plus className="w-4 h-4" />
                Satır Ekle
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addColumn}
                className={cn(
                  'flex items-center gap-2 px-3 py-2',
                  'bg-blue-50 dark:bg-blue-950/30',
                  'text-blue-600 dark:text-blue-400',
                  'rounded-lg font-semibold text-sm',
                  'hover:bg-blue-100 dark:hover:bg-blue-950/50',
                  'transition-colors'
                )}
              >
                <Plus className="w-4 h-4" />
                Sütun Ekle
              </motion.button>
            </>
          )}

          {selectedCell && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyCell}
                className={cn(
                  'p-2 rounded-lg',
                  'text-gray-600 dark:text-gray-400',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'transition-colors'
                )}
                title="Kopyala (Ctrl+C)"
              >
                <Copy className="w-4 h-4" />
              </motion.button>
            </>
          )}

          {onSave && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave(headers, rows)}
              className={cn(
                'flex items-center gap-2 px-4 py-2',
                'bg-gradient-to-r from-teal-500 to-teal-600',
                'text-white rounded-lg font-semibold text-sm',
                'shadow-lg shadow-teal-500/30',
                'hover:shadow-xl hover:shadow-teal-500/40',
                'transition-all'
              )}
            >
              <Save className="w-4 h-4" />
              Kaydet
            </motion.button>
          )}
        </div>
      </div>

      {/* Table */}
      <div ref={gridRef} className="overflow-auto flex-1 bg-gray-50 dark:bg-gray-900">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 w-12 bg-gray-100 dark:bg-gray-800 border-b-2 border-r-2 border-gray-300 dark:border-gray-600">
                <div className="p-2 text-center text-xs font-bold text-gray-500">#</div>
              </th>
              {headers.map((header, colIndex) => (
                <th
                  key={colIndex}
                  className="sticky top-0 z-10 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-300 dark:border-gray-600"
                >
                  <div className="flex items-center gap-2 p-2 min-w-[150px]">
                    {editable ? (
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                        className={cn(
                          'flex-1 px-2 py-1',
                          'bg-white dark:bg-gray-800',
                          'border border-gray-200 dark:border-gray-700',
                          'rounded text-sm font-bold',
                          'focus:outline-none focus:ring-2 focus:ring-teal-500'
                        )}
                      />
                    ) : (
                      <span className="flex-1 text-sm font-bold text-gray-900 dark:text-white">
                        {header}
                      </span>
                    )}
                    {editable && (
                      <button
                        onClick={() => deleteColumn(colIndex)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-white dark:hover:bg-gray-800/50 transition-colors">
                <td className="sticky left-0 z-10 bg-gray-100 dark:bg-gray-800 border-r-2 border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-xs font-bold text-gray-500">{rowIndex + 1}</span>
                    {editable && (
                      <button
                        onClick={() => deleteRow(rowIndex)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
                {row.map((cell, colIndex) => {
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isPriceColumn = detectedColumns.price === colIndex || detectedColumns.total === colIndex;
                  
                  return (
                    <td
                      key={colIndex}
                      onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                      className={cn(
                        'border-b border-r border-gray-200 dark:border-gray-700',
                        'transition-all',
                        isSelected && 'ring-2 ring-teal-500 ring-inset'
                      )}
                    >
                      {editable ? (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                          className={cn(
                            'w-full px-3 py-2',
                            'bg-transparent',
                            'text-sm',
                            'focus:outline-none',
                            isPriceColumn && 'text-right font-semibold text-teal-600 dark:text-teal-400',
                            isSelected && 'bg-teal-50 dark:bg-teal-950/20'
                          )}
                        />
                      ) : (
                        <div
                          className={cn(
                            'px-3 py-2 text-sm',
                            isPriceColumn && 'text-right font-semibold text-teal-600 dark:text-teal-400'
                          )}
                        >
                          {cell}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats Footer */}
      {showStats && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Satır: </span>
                <span className="font-bold text-gray-900 dark:text-white">{rows.length}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Sütun: </span>
                <span className="font-bold text-gray-900 dark:text-white">{headers.length}</span>
              </div>
              {selectedCell && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Seçili: </span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {String.fromCharCode(65 + selectedCell.col)}{selectedCell.row + 1}
                  </span>
                </div>
              )}
            </div>

            {detectedColumns.total !== undefined && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Genel Toplam:</span>
                <motion.span
                  key={getTotalAmount()}
                  initial={{ scale: 1.2, color: '#10b981' }}
                  animate={{ scale: 1, color: undefined }}
                  className="text-2xl font-bold text-teal-600 dark:text-teal-400"
                >
                  {formatNumber(getTotalAmount(), 2)}
                </motion.span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
