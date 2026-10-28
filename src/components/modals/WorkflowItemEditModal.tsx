/**
 * Workflow Item Düzenleme Modal
 * HTML v17'deki gibi inline item editing
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, Hash, Ruler, Package, DollarSign, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { WorkflowItem, Project } from '@/types';
import { formatCurrency, parseNumber } from '@/utils/formatters';
import { db } from '@/lib/db';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';

interface WorkflowItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WorkflowItem | null;
  project: Project | null;
}

export function WorkflowItemEditModal({ isOpen, onClose, item, project }: WorkflowItemEditModalProps) {
  const { updateProject } = useProjectStore();
  const { addToast } = useAppStore();

  const [formData, setFormData] = useState<Partial<WorkflowItem>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
      setHasChanges(false);
    }
  }, [item]);

  if (!item || !project) return null;

  const handleChange = (field: keyof WorkflowItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);

    // Auto-calculate total: quantity × price
    if (field === 'quantity' || field === 'price') {
      const qty = field === 'quantity' ? parseNumber(value) : parseNumber(formData.quantity || '0');
      const price = field === 'price' ? Number(value) : (formData.price || 0);
      
      if (qty > 0 && price > 0) {
        setFormData((prev) => ({ ...prev, total: qty * price, pricePending: false }));
      }
    }
  };

  const handleStageStatusChange = (stageId: string, status: number) => {
    setFormData((prev) => ({
      ...prev,
      stageStatus: {
        ...(prev.stageStatus || {}),
        [stageId]: status,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges || !project) return;

    try {
      // Update workflow item in project
      const updatedProject = { ...project };
      if (updatedProject.workflow?.items) {
        const itemIndex = updatedProject.workflow.items.findIndex((i) => i.id === item.id);
        if (itemIndex >= 0) {
          updatedProject.workflow.items[itemIndex] = { ...item, ...formData };
        }
      }

      // Calculate progress
      const stages = updatedProject.workflow?.stages || [];
      const stageStatuses = formData.stageStatus || {};
      let completedStages = 0;
      stages.forEach((stage) => {
        if (stageStatuses[stage.id] === 2) completedStages++;
      });
      const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0;

      updatedProject.workflow!.items[
        updatedProject.workflow!.items.findIndex((i) => i.id === item.id)
      ].progress = progress;

      // Determine overall status
      const allCompleted = stages.every((stage) => stageStatuses[stage.id] === 2);
      const anyInProgress = stages.some((stage) => stageStatuses[stage.id] === 1);
      const anyHalted = stages.some((stage) => stageStatuses[stage.id] === 3);

      updatedProject.workflow!.items[
        updatedProject.workflow!.items.findIndex((i) => i.id === item.id)
      ].status = allCompleted ? 'completed' : anyHalted ? 'cancelled' : anyInProgress ? 'in-progress' : 'pending';

      // Save to DB
      await db.saveProject(updatedProject);
      await updateProject(updatedProject.id, updatedProject);

      // Update workflow item separately
      await db.saveWorkflowItem({ ...item, ...formData });

      setHasChanges(false);
      addToast({
        type: 'success',
        message: 'Ürün güncellendi',
      });

      onClose();
    } catch (error) {
      console.error('Save error:', error);
      addToast({
        type: 'error',
        message: 'Kaydetme başarısız',
      });
    }
  };

  const stageStatusLabels: Record<number, { label: string; color: string }> = {
    0: { label: 'Bekliyor', color: 'bg-gray-200 dark:bg-gray-700' },
    1: { label: 'Devam', color: 'bg-blue-500' },
    2: { label: 'Tamam', color: 'bg-teal-500' },
    3: { label: 'Yarıda', color: 'bg-amber-500' },
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ürün Düzenle</h2>
                  {item.sheetName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.sheetName} · Satır {(item.rowIndex || 0) + 1}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-semibold"
                    placeholder="Ürün adı"
                  />
                </div>

                {/* Grid: Quantity, Dimension, Material */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Adet/Miktar
                    </label>
                    <input
                      type="text"
                      value={formData.quantity || ''}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-semibold"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Ruler className="w-4 h-4 inline mr-1" />
                      Ölçü
                    </label>
                    <input
                      type="text"
                      value={formData.dimension || ''}
                      onChange={(e) => handleChange('dimension', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-semibold"
                      placeholder="Ölçü"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Package className="w-4 h-4 inline mr-1" />
                      Malzeme
                    </label>
                    <input
                      type="text"
                      value={formData.material || ''}
                      onChange={(e) => handleChange('material', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-semibold"
                      placeholder="Malzeme"
                    />
                  </div>
                </div>

                {/* Grid: Price, Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Birim Fiyat
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => handleChange('price', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-semibold text-right font-mono"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Toplam Tutar
                    </label>
                    <div className="w-full px-4 py-3 rounded-xl border-2 border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/20 font-bold text-teal-700 dark:text-teal-400 text-right text-lg">
                      {formatCurrency(formData.total || 0)}
                    </div>
                  </div>
                </div>

                {/* Price Warning */}
                {formData.pricePending && (
                  <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-semibold">
                    ⚠️ Fiyat bilgisi eksik
                  </div>
                )}

                {/* Stage Status */}
                {project.workflow && project.workflow.stages.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Aşama Durumu
                    </label>
                    <div className="space-y-3">
                      {project.workflow.stages.map((stage) => {
                        const currentStatus = (formData.stageStatus || {})[stage.id] || 0;
                        return (
                          <div
                            key={stage.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                          >
                            <span className="font-bold text-gray-700 dark:text-gray-300">{stage.name}</span>
                            <div className="flex gap-2">
                              {Object.entries(stageStatusLabels).map(([status, { label, color }]) => (
                                <button
                                  key={status}
                                  onClick={() => handleStageStatusChange(stage.id, Number(status))}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                    currentStatus === Number(status)
                                      ? `${color} text-white`
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Termin Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-semibold"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notlar</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 outline-none transition-all font-semibold resize-none"
                    placeholder="Notlar, açıklamalar..."
                  />
                </div>

                {/* Photos */}
                {formData.photos && formData.photos.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Fotoğraflar ({formData.photos.length})
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {formData.photos.map((_, index) => (
                        <div key={index} className="relative">
                          <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          <button
                            onClick={() => {
                              const updated = [...(formData.photos || [])];
                              updated.splice(index, 1);
                              handleChange('photos', updated);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-lg shadow-teal-600/30"
                >
                  <Save className="w-5 h-5" />
                  Kaydet
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
