import React, { useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Camera, Upload, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        message: 'Lütfen bir resim dosyası seçin',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!preview) return;

    setIsProcessing(true);
    try {
      // TODO: OCR implementation
      // This would integrate with Tesseract.js or a cloud OCR service
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      addToast({
        type: 'info',
        message: 'OCR özelliği yakında eklenecek!',
      });
      
      handleClear();
      onClose();
    } catch (error) {
      addToast({
        type: 'error',
        message: 'İşleme hatası',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fotoğraftan Tablo" size="lg">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 font-semibold">
          Tablo içeren bir fotoğraf çekin veya yükleyin. Otomatik olarak tabloya dönüştürülecek.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Preview */}
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-800"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 font-semibold mb-4">
              Henüz fotoğraf seçilmedi
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Camera className="w-5 h-5 mr-2" />
            Fotoğraf Çek
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.capture = '';
                fileInputRef.current.click();
              }
            }}
            disabled={isProcessing}
          >
            <Upload className="w-5 h-5 mr-2" />
            Dosya Yükle
          </Button>
        </div>

        {preview && (
          <Button
            variant="primary"
            className="w-full"
            onClick={handleProcess}
            isLoading={isProcessing}
          >
            Tabloya Dönüştür (Yakında)
          </Button>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold">
            <strong>💡 İpucu:</strong> OCR (Optical Character Recognition) özelliği yakında eklenecek. 
            Bu özellik ile fotoğraftaki tabloları otomatik olarak dijital tabloya dönüştürebileceksiniz.
          </p>
        </div>
      </div>
    </Modal>
  );
};
