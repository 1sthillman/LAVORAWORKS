# 🔥 Lavora Firebase Kurulum Rehberi

> **ÖNEMLİ:** Bu Firebase entegrasyonu **test edilmemiş taslak** durumdadır. Gerçek veri ile kullanmadan önce mutlaka test edilmelidir.

## 📋 Gereksinimler

- Firebase projesi (ücretsiz Spark planı yeterli)
- Google hesabı (OAuth için)
- Localhost veya HTTPS sunucu (file:// protokolü ile çalışmaz)
- Node.js 24.1+ (test için)
- Java (Firebase Emulator için)

## 🚀 Hızlı Başlangıç

### 1. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) → Yeni Proje
2. **Authentication** → Sign-in method → Google → Etkinleştir
3. **Realtime Database** → Create Database → Test modunda başlat
4. **Project Settings** → Your apps → Web app ekle
5. Config bilgilerini kaydet (sonra lazım olacak)

### 2. İlk Admin UID'sini Belirle

```bash
# Uygulamayı localhost'ta çalıştır
python -m http.server 8080
# Tarayıcıda aç: http://localhost:8080/lavora-calisma-masasi-v38-firebase.html
```

1. Firebase config'i gir (adminUid boş bırak)
2. Google ile giriş yap
3. Ekranda gösterilen UID'yi kopyala
4. `html/database.rules.json` dosyasında tüm `REPLACE_WITH_REAL_ADMIN_UID` değerlerini bu UID ile değiştir
5. Ayarlara tekrar gir, adminUid alanına bu UID'yi yaz

### 3. Security Rules'ı Test Et

```bash
cd html
npm install
npm run test:rules
```

**Tüm testler geçmeli!** Aksi halde canlıya geçme.

### 4. Rules'ı Firebase'e Deploy Et

Firebase Console → Realtime Database → Rules sekmesi → `html/database.rules.json` içeriğini kopyala yapıştır → Yayınla

### 5. Canlıya Geç

Artık https://1sthillman.github.io/LAVORAWORKS/ adresinde Firebase sürümünü kullanabilirsin.

## 🎭 Roller ve Yetkiler

| Rol | Erişim |
|-----|--------|
| **Admin** (tek kişi) | Her şey - projeler, fiyatlar, defter, fiş, kullanıcı yönetimi |
| **Partner** | Projeler, fiyatlar, defter, fiş (admin atayamaz) |
| **Employee (Çalışan)** | Sadece iş akışı - **FİYATLARI GÖREMEZ** |
| **Customer (Müşteri)** | Sadece kendi projeleri, proje kodu ile erişim |

## ⚠️ Güvenlik Uyarıları

1. **ASLA** `REPLACE_WITH_REAL_ADMIN_UID` placeholder'ını değiştirmeden deploy etme
2. **ASLA** Service Account key'ini HTML'e koyma
3. **DAIMA** önce Emulator'da test et
4. **DAIMA** gerçek admin UID'sini Firebase Console'dan doğrula
5. Çalışan fiyat verilerini **hiçbir zaman** göremez - bu Security Rules ile zorunlu kılınmıştır

## 📊 Veri Yapısı

```
/userProfiles/{uid}              - Kullanıcı profilleri
/orgs/{orgId}/members/{uid}      - Roller (admin/partner/employee/customer)
/orgs/{orgId}/projectIndex       - Proje listesi (FİYATSIZ)
/orgs/{orgId}/projectFinancials  - Fiyatlar (SADECE admin/partner)
/orgs/{orgId}/workflowStaff      - İş akışı (çalışan görebilir)
/orgs/{orgId}/ledger             - Defter (SADECE admin/partner)
/orgs/{orgId}/receipts           - Fişler (SADECE admin/partner)
/orgs/{orgId}/customerViews      - Müşteri görünümleri
```

## 🧪 Test Checklist

- [ ] Emulator testleri geçti
- [ ] Gerçek admin UID doğrulandı
- [ ] Rules deploy edildi
- [ ] Google OAuth çalışıyor
- [ ] Çalışan fiyat göremez
- [ ] Müşteri sadece kendi projelerini görür
- [ ] Offline kaydetme çalışıyor
- [ ] Senkronizasyon çalışıyor

## 📁 İlgili Dosyalar

- `lavora-calisma-masasi-v38-firebase.html` - Firebase entegrasyonlu HTML
- `html/database.rules.json` - Security Rules taslağı
- `html/database.rules.test.js` - Güvenlik testleri
- `html/LAVORA_FIREBASE_MIMARI_VE_GUVENLIK_PLANI.md` - Tam dokümantasyon
- `html/LAVORA_KOD_GECIS_PLANI.md` - Kod geçiş planı
- `html/CHECKLIST_CANLIYA_GECIS.md` - Canlıya geçiş kontrol listesi

## 🆘 Sorun Giderme

### "Firebase not initialized"
→ Config bilgilerini doğru girdin mi?

### "Permission denied"
→ Rules deploy edildi mi? Admin UID doğru mu?

### "Google OAuth popup blocked"
→ Tarayıcı popup engelini kaldır

### Testler başarısız
→ Node.js 24.12+ ve Java kurulu mu?

## 📞 Destek

Detaylı bilgi için `html/` klasöründeki markdown dosyalarına bak.
