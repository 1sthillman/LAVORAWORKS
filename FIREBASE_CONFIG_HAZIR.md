# 🔥 Firebase Config Hazır!

## ✅ Senin Firebase Config'in

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAO7UomC_1wv-1lMEuDD6Z5lvzy3coZH_M",
  authDomain: "lavoradesign-49ae4.firebaseapp.com",
  databaseURL: "https://lavoradesign-49ae4-default-rtdb.firebaseio.com",
  projectId: "lavoradesign-49ae4",
  storageBucket: "lavoradesign-49ae4.firebasestorage.app",
  messagingSenderId: "78076586593",
  appId: "1:78076586593:web:24e0cc4219d73d25471820",
  measurementId: "G-Z9LH4NPWRD"
};
```

## 🚀 Şimdi Ne Yapmalısın?

### ADIM 1: HTML Dosyasını Aç

```bash
# Workspace'de:
python -m http.server 8080

# Tarayıcıda:
http://localhost:8080/lavora-calisma-masasi-v38-firebase.html
```

### ADIM 2: İlk Giriş ve Config Ayarı

1. ⚙️ **Ayarlar** butonuna tık (sağ üstte)
2. 📋 **Firebase Yapılandırması** bölümüne aşağıdaki bilgileri gir:

```
API Key: AIzaSyAO7UomC_1wv-1lMEuDD6Z5lvzy3coZH_M
Auth Domain: lavoradesign-49ae4.firebaseapp.com
Database URL: https://lavoradesign-49ae4-default-rtdb.firebaseio.com
Project ID: lavoradesign-49ae4
App ID: 1:78076586593:web:24e0cc4219d73d25471820
```

3. 🏢 **Org ID**: `lavora-main` (veya istediğin bir ad)
4. 👤 **Admin UID**: Şimdilik **BOŞ BIRAK**
5. 💾 **Kaydet**

### ADIM 3: Google ile Giriş Yap

1. 🔐 **Google ile Giriş** butonuna tık
2. Google hesabını seç
3. ✅ Giriş başarılı olunca ekranda **UID göreceksin** (örn: `xYz123aBc...`)
4. 📋 Bu UID'yi **KOPYALA** - bu senin benzersiz kimliğin

### ADIM 4: Admin UID'sini Kaydet

1. ⚙️ Tekrar **Ayarlar**'a git
2. 👤 **Admin UID** alanına kopyaladığın UID'yi **YAPIŞTIR**
3. 💾 **Kaydet**
4. 🔄 Sayfayı yenile

### ADIM 5: Security Rules'ı Hazırla

Şimdi `html/database.rules.json` dosyasını düzenle:

```bash
# Dosyayı aç:
code html/database.rules.json

