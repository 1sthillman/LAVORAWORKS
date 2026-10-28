import React, { useState } from 'react';
import { Camera, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { CameraCapture } from './CameraCapture';
import { ocrService, TableData } from '../../services/ocr.service';
import { useDropzone } from 'react-dropzone';

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onTableExtracted: (data: TableData) => void;
  mode?: 'table' | 'receipt' | 'text';
}

export const OCRScanner: React.FC<OCRScannerProps> = ({
  isOpen,
  onClose,
  onTableExtracted,
  mode = 'table',
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<TableData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Dosya yükleme (drag & drop)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processImage(acceptedFiles[0]);
      }
    },
  });

  // Resmi işle
  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      setResult(null);

      // Önizleme oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // OCR işlemi
      const tableData = await ocrService.recognizeTable(file, (p) => {
        setProgress(Math.round(p * 100));
      });

      if (tableData.headers.length === 0 && tableData.rows.length === 0) {
        throw new Error('Resimde tablo bulunamadı. Lütfen daha net bir fotoğraf çekin.');
      }

      setResult(tableData);
    } catch (err) {
      console.error('OCR hatası:', err);
      setError(err instanceof Error ? err.message : 'OCR işlemi başarısız oldu.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Kameradan fotoğraf çek
  const handleCameraCapture = (_imageData: string, file: File) => {
    setShowCamera(false);
    processImage(file);
  };

  // Sonucu onayla ve kullan
  const handleConfirm = () => {
    if (result) {
      onTableExtracted(result);
      handleClose();
    }
  };

  // Modal'ı kapat ve sıfırla
  const handleClose = () => {
    setResult(null);
    setError(null);
    setPreviewImage(null);
    setIsProcessing(false);
    setProgress(0);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={
          mode === 'table'
            ? 'Fotoğraftan Tablo Oluştur'
            : mode === 'receipt'
            ? 'Fatura/Fiş Tara'
            : 'Metin Tara'
        }
        size="xl"
      >
        <div className="space-y-6">
          {/* Yükleme Alanı */}
          {!isProcessing && !result && (
            <div className="space-y-4">
              {/* Drag & Drop */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                  transition-all duration-200
                  ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                      : 'border-surface-300 dark:border-surface-700 hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-800'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted" />
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive ? 'Buraya Bırak' : 'Fotoğraf Yükle'}
                </h3>
                <p className="text-sm text-muted">
                  Fotoğrafı sürükle-bırak veya tıkla
                </p>
              </div>

              {/* Veya */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-surface-300 dark:bg-surface-700" />
                <span className="text-sm text-muted">veya</span>
                <div className="flex-1 h-px bg-surface-300 dark:bg-surface-700" />
              </div>

              {/* Kamera */}
              <Button
                onClick={() => setShowCamera(true)}
                variant="primary"
                size="lg"
                className="w-full"
              >
                <Camera className="w-5 h-5 mr-2" />
                Fotoğraf Çek
              </Button>
            </div>
          )}

          {/* İşleniyor */}
          {isProcessing && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {mode === 'table' ? 'Tablo Tanınıyor' : 'Metin Tanınıyor'}...
              </h3>
              <p className="text-sm text-muted mb-4">
                Bu işlem birkaç saniye sürebilir
              </p>
              {progress > 0 && (
                <div className="max-w-xs mx-auto">
                  <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted mt-2">%{progress}</p>
                </div>
              )}
            </div>
          )}

          {/* Hata */}
          {error && (
            <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-danger-700 dark:text-danger-300 mb-2">
                Bir Hata Oluştu
              </h3>
              <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
              <Button
                onClick={() => setError(null)}
                variant="secondary"
                className="mt-4"
              >
                Tekrar Dene
              </Button>
            </div>
          )}

          {/* Sonuç */}
          {result && (
            <div className="space-y-4">
              {/* Başarı Mesajı */}
              <div className="bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-800 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-success-700 dark:text-success-300">
                    Tablo Başarıyla Tanındı!
                  </h4>
                  <p className="text-sm text-success-600 dark:text-success-400">
                    {result.headers.length} sütun, {result.rows.length} satır bulundu
                    {result.confidence > 0 &&
                      ` (Güven: %${Math.round(result.confidence)})`}
                  </p>
                </div>
              </div>

              {/* Önizleme */}
              {previewImage && (
                <div className="rounded-xl overflow-hidden border border-surface-300 dark:border-surface-700">
                  <img
                    src={previewImage}
                    alt="Taranan resim"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Tablo Önizlemesi */}
              <div className="border border-surface-300 dark:border-surface-700 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-surface-100 dark:bg-surface-800 sticky top-0">
                    <tr>
                      {result.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-sm font-semibold"
                        >
                          {header || `Sütun ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 10).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-t border-surface-200 dark:border-surface-700"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 text-sm"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.rows.length > 10 && (
                  <div className="px-4 py-3 bg-surface-50 dark:bg-surface-800 text-center text-sm text-muted">
                    +{result.rows.length - 10} satır daha
                  </div>
                )}
              </div>

              {/* Butonlar */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setResult(null);
                    setPreviewImage(null);
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Yeniden Tara
                </Button>
                <Button
                  onClick={handleConfirm}
                  variant="primary"
                  className="flex-1"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Kullan
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Kamera Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        title="Tablo Fotoğrafı Çek"
      />
    </>
  );
};
