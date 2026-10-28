import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, DollarSign, Tag, Phone, Mail, FileText } from 'lucide-react';
import { useProjectStore, type ProjectStatus, type ProjectPriority } from '@/store/useProjectStore';
import type { Project } from '@/types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProject?: Project | null;
}

export function NewProjectModal({ isOpen, onClose, editProject }: NewProjectModalProps) {
  const { addProject, updateProject } = useProjectStore();

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    clientContact: '',
    clientEmail: '',
    clientPhone: '',
    status: 'active' as ProjectStatus,
    priority: 'normal' as ProjectPriority,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    totalAmount: 0,
    paidAmount: 0,
    progress: 0,
    description: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modunda veriyi yükle
  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name,
        client: editProject.client,
        clientContact: editProject.clientContact || '',
        clientEmail: editProject.clientEmail || '',
        clientPhone: editProject.clientPhone || '',
        status: editProject.status,
        priority: editProject.priority || 'normal',
        startDate: editProject.startDate,
        dueDate: editProject.dueDate || '',
        totalAmount: editProject.totalAmount,
        paidAmount: editProject.paidAmount,
        progress: editProject.progress,
        description: editProject.description || '',
        tags: editProject.tags || [],
      });
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        client: '',
        clientContact: '',
        clientEmail: '',
        clientPhone: '',
        status: 'active',
        priority: 'normal',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        totalAmount: 0,
        paidAmount: 0,
        progress: 0,
        description: '',
        tags: [],
      });
    }
  }, [editProject, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editProject) {
        await updateProject(editProject.id, formData);
      } else {
        await addProject(formData);
      }
      onClose();
    } catch (error) {
      console.error('Proje kaydedilemedi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const statusColors: Record<ProjectStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  const priorityColors: Record<ProjectPriority, string> = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
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
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editProject ? 'Proje Düzenle' : 'Yeni Proje'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-5">
                  {/* Proje Adı */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Proje Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Örn: Website Tasarımı"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                    />
                  </div>

                  {/* Müşteri Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Müşteri Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        placeholder="Örn: Acme Corp"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        İletişim Kişisi
                      </label>
                      <input
                        type="text"
                        value={formData.clientContact}
                        onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        placeholder="ornek@firma.com"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        placeholder="0555 123 45 67"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Durum ve Öncelik */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Durum
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['active', 'completed', 'paused', 'cancelled'] as ProjectStatus[]).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setFormData({ ...formData, status })}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                              formData.status === status
                                ? statusColors[status]
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {status === 'active' && 'Aktif'}
                            {status === 'completed' && 'Tamamlandı'}
                            {status === 'paused' && 'Durduruldu'}
                            {status === 'cancelled' && 'İptal'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Öncelik
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['low', 'normal', 'high'] as ProjectPriority[]).map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority })}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                              formData.priority === priority
                                ? priorityColors[priority]
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {priority === 'low' && 'Düşük'}
                            {priority === 'normal' && 'Normal'}
                            {priority === 'high' && 'Yüksek'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tarihler */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Başlangıç Tarihi *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Tutarlar */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Toplam Tutar (₺)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Ödenen Tutar (₺)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={formData.totalAmount}
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold text-right"
                      />
                    </div>
                  </div>

                  {/* İlerleme */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      İlerleme: %{formData.progress}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  {/* Açıklama */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Proje hakkında notlar..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-medium resize-none"
                    />
                  </div>

                  {/* Etiketler */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Etiketler
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Etiket ekle..."
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-teal-900 dark:hover:text-teal-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold transition-colors shadow-lg shadow-teal-600/30"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : editProject ? 'Güncelle' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
