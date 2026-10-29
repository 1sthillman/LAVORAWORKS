# Lavora Design - Firebase HTML Projesi

HTML tabanlı Lavora çalışma masası uygulaması ile Firebase Realtime Database entegrasyonu.

## 📁 Proje Yapısı

```
c:\lavoraworklow\
├── lavora-calisma-masasi-v38-firebase.html  ← Ana HTML dosyası (Firebase entegreli)
├── database.rules.json                      ← Firebase Security Rules
├── database.rules.test.js                   ← Security Rules testleri
├── firebase.json                            ← Firebase yapılandırması
├── firebase.emulator.json                   ← Emulator yapılandırması
├── .firebaserc                              ← Firebase proje ID
└── html/                                    ← Referans dosyalar ve dokümantasyon
    ├── lavora-calisma-masasi-v38-firebase.html
    ├── database.rules.json
    ├── database.rules.test.js
    ├── LAVORA_FIREBASE_MIMARI_VE_GUVENLIK_PLANI.md
    ├── LAVORA_KOD_GECIS_PLANI.md
    ├── CHECKLIST_CANLIYA_GECIS.md
    └── README_TESTS.md
```

## 🚀 Hızlı Başlangıç

### 1. Kurulum

```bash
# Dependencies yükle
npm install

# Firebase CLI login
firebase login
```

### 2. Firebase Security Rules Testleri

```bash
# Testleri çalıştır (ÖNEMLİ!)
npm run test:rules

# Emulator başlat (manuel test için)
npm run emulator
```

### 3. HTML Dosyasını Çalıştır

```bash
# Firebase hosting ile serve et
npm run serve
```

Veya basit HTTP sunucu:

```powershell
# Python ile
python -m http.server 8080

# Node.js http-server ile
npx http-server -p 8080
```

Sonra tarayıcıda: `http://localhost:8080/lavora-calisma-masasi-v38-firebase.html`

## ⚠️ ÖNEMLİ: Admin UID Ayarı

`database.rules.json` dosyasında **TÜM** `REPLACE_WITH_REAL_ADMIN_UID` değerlerini gerçek Firebase Auth UID ile değiştirin:

```powershell
# PowerShell ile toplu değiştirme
$adminUid = "GERÇEK_FIREBASE_AUTH_UID_BURAYA"
(Get-Content database.rules.json) -replace 'REPLACE_WITH_REAL_ADMIN_UID', $adminUid | Set-Content database.rules.json
```

Admin UID'yi almak için:
1. Firebase Console → Authentication
2. Test kullanıcısı ile Google Sign-In yap
3. Users tablosundan UID'yi kopyala

## 🔐 Güvenlik Kuralları

### Roller ve İzinler

| Rol | Erişim |
|-----|--------|
| **Admin** | Tüm verilere tam erişim, kullanıcı yönetimi |
| **Partner** | İşletme verileri (finans dahil), kullanıcı yönetimi hariç |
| **Employee** | Sadece iş akışı, finans verilerine ERİŞİM YOK |
| **Customer** | Sadece kendisine atanan projeler |

### Kritik Güvenlik Prensipleri

- ✅ Firebase Security Rules son güvenlik kapısıdır
- ✅ Çalışan finans verilerine **asla** erişemez
- ✅ Her rol için sunucu tarafı (Rules) kontrol
- ❌ UI/CSS ile gizleme güvenlik sağlamaz
- ❌ `localStorage.role` değerine güvenme

## 🧪 Test Senaryoları

```bash
# Security Rules testlerini çalıştır
npm run test:rules
```

Test edilmesi gereken kritik senaryolar:
- ✅ Çalışan `projectFinancials` okuyamaz
- ✅ Çalışan `ledger` okuyamaz
- ✅ Çalışan `receipts` okuyamaz
- ✅ Müşteri başka müşterinin projesini göremez
- ✅ Partner admin rolü atayamaz

## 📦 Firebase Deployment

### Security Rules Deploy

```bash
# Önce testleri çalıştır
npm run test:rules

# Rules deploy et
npm run deploy:rules
```

### HTML Hosting Deploy

```bash
# HTML dosyasını hosting'e deploy et
npm run deploy:hosting
```

### Tam Deploy

```bash
# Her şeyi deploy et
npm run deploy
```

## 📚 Dokümantasyon

HTML klasöründeki referans dökümanlar:

1. **LAVORA_FIREBASE_MIMARI_VE_GUVENLIK_PLANI.md**
   - Local-first mimari
   - Rol tabanlı veri ayrımı
   - Veri şeması
   - Güvenlik ilkeleri

2. **LAVORA_KOD_GECIS_PLANI.md**
   - Migration stratejisi
   - Servis katmanı
   - Sync Engine
   - Çakışma yönetimi

3. **CHECKLIST_CANLIYA_GECIS.md**
   - Production checklist
   - Test senaryoları
   - Deployment adımları

4. **README_TESTS.md**
   - Emulator test kurulumu
   - Test çalıştırma

## 🔄 Firebase Config

HTML dosyasında Firebase yapılandırması:

```javascript
// Browser'da açıldığında ayarlar ekranı gelir
// Firebase Console'dan aldığın config'i gir:
{
  "apiKey": "...",
  "authDomain": "lavoradesign-49ae4.firebaseapp.com",
  "databaseURL": "https://lavoradesign-49ae4-default-rtdb.firebaseio.com",
  "projectId": "lavoradesign-49ae4",
  "appId": "..."
}
```

Config localStorage'da `lavora.cloud.config.v1` anahtarında saklanır.

## 🐛 Sorun Giderme

### Permission Denied
- Firebase Rules Simulator kullan (Firebase Console)
- Auth state kontrol et
- Admin UID doğru mu?
- Role membership doğru mu?

### Emulator Testleri Başarısız
- `database.rules.json` syntax hatası?
- Admin UID placeholder olarak kaldı mı?
- Node.js ve Java kurulu mu?

### HTML Dosyası Açılmıyor
- `file://` protokolü ile açma (Google OAuth çalışmaz)
- HTTP sunucu kullan (`npm run serve` veya `python -m http.server`)
- Authorized domains Firebase Console'da ekli mi?

## 📝 Notlar

- Bu proje HTML tabanlıdır, React/Vue/Angular değil
- Firebase SDK tarayıcıdan yüklenir (CDN)
- IndexedDB offline storage için kullanılır
- Tüm Firebase işlemleri client-side'da gerçekleşir
- Security Rules server-side güvenliği sağlar

## 🔗 Bağlantılar

- **Firebase Console:** https://console.firebase.google.com/project/lavoradesign-49ae4
- **Firebase Documentation:** https://firebase.google.com/docs
- **Security Rules Reference:** https://firebase.google.com/docs/database/security

---

**Proje Tipi:** HTML + Vanilla JavaScript + Firebase  
**Son Güncelleme:** 2026-10-29  
**Durum:** ✅ Rules ve testler hazır, production'a hazır değil (Admin UID ayarlanmalı)
