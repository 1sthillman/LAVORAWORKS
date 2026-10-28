import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, FileText, Tag, Receipt, CreditCard, Building2, Camera } from 'lucide-react';
import { useLedgerStore, type LedgerType } from '@/store/useLedgerStore';
import { useProjectStore } from '@/store/useProjectStore';
import { categoryService } from '@/services/category.service';
import type { LedgerEntry, LedgerCategory } from '@/types';
import { calculateVAT } from '@/utils/formatters';

interface NewLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editEntry?: LedgerEntry | null;
  defaultType?: LedgerType;
}

export function NewLedgerModal({ isOpen, onClose, editEntry, defaultType = 'expense' }: NewLedgerModalProps) {
  const { addEntry, updateEntry } = useLedgerStore();
  const { projects } = useProjectStore();

  const [formData, setFormData] = useState({
    type: defaultType,
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    vatRate: 20,
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer' | 'other',
    merchant: '',
    invoiceNumber: '',
    recurring: false,
    recurringPeriod: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    tags: [] as string[],
  });

  const [categories, setCategories] = useState<LedgerCategory[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVAT, setShowVAT] = useState(false);

  // Load categories
  useEffect(() => {
    const allCategories = categoryService.getAll();
    setCategories(allCategories.filter((c) => c.type === formData.type || c.type === 'both'));
  }, [formData.type]);

  // Edit mode
  useEffect(() => {
    if (editEntry) {
      setFormData({
        type: editEntry.type,
        amount: editEntry.amount,
        description: editEntry.description,
        category: editEntry.category,
        date: editEntry.date,
        projectId: editEntry.projectId || '',
        vatRate: editEntry.vatRate || 20,
        paymentMethod: editEntry.paymentMethod || 'cash',
        merchant: editEntry.merchant || '',
        invoiceNumber: editEntry.invoiceNumber || '',
        recurring: editEntry.recurring || false,
        recurringPeriod: editEntry.recurringPeriod || 'monthly',
        tags: editEntry.tags || [],
      });
      setShowVAT(!!editEntry.vatRate);
    } else {
      // Reset
      setFormData({
        type: defaultType,
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        projectId: '',
        vatRate: 20,
        paymentMethod: 'cash',
        merchant: '',
        invoiceNumber: '',
        recurring: false,
        recurringPeriod: 'monthly',
        tags: [],
      });
      setShowVAT(false);
    }
  }, [editEntry, defaultType, isOpen]);

  const vatCalculation = showVAT ? calculateVAT(formData.amount, formData.vatRate) : 0;
  const vatAmount = typeof vatCalculation === 'number' ? vatCalculation : vatCalculation.vatAmount;
  const totalWithVat = typeof vatCalculation === 'number' ? formData.amount + vatCalculation : vatCalculation.totalAmount;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const entryData = {
        ...formData,
        vatAmount: showVAT ? vatAmount : undefined,
        totalWithVat: showVAT ? totalWithVat : undefined,
      };

      if (editEntry) {
        await updateEntry(editEntry.id, entryData);
      } else {
        await addEntry(entryData);
      }
      onClose();
    } catch (error) {
      console.error('Kayıt eklenemedi:', error);
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

  const paymentMethodIcons = {
    cash: '💵',
    card: '💳',
    transfer: '🏦',
    other: '💰',
  };

  const paymentMethodLabels = {
    cash: 'Nakit',
    card: 'Kredi Kartı',
    transfer: 'Havale/EFT',
    other: 'Diğer',
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
                  {editEntry ? 'Kayıt Düzenle' : formData.type === 'income' ? 'Yeni Gelir' : 'Yeni Gider'}
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
                  {/* Type Toggle */}
                  {!editEntry && (
                    <div className="flex gap-3 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          formData.type === 'income'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        💰 Gelir
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          formData.type === 'expense'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        💸 Gider
                      </button>
                    </div>
                  )}

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Tutar (₺) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-bold text-2xl text-right"
                    />
                  </div>

                  {/* VAT Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">KDV Hesapla</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {showVAT && `%${formData.vatRate} KDV: ₺${vatAmount.toFixed(2)}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVAT(!showVAT)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        showVAT ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: showVAT ? 24 : 2 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>

                  {showVAT && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        KDV Oranı (%)
                      </label>
                      <div className="flex gap-2">
                        {[1, 10, 20].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setFormData({ ...formData, vatRate: rate })}
                            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                              formData.vatRate === rate
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            %{rate}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-gray-700 dark:text-gray-300">Toplam (KDV Dahil)</span>
                          <span className="text-teal-700 dark:text-teal-400">₺{totalWithVat.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Kategori *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                    >
                      <option value="">Kategori seçin...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Açıklama *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Örn: Ofis kirası - Ocak 2024"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                    />
                  </div>

                  {/* Date and Project */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Tarih *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Proje</label>
                      <select
                        value={formData.projectId}
                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      >
                        <option value="">Proje seçin (opsiyonel)</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Ödeme Yöntemi
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(paymentMethodIcons) as Array<keyof typeof paymentMethodIcons>).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: method })}
                          className={`py-3 rounded-xl font-bold text-xs transition-all ${
                            formData.paymentMethod === method
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="text-lg mb-1">{paymentMethodIcons[method]}</div>
                          {paymentMethodLabels[method]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Merchant and Invoice */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Satıcı/Alıcı
                      </label>
                      <input
                        type="text"
                        value={formData.merchant}
                        onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                        placeholder="Firma adı"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Fatura No
                      </label>
                      <input
                        type="text"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        placeholder="ABC-2024-001"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Recurring */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Tekrarlayan Ödeme</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Düzenli gelir/gider</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, recurring: !formData.recurring })}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        formData.recurring ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: formData.recurring ? 24 : 2 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>

                  {formData.recurring && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Tekrarlama Periyodu
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setFormData({ ...formData, recurringPeriod: period })}
                            className={`py-2 rounded-xl font-bold text-xs transition-all ${
                              formData.recurringPeriod === period
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {period === 'daily' && 'Günlük'}
                            {period === 'weekly' && 'Haftalık'}
                            {period === 'monthly' && 'Aylık'}
                            {period === 'yearly' && 'Yıllık'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
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

                  {/* Receipt Photo Button */}
                  <button
                    type="button"
                    className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Fiş/Fatura Fotoğrafı Ekle
                  </button>
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
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg ${
                      formData.type === 'income'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                    } disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white`}
                  >
                    {isSubmitting ? 'Kaydediliyor...' : editEntry ? 'Güncelle' : 'Kaydet'}
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
