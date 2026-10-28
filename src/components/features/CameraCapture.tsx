import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, FlipHorizontal, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string, file: File) => void;
  title?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Fotoğraf Çek',
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Kamerayı başlat
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mevcut stream'i durdur
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Kamera erişim hatası:', err);
      setError('Kamera erişimi reddedildi veya kamera bulunamadı.');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  // Modal açıldığında kamerayı başlat
  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, startCamera]);

  // Fotoğraf çek
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Canvas boyutlarını video boyutlarına ayarla
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Video frame'ini canvas'a çiz
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Canvas'ı data URL'e çevir
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);

    // Stream'i durdur
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Fotoğrafı onayla
  const confirmCapture = () => {
    if (!capturedImage) return;

    // Data URL'i Blob ve File'a çevir
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onCapture(capturedImage, file);
        handleClose();
      });
  };

  // Yeniden çek
  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Kamerayı değiştir (ön/arka)
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setCapturedImage(null);
  };

  // Modal'ı kapat
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="xl"
      className="bg-black"
    >
      <div className="relative w-full h-[calc(100vh-8rem)] bg-black rounded-lg overflow-hidden">
        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white">Kamera başlatılıyor...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center max-w-md px-6">
              <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-4">{error}</p>
              <Button onClick={startCamera} variant="primary">
                Tekrar Dene
              </Button>
            </div>
          </div>
        )}

        {/* Video Preview veya Çekilen Fotoğraf */}
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={capturedImage}
            alt="Çekilen fotoğraf"
            className="w-full h-full object-contain"
          />
        )}

        {/* Canvas (gizli) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Kontroller */}
        {!isLoading && !error && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-6">
              {!capturedImage ? (
                <>
                  {/* Kamera Değiştir */}
                  <Button
                    onClick={toggleCamera}
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/20"
                  >
                    <FlipHorizontal className="w-6 h-6" />
                  </Button>

                  {/* Fotoğraf Çek */}
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 rounded-full bg-white border-4 border-white/50 hover:scale-105 transition-transform active:scale-95"
                    disabled={!stream}
                  >
                    <div className="w-full h-full rounded-full bg-white/30" />
                  </button>

                  {/* Boş Alan (simetri için) */}
                  <div className="w-12" />
                </>
              ) : (
                <>
                  {/* Yeniden Çek */}
                  <Button
                    onClick={retake}
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Yeniden Çek
                  </Button>

                  {/* Onayla */}
                  <Button
                    onClick={confirmCapture}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Kullan
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
