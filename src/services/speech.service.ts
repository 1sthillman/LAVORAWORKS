/**
 * Ses tanıma servisi - Mikrofon ile ses girişi
 */
class SpeechService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'tr-TR';
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'tr-TR';
    }
  }

  /**
   * Ses tanıma desteği var mı kontrol et
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Dinleme durumunu kontrol et
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Ses dinlemeyi başlat
   */
  async startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (!this.recognition) {
      onError?.('Tarayıcınız ses tanımayı desteklemiyor');
      return;
    }

    if (this.isListening) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const errorMessage = this.getErrorMessage(event.error);
        onError?.(errorMessage);
        reject(new Error(errorMessage));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  /**
   * Dinlemeyi durdur
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Metinden sayı çıkar (fiyat için)
   */
  extractNumber(text: string): number | null {
    // Türkçe ses tanıma sonuçlarını normalize et
    let normalized = text.toLowerCase()
      .replace(/virgül/g, ',')
      .replace(/nokta/g, '.')
      .replace(/lira/g, '')
      .replace(/tl/g, '')
      .replace(/türk lirası/g, '')
      .trim();

    // Sayıları yazıdan çevir
    const numbers: { [key: string]: number } = {
      'sıfır': 0, 'bir': 1, 'iki': 2, 'üç': 3, 'dört': 4,
      'beş': 5, 'altı': 6, 'yedi': 7, 'sekiz': 8, 'dokuz': 9,
      'on': 10, 'yirmi': 20, 'otuz': 30, 'kırk': 40, 'elli': 50,
      'altmış': 60, 'yetmiş': 70, 'seksen': 80, 'doksan': 90,
      'yüz': 100, 'bin': 1000, 'milyon': 1000000,
    };

    let result = 0;
    let current = 0;

    // Basit sayıları ara
    const simpleNumberMatch = normalized.match(/(\d+[.,]?\d*)/);
    if (simpleNumberMatch) {
      return parseFloat(simpleNumberMatch[1].replace(',', '.'));
    }

    // Yazılı sayıları çevir
    const words = normalized.split(/\s+/);
    for (const word of words) {
      if (word in numbers) {
        const value = numbers[word];
        if (value >= 100) {
          if (current === 0) current = 1;
          current *= value;
          if (value >= 1000) {
            result += current;
            current = 0;
          }
        } else {
          current += value;
        }
      }
    }

    result += current;
    return result > 0 ? result : null;
  }

  /**
   * Hata mesajını çevir
   */
  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'no-speech': 'Ses algılanamadı. Lütfen tekrar deneyin.',
      'audio-capture': 'Mikrofon erişimi reddedildi.',
      'not-allowed': 'Mikrofon kullanımı için izin gerekli.',
      'network': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
      'aborted': 'Ses tanıma iptal edildi.',
    };

    return errorMessages[error] || 'Ses tanıma hatası oluştu.';
  }
}

export const speechService = new SpeechService();
