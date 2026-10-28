/**
 * Tablo Düzenleme Modal - HTML v17 stili tam özellikli
 * - Inline düzenleme (contenteditable)
 * - Satır ekleme/silme
 * - Sütun ekleme/silme
 * - Otomatik hesaplama (Miktar × Fiyat = Toplam)
 * - Tablo/Kart görünümü geçişi
 * - Excel ve PDF dışa aktarma
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Save,
  Grid3x3,
  LayoutList,
  FileSpreadsheet,
  FileText,
  Search,
} from 'lucide-react';
import type { Project } from '@/types';
import { formatCurrency, parseNumber } from '@/utils/formatters';
import { excelService } from '@/services/excel.service';
import { printService } from '@/services/print.service';
import { db } from '@/lib/db';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';

interface TableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

type ViewMode = 'grid' | 'cards';

export function TableEditorModal({ isOpen, onClose, project }: TableEditorModalProps) {
  const { updateProject } = useProjectStore();
  const { addToast } = useAppStore();

  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  // Mobilde default card view, desktop'ta grid view
  const [viewMode, setViewMode] = useState<ViewMode>(() => 
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'grid'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [localProject, setLocalProject] = useState<Project | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (project) {
      setLocalProject(JSON.parse(JSON.stringify(project)));
      setActiveSheetIndex(0);
      setSearchQuery('');
      setHasChanges(false);
    }
  }, [project]);

  if (!localProject || !localProject.tableData) return null;

  const activeSheet = localProject.tableData[activeSheetIndex];
  if (!activeSheet) return null;

  // Filtreleme
  const filteredRows = activeSheet.rows.filter((row) =>
    searchQuery
      ? row.some((cell) => String(cell).toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  // Hücre güncelleme
  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    if (!localProject.tableData) return;

    const updated = { ...localProject };
    updated.tableData![activeSheetIndex].rows[rowIndex][cellIndex] = value;

    // Otomatik hesaplama: Miktar × Fiyat = Toplam
    const colInfo = activeSheet.columnInfo;
    if (colInfo?.hasAutoCalc) {
      const row = updated.tableData![activeSheetIndex].rows[rowIndex];
      const qty = parseNumber(row[colInfo.quantityCol]);
      const price = parseNumber(row[colInfo.priceCol]);
      row[colInfo.totalCol] = qty * price;
    }

    // Toplam tutarı güncelle
    if (colInfo?.totalCol !== undefined) {
      updated.totalAmount = updated.tableData!.reduce(
        (sum, sheet) =>
          sum +
          sheet.rows.reduce(
            (sheetSum, row) => sheetSum + parseNumber(row[colInfo.totalCol]),
            0
          ),
        0
      );
    }

    setLocalProject(updated);
    setHasChanges(true);
  };

  // Satır ekleme
  const handleAddRow = () => {
    if (!localProject.tableData) return;

    const updated = { ...localProject };
    const newRow = activeSheet.headers.map(() => '');
    updated.tableData![activeSheetIndex].rows.push(newRow);

    setLocalProject(updated);
    setHasChanges(true);
  };

  // Satır silme
  const handleDeleteRow = (rowIndex: number) => {
    if (!localProject.tableData) return;

    const updated = { ...localProject };
    updated.tableData![activeSheetIndex].rows.splice(rowIndex, 1);

    // Toplam tutarı güncelle
    const colInfo = activeSheet.columnInfo;
    if (colInfo?.totalCol !== undefined) {
      updated.totalAmount = updated.tableData!.reduce(
        (sum, sheet) =>
          sum +
          sheet.rows.reduce(
            (sheetSum, row) => sheetSum + parseNumber(row[colInfo.totalCol]),
            0
          ),
        0
      );
    }

    setLocalProject(updated);
    setHasChanges(true);
  };

  // Sütun ekleme
  const handleAddColumn = async () => {
    const columnName = prompt('Sütun adı:');
    if (!columnName || !localProject.tableData) return;

    const updated = { ...localProject };
    updated.tableData![activeSheetIndex].headers.push(columnName);
    updated.tableData![activeSheetIndex].rows.forEach((row) => row.push(''));

    setLocalProject(updated);
    setHasChanges(true);
  };

  // Sütun silme
  const handleDeleteColumn = async () => {
    const colIndex = parseInt(
      prompt(`Sütun numarası (1-${activeSheet.headers.length}):`) || '0',
      10
    );
    if (colIndex < 1 || colIndex > activeSheet.headers.length || !localProject.tableData) return;

    const updated = { ...localProject };
    updated.tableData![activeSheetIndex].headers.splice(colIndex - 1, 1);
    updated.tableData![activeSheetIndex].rows.forEach((row) => row.splice(colIndex - 1, 1));

    setLocalProject(updated);
    setHasChanges(true);
  };

  // Kaydet
  const handleSave = async () => {
    if (!localProject || !hasChanges) return;

    try {
      await updateProject(localProject.id, localProject);
      await db.saveProject(localProject);
      setHasChanges(false);
      addToast({
        type: 'success',
        message: 'Değişiklikler kaydedildi',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Kaydetme başarısız',
      });
    }
  };

  // Excel dışa aktar
  const handleExportExcel = async () => {
    if (!localProject) return;
    try {
      await excelService.exportProject(localProject);
      addToast({
        type: 'success',
        message: 'Excel dosyası indirildi',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Excel dışa aktarılamadı',
      });
    }
  };

  // PDF dışa aktar
  const handleExportPDF = async () => {
    if (!localProject) return;
    try {
      await printService.exportProjectPDF(localProject);
      addToast({
        type: 'success',
        message: 'PDF dosyası indirildi',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'PDF dışa aktarılamadı',
      });
    }
  };

  // Toplam hesapla
  const calculateTotal = () => {
    if (!activeSheet.columnInfo?.totalCol) return 0;
    return activeSheet.rows.reduce(
      (sum, row) => sum + parseNumber(row[activeSheet.columnInfo!.totalCol]),
      0
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div
              className="bg-white dark:bg-gray-900 w-full h-full sm:rounded-3xl sm:shadow-2xl sm:w-[95vw] sm:h-[95vh] sm:max-w-7xl overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{localProject.name}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {localProject.tableData?.length} sayfa,{' '}
                    {localProject.tableData?.reduce((sum, s) => sum + s.rows.length, 0)} satır
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">Kaydet</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-3 sm:px-6 pt-3 sm:pt-4 border-b border-gray-200 dark:border-gray-800 shrink-0 overflow-x-auto scrollbar-hide">
                {localProject.tableData.map((sheet, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSheetIndex(index)}
                    className={`px-3 sm:px-4 py-2 sm:py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                      activeSheetIndex === index
                        ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {sheet.name}
                  </button>
                ))}
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Satırlarda ara..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-semibold text-base"
                    />
                  </div>

                  {/* View mode toggle */}
                  <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 sm:flex-none p-3 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                      title="Grid görünümü"
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`flex-1 sm:flex-none p-3 rounded-lg transition-colors ${
                        viewMode === 'cards'
                          ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                      title="Kart görünümü"
                    >
                      <LayoutList className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 overflow-x-auto">
                  <button
                    onClick={handleAddColumn}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base whitespace-nowrap transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Sütun
                  </button>
                  <button
                    onClick={handleDeleteColumn}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-sm sm:text-base whitespace-nowrap transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sütun
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    title="Excel'e aktar"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
                    title="PDF'e aktar"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {viewMode === 'grid' ? (
                  /* GRID VIEW - Desktop Table */
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="w-12 px-2 py-3 text-center font-bold text-gray-700 dark:text-gray-300 border-b-2 border-gray-300 dark:border-gray-600">
                            #
                          </th>
                          {activeSheet.headers.map((header, i) => (
                            <th
                              key={i}
                              className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 border-b-2 border-gray-300 dark:border-gray-600 min-w-[140px]"
                            >
                              {header}
                            </th>
                          ))}
                          <th className="w-12 px-2 py-3 text-center font-bold text-gray-700 dark:text-gray-300 border-b-2 border-gray-300 dark:border-gray-600">
                            
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <td className="px-2 py-3 text-center text-gray-500 dark:text-gray-400 font-semibold">
                              {rowIndex + 1}
                            </td>
                            {row.map((cell, cellIndex) => {
                              const isNumber =
                                activeSheet.columnInfo &&
                                [
                                  activeSheet.columnInfo.quantityCol,
                                  activeSheet.columnInfo.priceCol,
                                  activeSheet.columnInfo.totalCol,
                                ].includes(cellIndex);

                              return (
                                <td key={cellIndex} className="px-4 py-2">
                                  <input
                                    type={isNumber ? 'number' : 'text'}
                                    value={String(cell || '')}
                                    onChange={(e) =>
                                      handleCellChange(rowIndex, cellIndex, e.target.value)
                                    }
                                    className={`w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-teal-600 dark:focus:border-teal-500 outline-none bg-white dark:bg-gray-800 font-semibold transition-all ${
                                      isNumber ? 'text-right font-mono' : ''
                                    }`}
                                  />
                                </td>
                              );
                            })}
                            <td className="px-2 py-3 text-center">
                              <button
                                onClick={() => handleDeleteRow(rowIndex)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {activeSheet.columnInfo?.totalCol !== undefined && (
                        <tfoot className="sticky bottom-0 bg-teal-50 dark:bg-teal-900/30">
                          <tr className="font-bold">
                            <td></td>
                            <td
                              colSpan={activeSheet.columnInfo.totalCol}
                              className="px-4 py-4 text-right text-lg text-gray-900 dark:text-gray-100"
                            >
                              TOPLAM:
                            </td>
                            <td className="px-4 py-4 text-teal-700 dark:text-teal-400 text-right text-xl font-bold">
                              {formatCurrency(calculateTotal())}
                            </td>
                            {activeSheet.headers.slice(activeSheet.columnInfo.totalCol + 1).map((_, i) => (
                              <td key={i}></td>
                            ))}
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                ) : (
                  /* CARD VIEW - Mobile Friendly */
                  <div className="space-y-4 p-4">
                    {filteredRows.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                              {rowIndex + 1}
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              Satır {rowIndex + 1}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteRow(rowIndex)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 space-y-4">
                          {row.map((cell, cellIndex) => {
                            const isNumber =
                              activeSheet.columnInfo &&
                              [
                                activeSheet.columnInfo.quantityCol,
                                activeSheet.columnInfo.priceCol,
                                activeSheet.columnInfo.totalCol,
                              ].includes(cellIndex);

                            const isTotal = activeSheet.columnInfo?.totalCol === cellIndex;
                            const isPrice = activeSheet.columnInfo?.priceCol === cellIndex;

                            return (
                              <div key={cellIndex}>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                  {activeSheet.headers[cellIndex]}
                                </label>
                                <input
                                  type={isNumber ? 'number' : 'text'}
                                  value={String(cell || '')}
                                  onChange={(e) =>
                                    handleCellChange(rowIndex, cellIndex, e.target.value)
                                  }
                                  className={`w-full px-4 py-3 rounded-xl border-2 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-bold text-base ${
                                    isTotal
                                      ? 'border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-xl'
                                      : isPrice
                                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-900 dark:text-white'
                                  } ${isNumber ? 'text-right font-mono' : ''}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSheet.columnInfo?.hasAutoCalc && (
                  <div className="mx-4 mt-4 px-5 py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-2xl font-bold text-base">
                    ℹ️ Otomatik hesaplama aktif: {activeSheet.headers[activeSheet.columnInfo.quantityCol]} ×{' '}
                    {activeSheet.headers[activeSheet.columnInfo.priceCol]} ={' '}
                    {activeSheet.headers[activeSheet.columnInfo.totalCol]}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
                <button
                  onClick={handleAddRow}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-lg shadow-teal-600/30 text-lg"
                >
                  <Plus className="w-6 h-6" />
                  Satır Ekle
                </button>
                
                <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-3">
                  <span className="text-base text-gray-600 dark:text-gray-400 font-semibold">
                    {filteredRows.length} satır görüntüleniyor
                    {searchQuery && ` (${activeSheet.rows.length} toplam)`}
                  </span>
                  {activeSheet.columnInfo?.totalCol !== undefined && (
                    <div className="text-center sm:text-right px-4 py-3 bg-teal-50 dark:bg-teal-900/20 rounded-2xl">
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wide mb-1">
                        Sayfa Toplamı
                      </div>
                      <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                        {formatCurrency(calculateTotal())}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
