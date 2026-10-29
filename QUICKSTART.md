# 🚀 Lavora Firebase - Hızlı Başlangıç

## 1️⃣ İlk Kurulum (Bir Kez)

### Dependencies Yükle
```bash
npm install
```

### Firebase CLI Giriş Yap
```bash
firebase login
```

## 2️⃣ Admin UID Ayarla (Zorunlu)

### Firebase Console'dan UID Al
1. https://console.firebase.google.com/project/lavoradesign-49ae4/authentication
2. Test kullanıcısı ile Google Sign-In yap
3. Users tablosundan UID'yi kopyala (örn: `Abc123XyZ...`)

### UID'yi Rules'a Yaz
```powershell
# PowerShell
$adminUid = "FIREBASE_CONSOLE_UID_BURAYA_YAPISTIR"
(Get-Content database.rules.json) -replace 'test_admin_uid_replace_in_production', $adminUid | Set-Content database.rules.json
```

Veya manuel olarak `database.rules.json` dosyasında tüm `test_admin_uid_replace_in_production` değerlerini bul-değiştir yap.

## 3️⃣ Test Et

### Security Rules Testleri
```bash
npm run test:rules
```

**Beklenen:** Tüm testler geçmeli ✅

## 4️⃣ HTML'i Çalıştır

### Seçenek A: Firebase Serve
```bash
npm run serve
```
Sonra: http://localhost:5000

### Seçenek B: Python HTTP Server
```bash
python -m http.server 8080
```
Sonra: http://localhost:8080/lavora-calisma-masasi-v38-firebase.html

## 5️⃣ İlk Giriş

1. Tarayıcıda HTML dosyasını aç
2. **Firebase / Admin Ayarları** ekranı gelecek
3. Firebase Web App Config gir:

```json
{
  "apiKey": "...",
  "authDomain": "lavoradesign-49ae4.firebaseapp.com",
  "databaseURL": "https://lavoradesign-49ae4-default-rtdb.firebaseio.com",
  "projectId": "lavoradesign-49ae4",
  "appId": "..."
}
```

Config'i Firebase Console → Project Settings → Your apps → Web app'den al.

4. `orgId`: `lavora-main` (veya istediğin)
5. `adminUid`: Rules'da ayarladığın UID
6. **Kaydet**
7. **Google ile giriş yap**

## 6️⃣ Production Deploy

### Rules Deploy
```bash
npm run deploy:rules
```

### HTML Deploy
```bash
npm run deploy:hosting
```

### Tam Deploy
```bash
npm run deploy
```

## ⚠️ Önemli Kontroller

### Testler Geçmeli
```bash
npm run test:rules
```

### Authorized Domains Ekli Olmalı
Firebase Console → Authentication → Settings → Authorized domains:
- `localhost` (test için)
- `lavoradesign-49ae4.web.app` (production)
- Kendi domain'in (varsa)

### Admin UID Doğru Olmalı
```powershell
# Kontrol et
Select-String -Path database.rules.json -Pattern "test_admin_uid"
```

Eğer bu komut sonuç dönüyorsa, UID henüz değiştirilmemiş!

## 🐛 Sorun Giderme

### Permission Denied
- Admin UID doğru mu?
- Rules deploy edildi mi?
- Google ile doğru hesapla giriş yapıldı mı?

### HTML Açılmıyor
- `file://` protokolü kullanma (Google OAuth çalışmaz)
- HTTP sunucu kullan (`npm run serve` veya Python)

### Emulator Testleri Başarısız
- Node.js kurulu mu? (`node --version`)
- Java kurulu mu? (`java --version`)
- `npm install` çalıştırıldı mı?

## 📚 Dokümantasyon

- **Mimari:** `html/LAVORA_FIREBASE_MIMARI_VE_GUVENLIK_PLANI.md`
- **Migration:** `html/LAVORA_KOD_GECIS_PLANI.md`
- **Checklist:** `html/CHECKLIST_CANLIYA_GECIS.md`
- **Setup:** `html/LAVORA_FIREBASE_HTML_KURULUM.md`

## 🔗 Bağlantılar

- **Firebase Console:** https://console.firebase.google.com/project/lavoradesign-49ae4
- **GitHub Repo:** https://github.com/1sthillman/LAVORAWORKFLOW

## ✅ Setup Scripti

```bash
# Tüm kontrolleri yap
.\firebase-setup.ps1
```

---

**İyi çalışmalar! 🚀**
