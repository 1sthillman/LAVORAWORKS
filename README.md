# 🚀 Lavora Workflow - Modern İş Akışı Yönetim Uygulaması

> **v2.0** - React + TypeScript + Vite ile tamamen yeniden yazıldı

Lavora Design için geliştirilmiş modern, profesyonel proje ve iş akışı yönetim uygulaması.

## ✨ Özellikler

### 🎯 Temel Özellikler
- ✅ **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- 📊 **Proje Yönetimi**: Kapsamlı proje takibi ve ilerleme izleme
- 🔄 **İş Akışı Takibi**: Aşamalı iş akışı yönetimi
- 💰 **Masraf Defteri**: Gelir-gider takibi ve KDV hesaplamaları
- 📱 **Responsive Tasarım**: Tüm cihazlarda mükemmel çalışır
- 🌙 **Dark Mode**: Otomatik tema desteği
- 💾 **Offline Çalışma**: IndexedDB ile yerel veri saklama
- 🎨 **Modern UI/UX**: Smooth animasyonlar ve kullanıcı dostu arayüz

### 🔥 Yeni Özellikler (v2.0)

#### 📷 OCR & Fotoğraf İşlemleri (API Ninjas - Self-Healing)
- ✅ **4 API Key Havuzu**: Otomatik yedekleme sistemi
- ✅ **Sıfır Kesinti**: Bir key limit aşarsa diğerine geçer
- ✅ **Ultra Hızlı**: 2-5 saniye (Tesseract'ten 6x hızlı)
- ✅ **Otomatik Sıkıştırma**: Görsel 200KB altına düşürülür
- ✅ **Akıllı Tablo Algılama**: Koordinat bazlı satır-sütun gruplandırma
- ✅ **Fatura/Fiş Tanıma**: Toplam, KDV, ürün listesi otomatik çıkarma
- ✅ **Kamera Entegrasyonu**: Ön/arka kamera desteği
- ✅ **Drag & Drop**: Sürükle-bırak ile fotoğraf yükleme
- ✅ **Tarama Geçmişi**: Son 30 tarama IndexedDB'de

#### 📊 Excel İşlemleri
- ✅ **Excel Okuma**: .xlsx, .xls, .csv desteği
- ✅ **Excel Yazma**: Çoklu sayfa ve profesyonel stil
- ✅ **Otomatik Formatlar**: Header, border, sütun genişlikleri
- ✅ **CSV Import/Export**: Hızlı veri aktarımı
- ✅ **Proje Export**: Tek tıkla proje verilerini Excel'e aktar

#### 🖨️ Yazdırma & PDF
- ✅ **PDF Oluşturma**: html2canvas + jsPDF entegrasyonu
- ✅ **Profesyonel Şablonlar**: Hazır rapor formatları
- ✅ **Proje Raporları**: Detaylı proje özeti raporları
- ✅ **Çoklu Sayfa**: Uzun içerik için otomatik sayfalama

#### 🎤 Ses Girişi
- ✅ **Mikrofon Desteği**: Web Speech API
- ✅ **Türkçe Tanıma**: "Yüz elli lira" → 150
- ✅ **Akıllı Sayı Çıkarma**: Otomatik fiyat dönüşümü

#### 📋 Gelişmiş Tablo Düzenleyici
- ✅ **Excel-like Grid**: Profesyonel tablo düzenleyici
- ✅ **Klavye Navigasyonu**: Arrow keys, Tab, Enter
- ✅ **Inline Düzenleme**: Hücre içi hızlı düzenleme
- ✅ **Otomatik Hesaplama**: Sütun toplamları
- ✅ **Fiyat Highlighting**: Yeşil vurgulu fiyat sütunları

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📁 Proje Yapısı

```
src/
├── components/          # React componentleri
│   ├── ui/             # Temel UI componentleri (Button, Card, Modal, vb.)
│   ├── layout/         # Layout componentleri (Header, Navigation)
│   ├── projects/       # Proje ile ilgili componentler
│   ├── workflow/       # İş akışı componentleri
│   └── ledger/         # Defter componentleri
├── hooks/              # Custom React hooks
├── lib/                # Utility fonksiyonlar ve servisler
│   ├── db.ts          # IndexedDB servisi
│   └── utils.ts       # Yardımcı fonksiyonlar
├── store/              # Zustand state management
│   ├── useAppStore.ts      # Genel uygulama state'i
│   └── useProjectStore.ts  # Proje state'i
├── types/              # TypeScript tip tanımlamaları
├── assets/             # Statik dosyalar (resimler, fontlar)
├── App.tsx             # Ana uygulama component'i
├── main.tsx            # Giriş noktası
└── index.css           # Global stiller
```

## 🎨 Teknolojiler

- **Frontend Framework**: React 18
- **Type Safety**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Icons**: Lucide React
- **Database**: IndexedDB (local storage)
- **Excel Operations**: ExcelJS

## � Geliştirme

### Available Scripts

- `npm run dev` - Development server'ı başlat
- `npm run build` - Production build oluştur
- `npm run preview` - Production build'i önizle
- `npm run lint` - Linting kontrolü

### Code Style

Proje TypeScript strict mode ile yapılandırılmıştır ve modern React best practices kullanır.

## 📝 Özellik Roadmap

### ✅ Tamamlanan Özellikler
- [x] Modern framework'e geçiş (React + TypeScript)
- [x] State management (Zustand)
- [x] IndexedDB entegrasyonu
- [x] Dark mode desteği
- [x] Responsive tasarım
- [x] Proje yönetimi
- [x] İş akışı takibi
- [x] Masraf defteri
- [x] **📷 OCR & Fotoğraf İşlemleri** (Yeni! ✨)
  - [x] Kamera ile fotoğraf çekme
  - [x] OCR ile fotoğraftan metin tanıma
  - [x] Fotoğraftan tablo çıkarma
  - [x] Fatura/fiş tanıma
- [x] **📊 Excel İşlemleri** (Yeni! ✨)
  - [x] Excel dosya okuma (.xlsx, .xls, .csv)
  - [x] Excel'e aktarma
  - [x] Çoklu sayfa desteği
- [x] **🖨️ Yazdırma & PDF** (Yeni! ✨)
  - [x] Proje raporları PDF olarak kaydetme
  - [x] Yazdırma önizleme
  - [x] Profesyonel rapor şablonları
- [x] **🎤 Ses Girişi** (Yeni! ✨)
  - [x] Mikrofon ile fiyat girişi
  - [x] Türkçe ses tanıma
  - [x] Otomatik sayı çıkarma

### 🚧 Devam Eden Özellikler
- [ ] Excel tablolarını düzenleme (grid editor)
- [ ] Fotoğraf galerisi yönetimi
- [ ] Takvim görünümü

### 📋 Planlanan Özellikler
- [ ] Backend API entegrasyonu
- [ ] Kullanıcı kimlik doğrulama
- [ ] Takım çalışması özellikleri
- [ ] Gelişmiş raporlama ve analizler
- [ ] Bildirim sistemi
- [ ] PWA özellikleri
- [ ] Kanban board görünümü
- [ ] Gantt chart timeline
- [ ] Mobil uygulama (React Native)

## 👨‍💻 Geliştirici

**ST HİLLMAN** (@st.hillman)

## 📄 Lisans

© 2024 Lavora Design - Tüm hakları saklıdır

---

**Not**: Bu proje v1'den (Vanilla JS) v2'ye (React + TypeScript) geçiş yapılarak tamamen yeniden yazılmıştır. Eski HTML dosyaları referans olarak saklanmıştır.


---

## 🔥 Firebase Entegrasyonu (HAZIR - Otomatik!)

### 🎯 Tek Tık ile Kullan!

**Canlı Site:** https://1sthillman.github.io/LAVORAWORKS/

**Artık Firebase otomatik yüklü!** ✅

### Yapman Gereken TEK ŞEY:

1. ✅ Yukarıdaki linki aç
2. ✅ "Google ile Giriş" butonuna tık
3. ✅ Kullanmaya başla!

**Hiçbir Firebase bilgisine ihtiyacın yok!** 🚀

### 🎭 Otomatik Roller

- 👑 **İlk giren** = ADMIN (sen)
- 🔥 **Partner** = Her şeyi görebilir
- 👷 **Çalışan** = Sadece iş akışı (FİYAT GÖREMEZ)
- 👤 **Müşteri** = Proje kodu ile kendi projesi

### 🔒 Otomatik Güvenlik

- ✅ Çalışan fiyatları **ASLA** göremez
- ✅ Müşteri sadece kendi projesini görebilir
- ✅ Çoklu cihaz senkronizasyonu
- ✅ Offline çalışma

### 📱 Her Cihazda Çalışır

- ✅ Bilgisayar
- ✅ Tablet
- ✅ Telefon
- ✅ Offline (internet kesilse bile)

---

## 📖 Basit Rehber

**Hızlı başlangıç:** [`BASIT_KULLANIM_REHBERI.md`](BASIT_KULLANIM_REHBERI.md)

**Detaylı bilgi (isteğe bağlı):**
- Firebase ayarları: [`FIREBASE_CONSOLE_AYARLARI.md`](FIREBASE_CONSOLE_AYARLARI.md)
- Teknik detaylar: `html/` klasörü

---

### 📦 İki Sürüm Mevcut

#### 1️⃣ React Sürüm (Şu Anki - v2.0)
- ✅ Modern React + TypeScript
- ✅ Tek kullanıcı
- ✅ Offline çalışma
- ✅ Hızlı ve responsive

#### 2️⃣ Firebase HTML Sürüm (Yeni - Test Aşamasında)
- 🔥 **Google ile giriş**
- 🔥 **Rol tabanlı erişim**: Admin/Partner/Çalışan/Müşteri
- 🔥 **Çoklu cihaz senkronizasyonu**
- 🔥 **Çalışan fiyat göremez** (Security Rules ile zorunlu)
- 🔥 **Müşteri portalı** (Proje kodu ile erişim)
- 🔥 **Offline + Bulut** (Local-first mimari)
- ⚠️ **Henüz test edilmedi!**

### 🎯 Hangisini Seçmeliyim?

| Özellik | React Sürüm | Firebase Sürüm |
|---------|-------------|----------------|
| Tek kullanıcı | ✅ İdeal | ✅ Çalışır |
| Ekip çalışması | ❌ | ✅ İdeal |
| Rol yönetimi | ❌ | ✅ Admin/Partner/Çalışan/Müşteri |
| Çalışan/fiyat ayrımı | ❌ | ✅ Security Rules ile zorunlu |
| Müşteri portalı | ❌ | ✅ Proje kodu sistemi |
| Çoklu cihaz sync | ❌ | ✅ Firebase Realtime DB |
| Offline çalışma | ✅ | ✅ Local-first |
| Kurulum kolaylığı | ✅ Çok kolay | ⚠️ Firebase setup gerekli |
| Test durumu | ✅ Kullanımda | ⚠️ Test edilmedi |

### 🚀 Firebase Sürümü Denemek İçin

```bash
# 1. Localhost'ta çalıştır
python -m http.server 8080

# 2. Tarayıcıda aç
http://localhost:8080/lavora-calisma-masasi-v38-firebase.html

# 3. Detaylı kurulum için:
# Bkz. FIREBASE_KURULUM_REHBERI.md
```

### 📁 Firebase Dosyaları

```
├── lavora-calisma-masasi-v38-firebase.html  # Firebase entegrasyonlu HTML
├── FIREBASE_KURULUM_REHBERI.md              # Kurulum rehberi (Türkçe)
└── html/                                     # Firebase dokümantasyon
    ├── database.rules.json                  # Security Rules taslağı
    ├── database.rules.test.js               # Güvenlik testleri
    ├── LAVORA_FIREBASE_MIMARI_VE_GUVENLIK_PLANI.md
    ├── LAVORA_KOD_GECIS_PLANI.md
    └── CHECKLIST_CANLIYA_GECIS.md
```

### 🔒 Firebase Güvenlik Özellikleri

- ✅ **Security Rules**: Sunucu tarafında zorunlu izinler
- ✅ **Çalışan fiyat göremez**: UI bypass yapılamaz
- ✅ **Müşteri izolasyonu**: Sadece kendi projeleri
- ✅ **Tek admin**: Diğerleri partner/çalışan/müşteri olabilir
- ✅ **Proje kodları**: Tek kullanımlık, yüksek entropili
- ✅ **Offline kuyruk**: Çevrimdışı kayıtlar senkronize olur

### ⚠️ Firebase Kullanmadan Önce

1. ✅ Firebase Emulator testlerini çalıştır: `npm run test:rules`
2. ✅ Gerçek admin UID'sini Firebase Console'dan al
3. ✅ `REPLACE_WITH_REAL_ADMIN_UID` placeholder'ını değiştir
4. ✅ Security Rules'ı Firebase'e deploy et
5. ✅ Test kullanıcı/projelerle dene
6. ⚠️ Gerçek veri ile kullanmadan önce yedek al

### 📞 Firebase Yardım

- **Kurulum**: [`FIREBASE_KURULUM_REHBERI.md`](FIREBASE_KURULUM_REHBERI.md)
- **Mimari**: `html/LAVORA_FIREBASE_MIMARI_VE_GUVENLIK_PLANI.md`
- **Geçiş Planı**: `html/LAVORA_KOD_GECIS_PLANI.md`
- **Checklist**: `html/CHECKLIST_CANLIYA_GECIS.md`
