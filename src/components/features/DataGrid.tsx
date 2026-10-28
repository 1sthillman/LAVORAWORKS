import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Trash2, X, Calculator } from 'lucide-react';
import { Button } from '../ui/Button';

export interface GridColumn {
  id: string;
  header: string;
  type?: 'text' | 'number' | 'currency' | 'date';
  width?: number;
  isPrice?: boolean; // Fiyat sütunu (yeşil highlight)
}

export interface GridRow {
  id: string;
  cells: { [columnId: string]: any };
}

interface DataGridProps {
  columns: GridColumn[];
  rows: GridRow[];
  onChange?: (rows: GridRow[]) => void;
  onColumnChange?: (columns: GridColumn[]) => void;
  editable?: boolean;
  showRowNumbers?: boolean;
  autoCalculateVAT?: boolean;
  className?: string;
}

export const DataGrid: React.FC<DataGridProps> = ({
  columns: initialColumns,
  rows: initialRows,
  onChange,
  onColumnChange,
  editable = true,
  showRowNumbers = true,
  autoCalculateVAT = false,
  className = '',
}) => {
  const [columns, setColumns] = useState<GridColumn[]>(initialColumns);
  const [rows, setRows] = useState<GridRow[]>(initialRows);
  const [selectedCell, setSelectedCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Props değiştiğinde state'i güncelle
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  // Düzenleme moduna gir
  const startEditing = useCallback(
    (rowId: string, columnId: string) => {
      if (!editable) return;
      setEditingCell({ rowId, columnId });
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [editable]
  );

  // Hücre değerini güncelle
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: any) => {
      const newRows = rows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            cells: {
              ...row.cells,
              [columnId]: value,
            },
          };
        }
        return row;
      });

      setRows(newRows);
      onChange?.(newRows);
      setEditingCell(null);
    },
    [rows, onChange]
  );

  // Yeni satır ekle
  const addRow = useCallback(() => {
    const newRow: GridRow = {
      id: `row-${Date.now()}`,
      cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
    };
    const newRows = [...rows, newRow];
    setRows(newRows);
    onChange?.(newRows);
  }, [rows, columns, onChange]);

  // Satır sil
  const deleteRow = useCallback(
    (rowId: string) => {
      const newRows = rows.filter((row) => row.id !== rowId);
      setRows(newRows);
      onChange?.(newRows);
    },
    [rows, onChange]
  );

  // Yeni sütun ekle
  const addColumn = useCallback(() => {
    const newColumn: GridColumn = {
      id: `col-${Date.now()}`,
      header: `Sütun ${columns.length + 1}`,
      type: 'text',
    };
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    onColumnChange?.(newColumns);
  }, [columns, onColumnChange]);

  // Sütun sil
  const deleteColumn = useCallback(
    (columnId: string) => {
      const newColumns = columns.filter((col) => col.id !== columnId);
      setColumns(newColumns);
      onColumnChange?.(newColumns);

      // Satırlardaki hücreleri de güncelle
      const newRows = rows.map((row) => {
        const { [columnId]: _, ...cells } = row.cells;
        return { ...row, cells };
      });
      setRows(newRows);
      onChange?.(newRows);
    },
    [columns, rows, onColumnChange, onChange]
  );

  // Hücre formatla
  const formatCell = (value: any, column: GridColumn): string => {
    if (value === null || value === undefined || value === '') return '';

    switch (column.type) {
      case 'number':
        return typeof value === 'number'
          ? value.toString()
          : value;
      case 'currency':
        const num = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(num)
          ? value
          : new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            }).format(num);
      case 'date':
        try {
          return new Date(value).toLocaleDateString('tr-TR');
        } catch {
          return value;
        }
      default:
        return String(value);
    }
  };

  // Klavye navigasyonu
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowId: string, columnId: string) => {
      const rowIndex = rows.findIndex((r) => r.id === rowId);
      const colIndex = columns.findIndex((c) => c.id === columnId);

      switch (e.key) {
        case 'Enter':
          if (editingCell) {
            setEditingCell(null);
          } else {
            startEditing(rowId, columnId);
          }
          e.preventDefault();
          break;
        case 'Tab':
          if (colIndex < columns.length - 1) {
            setSelectedCell({
              rowId,
              columnId: columns[colIndex + 1].id,
            });
          } else if (rowIndex < rows.length - 1) {
            setSelectedCell({
              rowId: rows[rowIndex + 1].id,
              columnId: columns[0].id,
            });
          }
          e.preventDefault();
          break;
        case 'ArrowUp':
          if (rowIndex > 0) {
            setSelectedCell({
              rowId: rows[rowIndex - 1].id,
              columnId,
            });
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
          if (rowIndex < rows.length - 1) {
            setSelectedCell({
              rowId: rows[rowIndex + 1].id,
              columnId,
            });
          }
          e.preventDefault();
          break;
        case 'ArrowLeft':
          if (colIndex > 0) {
            setSelectedCell({
              rowId,
              columnId: columns[colIndex - 1].id,
            });
          }
          e.preventDefault();
          break;
        case 'ArrowRight':
          if (colIndex < columns.length - 1) {
            setSelectedCell({
              rowId,
              columnId: columns[colIndex + 1].id,
            });
          }
          e.preventDefault();
          break;
        case 'Delete':
        case 'Backspace':
          if (!editingCell) {
            updateCell(rowId, columnId, '');
            e.preventDefault();
          }
          break;
      }
    },
    [rows, columns, editingCell, startEditing, updateCell]
  );

  // Toplam hesapla
  const calculateTotal = (columnId: string): number => {
    return rows.reduce((sum, row) => {
      const value = parseFloat(row.cells[columnId]) || 0;
      return sum + value;
    }, 0);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Toolbar */}
      {editable && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={addRow} variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Satır Ekle
          </Button>
          <Button onClick={addColumn} variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Sütun Ekle
          </Button>
          {autoCalculateVAT && (
            <Button variant="secondary" size="sm">
              <Calculator className="w-4 h-4 mr-2" />
              KDV Hesapla
            </Button>
          )}
        </div>
      )}

      {/* Grid Container */}
      <div
        ref={gridRef}
        className="border border-surface-300 dark:border-surface-700 rounded-xl overflow-auto bg-white dark:bg-surface-900 shadow-lg"
        style={{ maxHeight: '70vh' }}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-primary-600 dark:bg-primary-700 text-white">
              {showRowNumbers && (
                <th className="w-12 px-3 py-3 text-center font-semibold text-sm border-r border-primary-500">
                  #
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-4 py-3 text-left font-semibold text-sm border-r border-primary-500 min-w-[150px] ${
                    column.isPrice ? 'bg-success-500 dark:bg-success-600' : ''
                  }`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{column.header}</span>
                    {editable && columns.length > 1 && (
                      <button
                        onClick={() => deleteColumn(column.id)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Sütunu Sil"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {editable && (
                <th className="w-16 px-3 py-3 text-center font-semibold text-sm">
                  İşlem
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className="border-b border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                {showRowNumbers && (
                  <td className="px-3 py-2 text-center text-sm text-muted bg-surface-100 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700">
                    {rowIndex + 1}
                  </td>
                )}
                {columns.map((column) => {
                  const isEditing =
                    editingCell?.rowId === row.id &&
                    editingCell?.columnId === column.id;
                  const isSelected =
                    selectedCell?.rowId === row.id &&
                    selectedCell?.columnId === column.id;
                  const cellValue = row.cells[column.id];

                  return (
                    <td
                      key={column.id}
                      className={`px-4 py-2 border-r border-surface-200 dark:border-surface-700 cursor-cell ${
                        isSelected
                          ? 'ring-2 ring-primary-500 ring-inset'
                          : ''
                      } ${column.isPrice ? 'bg-success-50 dark:bg-success-950' : ''}`}
                      onClick={() => {
                        setSelectedCell({
                          rowId: row.id,
                          columnId: column.id,
                        });
                      }}
                      onDoubleClick={() => startEditing(row.id, column.id)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type={
                            column.type === 'number' ||
                            column.type === 'currency'
                              ? 'number'
                              : 'text'
                          }
                          defaultValue={cellValue}
                          onBlur={(e) =>
                            updateCell(row.id, column.id, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateCell(row.id, column.id, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          className="w-full bg-transparent border-0 outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                        />
                      ) : (
                        <div
                          className={`min-h-[32px] flex items-center ${
                            column.type === 'number' || column.type === 'currency'
                              ? 'justify-end font-mono'
                              : ''
                          } ${
                            column.isPrice
                              ? 'font-bold text-success-700 dark:text-success-300'
                              : ''
                          }`}
                          onKeyDown={(e) => handleKeyDown(e, row.id, column.id)}
                          tabIndex={0}
                        >
                          {formatCell(cellValue, column)}
                        </div>
                      )}
                    </td>
                  );
                })}
                {editable && (
                  <td className="px-3 py-2 text-center border-r border-surface-200 dark:border-surface-700">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="p-1.5 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 rounded transition-colors"
                      title="Satırı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {/* Footer (Toplamlar) */}
          <tfoot className="sticky bottom-0 bg-surface-100 dark:bg-surface-800 border-t-2 border-surface-300 dark:border-surface-600">
            <tr>
              {showRowNumbers && (
                <td className="px-3 py-3 text-center font-bold text-sm"></td>
              )}
              {columns.map((column) => (
                <td
                  key={column.id}
                  className="px-4 py-3 border-r border-surface-200 dark:border-surface-700"
                >
                  {(column.type === 'number' || column.type === 'currency') && (
                    <div className="text-right font-bold font-mono">
                      {column.type === 'currency'
                        ? formatCell(calculateTotal(column.id), column)
                        : calculateTotal(column.id).toFixed(2)}
                    </div>
                  )}
                </td>
              ))}
              {editable && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Info */}
      <div className="text-sm text-muted flex items-center gap-4">
        <span>{rows.length} satır × {columns.length} sütun</span>
        {editable && (
          <span className="text-xs">
            İpucu: Hücreye çift tıkla veya Enter'a bas
          </span>
        )}
      </div>
    </div>
  );
};
