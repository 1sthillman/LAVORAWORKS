# 🚀 Lavora Workflow - Yeni Özellikler Dokümantasyonu

## 📋 İçindekiler

1. [📷 OCR & Fotoğraf İşlemleri](#ocr-fotograf-islemleri)
2. [📊 Excel İşlemleri](#excel-islemleri)
3. [🖨️ Yazdırma & PDF](#yazdirma-pdf)
4. [🎤 Ses Girişi](#ses-girisi)
5. [📋 Gelişmiş Tablo Düzenleyici](#gelismis-tablo-duzenleyici)
6. [💾 IndexedDB Yönetimi](#indexeddb-yonetimi)

---

## 📷 OCR & Fotoğraf İşlemleri {#ocr-fotograf-islemleri}

### Özellikler
- ✅ Kamera ile fotoğraf çekme (ön/arka kamera)
- ✅ Drag & drop ile fotoğraf yükleme
- ✅ OCR ile metin tanıma (Türkçe desteği)
- ✅ Fotoğraftan tablo çıkarma
- ✅ Fatura/fiş tanıma
- ✅ IndexedDB'de tarama geçmişi

### Kullanım

#### OCR Scanner Component
```tsx
import { OCRScanner } from '@/components/features/OCRScanner';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <OCRScanner
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onTableExtracted={(data) => {
        console.log('Headers:', data.headers);
        console.log('Rows:', data.rows);
        console.log('Confidence:', data.confidence);
      }}
      mode="table" // 'table' | 'receipt' | 'text'
    />
  );
}
```

#### Kamera Component
```tsx
import { CameraCapture } from '@/components/features/CameraCapture';

<CameraCapture
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onCapture={(imageData, file) => {
    // imageData: base64 data URL
    // file: File object
  }}
  title="Fotoğraf Çek"
/>
```

#### OCR Servisi
```ts
import { ocrService } from '@/services/ocr.service';

// Resimden tablo çıkar
const tableData = await ocrService.recognizeTable(file, (progress) => {
  console.log(`İlerleme: %${Math.round(progress * 100)}`);
});

// Fatura tanıma
const receipt = await ocrService.recognizeReceipt(file);
console.log('Firma:', receipt.merchant);
console.log('Toplam:', receipt.total);
console.log('Ürünler:', receipt.items);
```

### Desteklenen Formatlar
- PNG, JPEG, GIF, BMP, WebP
- Türkçe ve İngilizce metin tanıma
- Tablo yapıları (tab, pipe, çoklu boşluk ayraçlı)

---

## 📊 Excel İşlemleri {#excel-islemleri}

### Özellikler
- ✅ Excel okuma (.xlsx, .xls, .csv)
- ✅ Excel yazma (çoklu sayfa)
- ✅ CSV import/export
- ✅ Otomatik sütun genişliği
- ✅ Stil ve formatlar (header, borders)
- ✅ Proje verilerini otomatik dışa aktarma

### Kullanım

#### Excel Import/Export Component
```tsx
import { ExcelImportExport } from '@/components/features/ExcelImportExport';

// İçe Aktarma
<ExcelImportExport
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  mode="import"
  onImport={(sheets) => {
    sheets.forEach(sheet => {
      console.log('Sayfa:', sheet.sheetName);
      console.log('Headers:', sheet.headers);
      console.log('Rows:', sheet.rows);
    });
  }}
/>

// Dışa Aktarma
<ExcelImportExport
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  mode="export"
  exportData={[
    {
      sheetName: 'Projeler',
      headers: ['Proje Adı', 'Durum', 'Bütçe'],
      rows: [
        ['Proje 1', 'Devam Ediyor', 50000],
        ['Proje 2', 'Tamamlandı', 75000],
      ],
    },
  ]}
  exportFilename="projeler.xlsx"
/>
```

#### Excel Servisi
```ts
import { excelService } from '@/services/excel.service';

// Excel oku
const sheets = await excelService.readExcel(file);

// CSV oku
const data = await excelService.readCSV(file);

// Excel oluştur ve indir
await excelService.exportToExcel([
  {
    sheetName: 'Sayfa 1',
    headers: ['Başlık 1', 'Başlık 2'],
    rows: [['Veri 1', 'Veri 2']],
  },
], 'dosya.xlsx');

// Proje dışa aktar
await excelService.exportProject(project);
```

---

## 🖨️ Yazdırma & PDF {#yazdirma-pdf}

### Özellikler
- ✅ HTML'den PDF oluşturma
- ✅ Profesyonel rapor şablonları
- ✅ Proje raporu oluşturma
- ✅ Çoklu sayfa desteği
- ✅ Tarayıcı yazdırma

### Kullanım

#### Print Servisi
```ts
import { printService } from '@/services/print.service';

// Element'i PDF olarak kaydet
const element = document.getElementById('my-content');
await printService.exportToPDF(element, 'rapor.pdf', {
  title: 'Proje Raporu',
  orientation: 'portrait', // veya 'landscape'
});

// Proje raporu oluştur
await printService.exportProjectReport(project);

// Tarayıcı yazdırma
printService.print(element); // veya print() tüm sayfa için
```

---

## 🎤 Ses Girişi {#ses-girisi}

### Özellikler
- ✅ Mikrofon ile ses tanıma
- ✅ Türkçe ses tanıma desteği
- ✅ Otomatik sayı çıkarma
- ✅ Fiyat girişi için optimize edilmiş

### Kullanım

#### Voice Input Component
```tsx
import { VoiceInput } from '@/components/features/VoiceInput';

<VoiceInput
  onResult={(value) => {
    console.log('Tanınan değer:', value);
    // Örnek: 150.50
  }}
  placeholder="Fiyatı söyle"
/>
```

#### Speech Servisi
```ts
import { speechService } from '@/services/speech.service';

// Ses tanıma desteğini kontrol et
if (speechService.isSupported()) {
  // Dinlemeyi başlat
  await speechService.startListening(
    (text) => {
      console.log('Tanınan metin:', text);
      const number = speechService.extractNumber(text);
      console.log('Çıkarılan sayı:', number);
    },
    (error) => {
      console.error('Hata:', error);
    }
  );
}

// Dinlemeyi durdur
speechService.stopListening();
```

### Desteklenen Format Örnekleri
- "Yüz elli lira" → 150
- "İki yüz otuz beş" → 235
- "150,50" → 150.5
- "Bin beş yüz" → 1500

---

## 📋 Gelişmiş Tablo Düzenleyici {#gelismis-tablo-duzenleyici}

### Özellikler
- ✅ Excel benzeri grid arayüzü
- ✅ Klavye navigasyonu (Arrow keys, Tab, Enter)
- ✅ Satır/sütun ekleme-silme
- ✅ Hücre düzenleme (inline editing)
- ✅ Otomatik toplam hesaplama
- ✅ Fiyat sütunları (yeşil highlight)
- ✅ Farklı veri tipleri (text, number, currency, date)

### Kullanım

```tsx
import { DataGrid, GridColumn, GridRow } from '@/components/features/DataGrid';

function MyTable() {
  const [columns, setColumns] = useState<GridColumn[]>([
    { id: 'name', header: 'Ürün Adı', type: 'text' },
    { id: 'qty', header: 'Adet', type: 'number' },
    { id: 'price', header: 'Fiyat', type: 'currency', isPrice: true },
  ]);

  const [rows, setRows] = useState<GridRow[]>([
    {
      id: 'row1',
      cells: { name: 'Ürün 1', qty: 5, price: 100 },
    },
  ]);

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      onChange={setRows}
      onColumnChange={setColumns}
      editable={true}
      showRowNumbers={true}
      autoCalculateVAT={true}
    />
  );
}
```

### Klavye Kısayolları
- **Enter**: Hücreyi düzenle / düzenlemeyi bitir
- **Tab**: Sonraki hücreye git
- **Arrow Keys**: Hücreler arası gezin
- **Delete/Backspace**: Hücre içeriğini sil
- **Escape**: Düzenlemeyi iptal et

---

## 💾 IndexedDB Yönetimi {#indexeddb-yonetimi}

### Yeni Store'lar
```ts
// Taramalar (OCR geçmişi)
await db.saveOCRScan({
  id: 'scan-123',
  timestamp: Date.now(),
  type: 'table', // 'table' | 'receipt' | 'text'
  data: tableData,
  imageData: base64Image, // opsiyonel
});

const scans = await db.getOCRScans(30); // Son 30 tarama

// Fotoğraf galerisi
await db.savePhoto({
  id: 'photo-123',
  projectId: 'project-456', // opsiyonel
  timestamp: Date.now(),
  imageData: base64Image,
  thumbnail: thumbnailBase64, // opsiyonel
  description: 'Proje fotoğrafı', // opsiyonel
});

const photos = await db.getPhotos('project-456');
```

---

## 🔧 Teknik Detaylar

### Yüklenen Paketler
```json
{
  "tesseract.js": "^5.x", // OCR motoru
  "exceljs": "^4.x", // Excel işlemleri
  "file-saver": "^2.x", // Dosya indirme
  "react-dropzone": "^14.x", // Drag & drop
  "html2canvas": "^1.x", // HTML to Canvas
  "jspdf": "^2.x" // PDF oluşturma
}
```

### Performans İpuçları
1. **OCR**: Büyük görseller OCR öncesi küçültülür (max 1920x1080)
2. **Excel**: Çok büyük dosyalar için stream API kullanılabilir
3. **IndexedDB**: Maksimum 30 tarama ve sınırsız fotoğraf saklar
4. **PDF**: Çok sayfalı belgeler için progressbar göster

### Tarayıcı Desteği
- **OCR**: Modern tarayıcılar (Chrome, Firefox, Safari)
- **Ses Tanıma**: Chrome, Edge (webkitSpeechRecognition)
- **Kamera**: HTTPS gerekli (localhost'ta HTTP çalışır)
- **IndexedDB**: Tüm modern tarayıcılar

---

## 📚 Daha Fazla Bilgi

Her servis ve component için TypeScript tip tanımlamaları mevcuttur.
IDE'nizde otomatik tamamlama ve tip kontrolü için IntelliSense kullanın.

### Örnek Proje Kullanımı

```tsx
// Ana uygulamada OCR Scanner kullanımı
import { OCRScanner } from '@/components/features/OCRScanner';
import { excelService } from '@/services/excel.service';
import { printService } from '@/services/print.service';

function App() {
  const handleTableExtracted = async (data) => {
    // 1. Tablo verisini işle
    console.log('Tablo verileri:', data);

    // 2. Excel'e kaydet
    await excelService.exportToExcel([
      {
        sheetName: 'Taranan Veri',
        headers: data.headers,
        rows: data.rows,
      },
    ], 'tarama.xlsx');

    // 3. IndexedDB'ye kaydet
    await db.saveOCRScan({
      id: `scan-${Date.now()}`,
      timestamp: Date.now(),
      type: 'table',
      data,
    });
  };

  return (
    <OCRScanner
      isOpen={true}
      onClose={() => {}}
      onTableExtracted={handleTableExtracted}
      mode="table"
    />
  );
}
```

---

## 🐛 Bilinen Sorunlar & Çözümler

### OCR Doğruluğu
- **Sorun**: Düşük çözünürlüklü veya bulanık görsellerde hata
- **Çözüm**: En az 300 DPI çözünürlük, iyi aydınlatma

### Tarayıcı İzinleri
- **Sorun**: Kamera/mikrofon erişimi reddedildi
- **Çözüm**: HTTPS kullanın, izinleri kontrol edin

### Performans
- **Sorun**: Büyük Excel dosyaları yavaş
- **Çözüm**: Dosya boyutunu sınırla, progressbar göster

---

## 📞 Destek

Sorularınız için:
- GitHub Issues: [proje-repo-link]
- Geliştirici: ST HİLLMAN (@st.hillman)

---

**Son Güncelleme**: ${new Date().toLocaleDateString('tr-TR')}
**Versiyon**: 2.0.0
