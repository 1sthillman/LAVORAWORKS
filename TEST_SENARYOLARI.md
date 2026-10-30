# 🧪 LAVORA FIREBASE - KAPSAMLI TEST SENARYOLARI

## 📋 Test Önce Hazırlık

### 1. Tarayıcı Hazırlığı
```
1. Chrome DevTools aç (F12)
2. Console sekmesine geç
3. Network sekmesini hazır tut
4. Application → Storage → Clear site data (cache temizle)
```

### 2. Firebase Console Hazırlığı
```
Database: https://console.firebase.google.com/project/lavoradesign-49ae4/database/lavoradesign-49ae4-default-rtdb/data/orgs/lavora-main
```

### 3. Test URL'leri
```
Ana App: https://lavoradesign-49ae4.web.app/lavora-calisma-masasi-v38-firebase.html
UID Check: https://lavoradesign-49ae4.web.app/get-my-uid.html
```

---

## 🎯 TEST 1: GİRİŞ VE YETKİLENDİRME

### Test 1.1: Google ile Giriş
**Adımlar:**
1. Ana app'i aç
2. "Google ile devam et" butonuna tıkla
3. Hesap seç

**Beklenen Sonuç:**
- ✅ Popup açılmalı (veya redirect olmalı)
- ✅ Hesap seçimi gösterilmeli
- ✅ Giriş başarılı olmalı
- ✅ Kullanıcı adı görünmeli

**Console Kontrol:**
```javascript
// Console'da çalıştır:
firebase.auth().currentUser.uid
// Sonuç: "d03bSvP9kOY51iRg4GRY87StV1j1" olmalı
```

**Hata Senaryoları:**
- ❌ "fin is not defined" → BU DÜZELTİLDİ
- ❌ "Cross-Origin-Opener-Policy" → Popup kapatılamıyor
- ❌ "Permission denied" → Admin yetkisi yok

### Test 1.2: Session Kalıcılığı
**Adımlar:**
1. Giriş yap
2. Tarayıcıyı KAPAT
3. Tarayıcıyı AÇ
4. App'i tekrar aç

**Beklenen Sonuç:**
- ✅ Otomatik giriş yapılmalı
- ✅ Tekrar giriş GEREKTIRMEMELI

---

## 🎯 TEST 2: PROJE OLUŞTURMA

### Test 2.1: Basit Proje Oluşturma
**Adımlar:**
1. "+" butonuna tıkla
2. Proje adı gir: "Test Projesi 001"
3. Müşteri adı gir: "Test Müşteri"
4. "Kaydet" tıkla

**Beklenen Sonuç:**
- ✅ Proje listeye eklenmeli
- ✅ Sadece 1 adet proje olmalı (DUPLİKE OLMAMALI!)
- ✅ Firebase'de görünmeli

**Firebase Kontrol:**
```
/orgs/lavora-main/projectIndex/{projectId}
```

**Console Kontrol:**
```javascript
// Kaç adet proje var?
document.querySelectorAll('.pc').length
// Sonuç: 1 olmalı, 5 DEĞİL!
```

### Test 2.2: Hızlı Ekleme (Duplikasyon Testi)
**Adımlar:**
1. "+" butonuna tıkla → "Test A" → Kaydet
2. HEMEN "+" butonuna tıkla → "Test B" → Kaydet
3. HEMEN "+" butonuna tıkla → "Test C" → Kaydet
4. F5 bas (sayfa yenile)

**Beklenen Sonuç:**
- ✅ 3 farklı proje olmalı
- ✅ Her biri sadece 1 kere olmalı
- ❌ "Test A" 5 adet OLMAMALI!

### Test 2.3: Offline Proje Oluşturma
**Adımlar:**
1. DevTools → Network → Offline
2. "+" butonuna tıkla
3. "Offline Proje" adını gir
4. Kaydet
5. Network → Online
6. 10 saniye bekle

**Beklenen Sonuç:**
- ✅ Proje hemen görünmeli (optimistic UI)
- ✅ Online olunca Firebase'e yazılmalı
- ✅ Duplike OLMAMALI

