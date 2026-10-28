import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  FileText,
  Upload,
  Key,
  Moon,
  Sun,
  Languages,
  DollarSign,
  Calendar,
  Bell,
  Save,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Settings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'company' | 'preferences' | 'api';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Settings>({
    theme: 'system',
    language: 'tr',
    currency: '₺',
    dateFormat: 'DD.MM.YYYY',
    notifications: true,
    autoSave: true,
    companyName: '',
    companyLogo: '',
    companyPhone: '',
    companyAddress: '',
    companyEmail: '',
    companyWebsite: '',
    taxNumber: '',
    apiKeys: {
      ocr: [],
    },
  });

  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      if (settings.companyLogo) {
        setLogoPreview(settings.companyLogo);
      }
    }
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo dosyası maksimum 2MB olabilir');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      setFormData({ ...formData, companyLogo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData({ ...formData, companyLogo: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddApiKey = () => {
    if (!apiKeyInput.trim()) return;

    const currentKeys = formData.apiKeys?.ocr || [];
    if (currentKeys.includes(apiKeyInput.trim())) {
      alert('Bu API key zaten ekli');
      return;
    }

    setFormData({
      ...formData,
      apiKeys: {
        ...formData.apiKeys,
        ocr: [...currentKeys, apiKeyInput.trim()],
      },
    });
    setApiKeyInput('');
  };

  const handleRemoveApiKey = (key: string) => {
    setFormData({
      ...formData,
      apiKeys: {
        ...formData.apiKeys,
        ocr: formData.apiKeys?.ocr?.filter((k) => k !== key) || [],
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    onClose();
  };

  const themeOptions = [
    { value: 'light', label: 'Açık Tema', icon: Sun },
    { value: 'dark', label: 'Koyu Tema', icon: Moon },
    { value: 'system', label: 'Sistem', icon: Globe },
  ];

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
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-6 pt-4 border-b border-gray-200 dark:border-gray-800 shrink-0 overflow-x-auto">
                {[
                  { id: 'company', label: 'Şirket Bilgileri', icon: Building2 },
                  { id: 'preferences', label: 'Tercihler', icon: Bell },
                  { id: 'api', label: 'API Anahtarları', icon: Key },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                {activeTab === 'company' && (
                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Şirket Logosu
                      </label>
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <div className="relative">
                            <img
                              src={logoPreview}
                              alt="Logo"
                              className="w-24 h-24 rounded-2xl object-contain bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            Logo Yükle
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            PNG, JPG veya SVG - Max 2MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Şirket Adı
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="Lavora Design Studio"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Vergi Numarası
                        </label>
                        <input
                          type="text"
                          value={formData.taxNumber}
                          onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                          placeholder="1234567890"
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
                          value={formData.companyPhone}
                          onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                          placeholder="+90 555 123 45 67"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          E-posta
                        </label>
                        <input
                          type="email"
                          value={formData.companyEmail}
                          onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                          placeholder="info@lavoradesign.com"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.companyWebsite}
                          onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                          placeholder="https://lavoradesign.com"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Adres
                        </label>
                        <textarea
                          value={formData.companyAddress}
                          onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                          placeholder="Merkez Mahallesi, İş Sokak No: 123/4, İstanbul"
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Tema</label>
                      <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, theme: option.value as Settings['theme'] })}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              formData.theme === option.value
                                ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <option.icon className="w-6 h-6" />
                            <span className="font-bold text-sm">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        Dil
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, language: 'tr' })}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${
                            formData.language === 'tr'
                              ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          🇹🇷 Türkçe
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, language: 'en' })}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${
                            formData.language === 'en'
                              ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          🇬🇧 English
                        </button>
                      </div>
                    </div>

                    {/* Currency and Date Format */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Para Birimi
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                        >
                          <option value="₺">₺ Türk Lirası</option>
                          <option value="$">$ Dolar</option>
                          <option value="€">€ Euro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Tarih Formatı
                        </label>
                        <select
                          value={formData.dateFormat}
                          onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-semibold"
                        >
                          <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Bildirimler</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Önemli olaylar için bildirim al
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, notifications: !formData.notifications })}
                          className={`relative w-14 h-8 rounded-full transition-colors ${
                            formData.notifications ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <motion.div
                            animate={{ x: formData.notifications ? 24 : 2 }}
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Otomatik Kaydetme</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Değişiklikleri otomatik kaydet
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, autoSave: !formData.autoSave })}
                          className={`relative w-14 h-8 rounded-full transition-colors ${
                            formData.autoSave ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <motion.div
                            animate={{ x: formData.autoSave ? 24 : 2 }}
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                          <Key className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-blue-900 dark:text-blue-200 mb-1">API Ninjas OCR</div>
                          <div className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            OCR (Optik Karakter Tanıma) için API anahtarları. Birden fazla anahtar ekleyerek self-healing
                            sistemi kullanabilirsiniz.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add API Key */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Yeni API Anahtarı Ekle
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddApiKey())}
                          placeholder="API key buraya yapıştırın..."
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-600/20 outline-none transition-all font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddApiKey}
                          className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>

                    {/* API Keys List */}
                    {formData.apiKeys?.ocr && formData.apiKeys.ocr.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Mevcut API Anahtarları ({formData.apiKeys.ocr.length})
                        </label>
                        {formData.apiKeys.ocr.map((key, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl group"
                          >
                            <Key className="w-5 h-5 text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-sm text-gray-900 dark:text-white truncate">
                                {key.substring(0, 12)}...{key.substring(key.length - 8)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">API Key #{index + 1}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveApiKey(key)}
                              className="opacity-0 group-hover:opacity-100 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 font-bold text-sm transition-all"
                            >
                              Sil
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">Henüz API anahtarı eklenmemiş</p>
                        <p className="text-sm mt-1">OCR özelliğini kullanmak için en az 1 API key ekleyin</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Kaydet
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