# Bul ve değiştir:
REPLACE_WITH_REAL_ADMIN_UID → [Senin UID'in]
```

**VEYA** otomatik değiştir:

```bash
# PowerShell'de:
cd html
$uid = "BURAYA_SENIN_UID_YAZ"
(Get-Content database.rules.json) -replace 'REPLACE_WITH_REAL_ADMIN_UID', $uid | Set-Content database.rules.json
```

### ADIM 6: Rules'ı Test Et

```bash
cd html
npm run test:rules
```

**Tüm testler geçmeli!** ✅

### ADIM 7: Rules'ı Firebase'e Deploy Et

1. [Firebase Console](https://console.firebase.google.com/) → Proje: **lavoradesign-49ae4**
2. **Realtime Database** → **Rules** sekmesi
3. `html/database.rules.json` dosyasının tüm içeriğini **KOPYALA**
4. Firebase Console'daki kutu

na **YAPIŞTIR**
5. **Publish** (Yayınla) butonuna tık

### ADIM 8: İlk Kullanıcı Ekle

Artık adminsin! Yeni kullanıcılar eklemeye hazırsın:

1. 👥 Birisi Google ile giriş yaptığında **"Beklemede"** statüsünde görünecek
2. Sen **Kullanıcılar** ekranından rollerini atayabilirsin:
   - 🔥 **Partner**: Senin gibi her şeyi görebilir (admin atayamaz)
   - 👷 **Çalışan**: Sadece iş akışı (FİYAT GÖREMEZ)
   - 👤 **Müşteri**: Proje kodu ile kendi projesini görebilir

---

## 🎯 Önemli Bilgiler

### Firebase Console Adresleri

- **Ana Dashboard**: https://console.firebase.google.com/project/lavoradesign-49ae4
- **Authentication**: https://console.firebase.google.com/project/lavoradesign-49ae4/authentication
- **Realtime Database**: https://console.firebase.google.com/project/lavoradesign-49ae4/database
- **Usage & Billing**: https://console.firebase.google.com/project/lavoradesign-49ae4/usage

### Güvenlik Kontrolleri

✅ **Authentication → Sign-in method**
- Google provider etkin mi?
- Authorized domains: `localhost`, `127.0.0.1`, ve **canlı domain'in**

✅ **Realtime Database → Rules**
- `REPLACE_WITH_REAL_ADMIN_UID` kaldı mı? (Kalmamalı!)
- Test tarih sonu: 30+ gün sonra olmalı

✅ **Realtime Database → Data**
- Henüz boş olmalı (ilk kullanıma hazır)

### Roller ve İzinler

| Rol | Projeler | Fiyatlar | Defter | İş Akışı | Kullanıcı Yönetimi |
|-----|----------|----------|--------|----------|-------------------|
| **Admin** (Sen) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Partner** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Çalışan** | 📋 Özet | ❌ ASLA | ❌ | ✅ | ❌ |
| **Müşteri** | 👁️ Sadece Kendisi | ❌ | ❌ | 👁️ Özet | ❌ |

---

## 🧪 Test Senaryoları

### Test 1: Admin Girişi ✅
1. Google ile giriş yap
2. Tüm menüleri görebiliyor musun? (Projeler, Defter, İş Akışı)
3. Ayarlar → Kullanıcılar menüsü var mı?

### Test 2: Yeni Proje Oluştur 📝
1. Projeler → Yeni Proje
2. Ad, müşteri, fiyat bilgileri gir
3. Kaydet
4. Firebase Console'da Data sekmesinde göründü mü?

### Test 3: Çalışan Testi 👷
1. Başka bir Google hesabıyla giriş yap
2. Admin hesabından bu kullanıcıyı **Çalışan** rolüne ata
3. Çalışan hesabında:
   - ❌ Fiyatları görebiliyor mu? (Görmemeli!)
   - ❌ Defter menüsü var mı? (Olmamalı!)
   - ✅ İş Akışı menüsü var mı? (Olmalı!)

### Test 4: Offline Kaydetme 💾
1. DevTools (F12) → Network → Offline mod
2. Yeni proje oluştur veya düzenle
3. Kaydet
4. Online'a geç
5. Firebase'e senkronize oldu mu?

---

## ⚠️ Sorun Giderme

### "Firebase not initialized"
→ Config bilgilerini kontrol et, boş alan var mı?

### "Permission denied"
→ Rules deploy edildi mi? Admin UID doğru mu?

### "Google OAuth popup blocked"
→ Tarayıcı popup engelini kaldır

### Çalışan fiyat görebiliyor
→ **BÜYÜK SORUN!** Rules test et: `npm run test:rules`

### Testler başarısız
→ Node.js 24+ ve Java kurulu mu?

---

## 📞 İleri Adımlar

### Bu Hafta
- [x] Firebase projesi oluşturuldu ✅
- [x] Config alındı ✅
- [ ] Localhost'ta test et
- [ ] Admin UID'sini belirle
- [ ] Rules'ı deploy et

### Gelecek Hafta
- [ ] 2-3 test kullanıcısı ekle (partner, çalışan)
- [ ] Birkaç gerçek proje oluştur
- [ ] Roller doğru çalışıyor mu kontrol et
- [ ] Offline/online sync test et

### Ayın Sonuna Kadar
- [ ] Eski HTML'deki verileri taşı (migration)
- [ ] Production domain ekle (Authorized domains)
- [ ] GitHub Pages'e deploy et
- [ ] Tüm ekibe duyur

---

## 🎉 Tebrikler!

Firebase config'in hazır! Şimdi yukarıdaki adımları takip et ve kendi Firebase destekli, rol tabanlı, çoklu kullanıcılı Lavora sistemini kullanmaya başla! 🚀

**Sorun olursa:** Yukarıdaki "Sorun Giderme" bölümüne bak veya `FIREBASE_KURULUM_REHBERI.md` dosyasını oku.