**Console Kontrol:**
```javascript
// Queue durumu
localStorage.getItem('cloudQueue')
// Kuyrukta bekleyen işlem olmalı
```

---

## 🎯 TEST 3: PROJE SİLME

### Test 3.1: Çöp Kutusuna Taşıma
**Adımlar:**
1. Bir proje oluştur: "Silinecek Proje"
2. Projeyi aç
3. "Sil" butonuna tıkla
4. Onay ver
5. F5 bas

**Beklenen Sonuç:**
- ✅ Proje ana listede OLMAMALI
- ✅ Çöp kutusunda olmalı
- ✅ Sayfa yenilendiğinde hala çöp kutusunda olmalı
- ❌ Ana listeye GERİ GELMEMELI!

**Firebase Kontrol:**
```
/orgs/lavora-main/projectIndex/{projectId}
  isTrashed: true
```

### Test 3.2: Çöp Kutusundan Geri Yükleme
**Adımlar:**
1. Çöp kutusuna git
2. Proje seç
3. "Geri yükle" tıkla
4. F5 bas

**Beklenen Sonuç:**
- ✅ Proje ana listede olmalı
- ✅ Çöp kutusunda OLMAMALI
- ✅ Tüm veriler korunmalı

### Test 3.3: Kalıcı Silme
**Adımlar:**
1. Çöp kutusuna git
2. Proje seç
3. "Kalıcı sil" tıkla
4. Onay ver
5. F5 bas
6. Firebase Console'u kontrol et

**Beklenen Sonuç:**
- ✅ Proje hiçbir yerde OLMAMALI
- ✅ Firebase'de de OLMAMALI
- ✅ Geri GELMEMELI

**Firebase Kontrol:**
```
/orgs/lavora-main/projectIndex/{projectId}
// Bu path mevcut OLMAMALI (deleted)
```

---

## 🎯 TEST 4: PROJE DÜZENLEME

### Test 4.1: Proje Adı Değiştirme
**Adımlar:**
1. Proje aç
2. Ad değiştir: "Yeni İsim"
3. Kaydet
4. F5 bas

**Beklenen Sonuç:**
- ✅ Yeni isim görünmeli
- ✅ Proje DUPLİKE OLMAMALI
- ✅ Eski isimli proje OLMAMALI

### Test 4.2: İş Kalemi Ekleme
**Adımlar:**
1. Proje aç
2. İş kalemi ekle: "Test İş Kalemi"
3. Kaydet
4. F5 bas

**Beklenen Sonuç:**
- ✅ İş kalemi görünmeli
- ✅ Kaybolmamalı
- ✅ Duplike OLMAMALI

---

## 🎯 TEST 5: SENKRONIZASYON

### Test 5.1: Çoklu Değişiklik
**Adımlar:**
1. Proje A oluştur
2. Proje B oluştur
3. Proje A'yı düzenle
4. Proje C oluştur
5. Proje B'yi sil
6. F5 bas

**Beklenen Sonuç:**
- ✅ Proje A düzenlenmiş hali görünmeli
- ✅ Proje B çöp kutusunda olmalı
- ✅ Proje C görünmeli
- ✅ Duplikasyon OLMAMALI

### Test 5.2: Offline → Online Senkronizasyon
**Adımlar:**
1. Online iken: Proje X oluştur
2. Offline ol
3. Proje Y oluştur
4. Proje X'i düzenle
5. Proje Z oluştur
6. Online ol
7. 15 saniye bekle
8. F5 bas

**Beklenen Sonuç:**
- ✅ Proje X, Y, Z hepsi görünmeli
- ✅ Düzenlemeler korunmalı
- ✅ Duplikasyon OLMAMALI
- ✅ Firebase'de hepsi olmalı

---

## 🎯 TEST 6: PERFORMANS

### Test 6.1: Çoklu Proje Yükleme
**Adımlar:**
1. 20 adet proje oluştur
2. F5 bas
3. Yükleme süresini ölç

**Beklenen Sonuç:**
- ✅ 3 saniye içinde yüklenmeli
- ✅ Hepsi görünmeli
- ✅ Duplike OLMAMALI (20 proje, 100 DEĞİL!)

