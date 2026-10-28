import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { speechService } from '../../services/speech.service';

interface VoiceInputProps {
  onResult: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  placeholder = 'Mikrofona bas ve fiyatı söyle',
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(speechService.isSupported());

  useEffect(() => {
    // Component unmount olduğunda dinlemeyi durdur
    return () => {
      if (isListening) {
        speechService.stopListening();
      }
    };
  }, [isListening]);

  const startListening = async () => {
    setError(null);
    setTranscript('');

    try {
      await speechService.startListening(
        (text) => {
          setTranscript(text);
          setIsListening(false);

          // Metinden sayı çıkar
          const number = speechService.extractNumber(text);
          if (number !== null) {
            onResult(number);
          } else {
            setError('Geçerli bir sayı tanınamadı. Tekrar deneyin.');
          }
        },
        (errorMessage) => {
          setError(errorMessage);
          setIsListening(false);
        }
      );

      setIsListening(true);
    } catch (err) {
      setError('Ses tanıma başlatılamadı');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>Tarayıcınız ses tanımayı desteklemiyor</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        onClick={isListening ? stopListening : startListening}
        variant={isListening ? 'danger' : 'secondary'}
        size="md"
        className="w-full relative overflow-hidden"
      >
        {isListening ? (
          <>
            <div className="absolute inset-0 bg-danger-500 animate-pulse opacity-20" />
            <MicOff className="w-5 h-5 mr-2" />
            <span>Dinliyor... (Durdurmak için tıkla)</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 mr-2" />
            <span>{placeholder}</span>
          </>
        )}
      </Button>

      {/* Transcript */}
      {transcript && (
        <div className="bg-surface-100 dark:bg-surface-800 rounded-lg p-3 flex items-start gap-2">
          <Volume2 className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Tanınan Metin:</p>
            <p className="text-sm text-muted">{transcript}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
          </div>
        </div>
      )}

      {/* İpucu */}
      {!isListening && !transcript && !error && (
        <p className="text-xs text-muted text-center">
          Örnek: "Yüz elli lira" veya "150,50"
        </p>
      )}
    </div>
  );
};
