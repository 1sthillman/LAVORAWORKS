# Changelog

Tüm önemli değişiklikler bu dosyada belgelenecektir.

## [2.0.0] - 2024-01-XX

### 🎉 Büyük Güncelleme: Modern Stack + HTML Özellikleri Entegrasyonu

#### ✨ Yeni Özellikler

##### 📷 OCR & Fotoğraf İşlemleri
- **Kamera entegrasyonu**: Ön/arka kamera desteği
- **OCR motor**: Tesseract.js ile Türkçe metin tanıma
- **Fotoğraftan tablo çıkarma**: Otomatik tablo algılama
- **Fatura/fiş tanıma**: Akıllı fatura okuma
- **Drag & drop**: Sürükle-bırak ile fotoğraf yükleme
- **Tarama geçmişi**: IndexedDB'de son 30 tarama

##### 📊 Excel İşlemleri
- **Excel okuma**: .xlsx, .xls, .csv desteği
- **Excel yazma**: Çoklu sayfa ve stil desteği
- **Otomatik formatlar**: Header, border, sütun genişlikleri
- **CSV import/export**: Hızlı veri aktarımı
- **Proje export**: Tek tıkla proje verilerini Excel'e aktar

##### 🖨️ Yazdırma & PDF
- **PDF oluşturma**: html2canvas + jsPDF entegrasyonu
- **Profesyonel şablonlar**: Hazır rapor formatları
- **Proje raporları**: Detaylı proje özeti raporları
- **Çoklu sayfa**: Uzun içerik için otomatik sayfalama
- **Yazdırma önizleme**: Tarayıcı native print dialog

##### 🎤 Ses Girişi
- **Mikrofon desteği**: Web Speech API entegrasyonu
- **Türkçe tanıma**: Yerelleştirilmiş ses tanıma
- **Akıllı sayı çıkarma**: "Yüz elli lira" → 150
- **Fiyat girişi**: Hızlı veri girişi için optimize edilmiş

##### 📋 Gelişmiş Tablo Düzenleyici
- **Excel-like grid**: Profesyonel tablo düzenleyici
- **Klavye navigasyonu**: Arrow keys, Tab, Enter
- **Inline düzenleme**: Hücre içi hızlı düzenleme
- **Otomatik hesaplama**: Sütun toplamları
- **Fiyat highlighting**: Yeşil vurgulu fiyat sütunları
- **Satır/sütun yönetimi**: Dinamik ekleme-silme

##### 💾 IndexedDB Genişletmesi
- **Scans store**: OCR tarama geçmişi
- **Photos store**: Fotoğaf galerisi
- **Versiyon 2**: Otomatik migration

#### 🔧 Teknik İyileştirmeler
- React 18 + TypeScript
- Vite build tool
- Zustand state management
- TanStack React Query
- Tailwind CSS
- ExcelJS entegrasyonu
- Tesseract.js OCR motoru
- html2canvas + jsPDF
- react-dropzone
- Web Speech API

#### 📦 Yeni Bağımlılıklar
```json
{
  "tesseract.js": "^5.0.0",
  "exceljs": "^4.3.0",
  "file-saver": "^2.0.5",
  "react-dropzone": "^14.2.3",
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.1"
}
```

#### 🐛 Düzeltmeler
- Modal component'e className prop eklendi
- TypeScript strict mode hataları düzeltildi
- OCR servisinde Tesseract.js tip uyumsuzlukları giderildi
- IndexedDB version migration iyileştirildi

#### 📝 Dokümantasyon
- `FEATURES_DOCUMENTATION.md` eklendi
- Tüm yeni özellikler için kullanım örnekleri
- TypeScript tip tanımlamaları
- API referansları

#### ⚡ Performans
- Build size: ~368KB gzipped
- Lazy loading desteği
- OCR için görsel optimizasyonu
- IndexedDB indexleme iyileştirmeleri

### 🚧 Bilinen Sorunlar
- Büyük Excel dosyaları (>10MB) yavaş olabilir
- OCR düşük kaliteli görsellerde hatalı olabilir
- Ses tanıma sadece Chrome/Edge'de çalışır
- Kamera erişimi HTTPS gerektirir

### 📋 Gelecek Sürümler İçin Planlar
- [ ] Excel grid editor iyileştirmeleri
- [ ] Fotoğraf galerisi UI
- [ ] Takvim görünümü
- [ ] Backend API entegrasyonu
- [ ] PWA özellikleri
- [ ] Mobil uygulama

---

## [1.0.0] - 2024-XX-XX

### ✨ İlk Sürüm (Vanilla JS)
- Temel proje yönetimi
- İş akışı takibi
- Masraf defteri
- Dark mode
- LocalStorage veri saklama

---

**Not**: Bu proje [Semantic Versioning](https://semver.org/) kullanır.