### Test 6.2: IndexedDB Boyutu
**Adımlar:**
1. DevTools → Application → IndexedDB → lavora
2. Boyutunu kontrol et

**Beklenen Sonuç:**
- ✅ Makul boyut (<10MB normal kullanımda)
- ❌ 100MB+ → Duplikasyon var!

**Console Kontrol:**
```javascript
// IndexedDB boyutunu hesapla
navigator.storage.estimate().then(estimate => {
  console.log('Kullanılan:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB');
  console.log('Kota:', (estimate.quota / 1024 / 1024).toFixed(2), 'MB');
});
```

---

## 🎯 TEST 7: HATA SENARYOLARI

### Test 7.1: Network Kesintisi
**Adımlar:**
1. Proje oluştururken network'ü kes
2. Kaydet
3. Network'ü aç
4. F5 bas

**Beklenen Sonuç:**
- ✅ Proje korunmalı
- ✅ Senkronize olmalı
- ✅ Kayıp OLMAMALI

### Test 7.2: Tarayıcı Çökmesi
**Adımlar:**
1. Proje oluştur (henüz kaydetme)
2. DevTools'da `location.reload(true)` çalıştır (zorla yenile)

**Beklenen Sonuç:**
- ⚠️ Kaydedilmemiş veri kaybolur (bu normal)
- ✅ Kaydedilmiş projeler korunmalı

---

## 📊 TEST RAPORU ŞAB LONU

```markdown
## Test Raporu - [TARIH]

### Ortam
- Tarayıcı: Chrome [VERSION]
- OS: Windows
- Network: Online/Offline

### Test Sonuçları

#### ✅ BAŞARILI
- [ ] Google ile giriş
- [ ] Session kalıcılığı
- [ ] Proje oluşturma
- [ ] Proje düzenleme
- [ ] Proje silme
- [ ] Çöp kutusu
- [ ] Offline çalışma

#### ❌ BAŞARISIZ
- [ ] Duplikasyon sorunu (5x proje)
- [ ] Silinen proje geri geliyor
- [ ] Kalıcı silme çalışmıyor
- [ ] fin is not defined hatası
- [ ] Session kaybolması

#### ⚠️ KISMI
- [ ] Performans sorunları
- [ ] UI donmaları
- [ ] Gecikmeler

### Console Hataları
```
[Buraya console hataları yapıştır]
```

### Network Logları
```
[Buraya network istekleri yapıştır]
```

### Firebase Database Durumu
```
[Database screenshot veya JSON dump]
```

### Öneriler
1. ...
2. ...
3. ...
```

---

## 🚀 TEST SONRASI

### Başarılı Test
```
✅ Tüm testler geçti!
→ Production'a hazır
→ Kullanıcılara açılabilir
```

### Başarısız Test
```
❌ Kritik hatalar var
→ Sorunları düzelt
→ Testleri tekrarla
→ Production'a AÇMA!
```

---

## 💡 TEST İPUÇLARI

### Chrome DevTools Snippets
```javascript
// Tüm projeleri listele
console.table(window.P || []);

// Firebase durumu
console.log('User:', firebase.auth().currentUser?.uid);
console.log('Connected:', firebase.database().ref('.info/connected'));

// Queue durumu
indexedDB.open('lavora', 5).onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('cloudQueue', 'readonly');
  tx.objectStore('cloudQueue').getAll().onsuccess = (e) => {
    console.log('Queue:', e.target.result);
  };
};

// Duplikasyon kontrolü
const ids = (window.P || []).map(p => p.id);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
if(duplicates.length) {
  console.error('DUPLIKE PROJELER:', duplicates);
} else {
  console.log('✅ Duplikasyon yok');
}
```

### Network Monitoring
```javascript
// Firebase write sayacı
let writeCount = 0;
const originalSet = firebase.database.Reference.prototype.set;
firebase.database.Reference.prototype.set = function(...args) {
  writeCount++;
  console.log(`[${writeCount}] Firebase write:`, this.toString(), args[0]);
  return originalSet.apply(this, args);
};
```

---

**UYARI:** Bu testler üretim veritabanında yapılacak! Dikkatli ol!
