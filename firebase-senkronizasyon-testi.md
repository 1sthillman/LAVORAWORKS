# 🔥 LAVORA FIREBASE - SENKRONIZASYON TEST PLANI

## Tespit Edilen Sorunlar

### 1. Silinen Projeler Geri Geliyor
**Neden:** 
- Proje `isTrashed: true` yapılıyor ama IndexedDB'den silinmiyor
- Sayfa yenilendiğinde IndexedDB'deki eski veri yükleniyor
- Firebase'den gelen `isTrashed: true` override ediliyor

**Kod:**
```javascript
// Satır 2567
project.d=meta.isTrashed===true?1:0;
```

### 2. Projeler Duplike Oluyor (5 Adet)
**Neden:**
- `queueSave()` birden fazla çağrılıyor
- Her çağrı Firebase'e yeni kayıt ekliyor
- Aynı proje ID farklı timestamp'lerle kaydediliyor

**Kod:**
```javascript
// Satır 2793 - İKİ KERE ÇAĞRILIYOR!
await queueSave([p]);await flushQueue();
await queueSave([p]);await flushQueue();
```

### 3. Çöp Kutusu Kalıcı Silme Çalışmıyor
**Neden:**
- `isTrashed: true` yapılıyor ama Firebase'den silinmiyor
- IndexedDB cache'den kaldırılmıyor
- Offline çalışırken eski data yükleniyor

## Düzeltmeler

### DÜZELTMe 1: Duplike `queueSave` Çağrısını Kaldır

**Satır 2793'te:**
```javascript
// ÖNCE (YANLIŞ):
await queueSave([p]);await flushQueue();
await queueSave([p]);await flushQueue();

// SONRA (DOĞRU):
await queueSave([p]);await flushQueue();
```

### DÜZELTMe 2: Silinen Projeleri IndexedDB'den Temizle

`queueSave()` fonksiyonunda (satır ~2260):
```javascript
async function queueSave(projects) {
  if(!state.cfg || !state.user || !isPrivileged()) return;
  const uid0=uid();
  
  for(const p of projects) {
    // EKLE: Silinen projeleri cache'den kaldır
    if(p.d || p.isTrashed) {
      await deleteStore('cloudCache', `${uid0}|project|${p.id}`);
      await deleteStore('cloudMeta', `${uid0}|snap|${p.id}`);
      continue; // Queue'ya ekleme
    }
    
    // Normal queue işlemi devam eder...
  }
}
```

### DÜZELTMe 3: Çöp Kutusundan Kalıcı Silme

Yeni fonksiyon ekle:
```javascript
async function permanentDeleteProject(projectId) {
  const uid0 = uid();
  
  // 1. Firebase'den sil
  await Promise.all([
    ref(`projectIndex/${projectId}`).remove(),
    ref(`projectPublic/${projectId}`).remove(),
    ref(`projectFinancials/${projectId}`).remove(),
    ref(`workflowStaff/${projectId}`).remove(),
    ref(`projectCustomerIndex/${projectId}`).remove()
  ]);
  
  // 2. IndexedDB cache'den sil
  await deleteStore('cloudCache', `${uid0}|project|${projectId}`);
  await deleteStore('cloudMeta', `${uid0}|snap|${projectId}`);
  
  // 3. Local state'den kaldır
  state.projects = state.projects.filter(p => p.id !== projectId);
  P = P.filter(p => p.id !== projectId);
  
  save();
  notify('Proje kalıcı olarak silindi.');
}
```

## Test Senaryoları

### Test 1: Proje Silme
1. Yeni proje oluştur
2. "Sil" butonuna tıkla
3. Çöp kutusuna gitsin
4. Sayfa yenile (F5)
5. ✅ Proje hala çöp kutusunda olmalı
6. ✅ Ana listede görünmemeli

### Test 2: Çöp Kutusundan Geri Yükle
1. Çöp kutusundan proje seç
2. "Geri yükle" tıkla
3. Sayfa yenile
4. ✅ Proje ana listede olmalı
5. ✅ Çöp kutusunda olmamalı

### Test 3: Kalıcı Silme
1. Çöp kutusundan proje seç
2. "Kalıcı sil" tıkla
3. Onay ver
4. Sayfa yenile
5. ✅ Proje hiçbir yerde olmamalı
6. ✅ Firebase'de de olmamalı

### Test 4: Proje Duplikasyonu
1. Yeni proje oluştur
2. Projeyi düzenle (isim değiştir)
3. Sayfa yenile
4. ✅ Sadece 1 adet proje olmalı
5. ✅ 5 adet aynı proje OLMAMALI

### Test 5: Offline Çalışma
1. DevTools → Network → Offline
2. Proje oluştur
3. Proje sil
4. Online yap
5. ✅ Değişiklikler senkronize olmalı
6. ✅ Duplike OLMAMALI

## Kritik Noktalar

### LocalStorage + IndexedDB + Firebase Çakışması
```
LocalStorage (P dizisi)
    ↓
IndexedDB (cloudCache, cloudQueue)
    ↓
Firebase Realtime Database
    ↓
ÇAKIŞMA!
```

**Çözüm:**
- Her silme işleminde her 3 katmandan da sil
- Queue sistemi düzgün çalışmalı (tek kere save)
- `isTrashed` flag'i doğru kontrol edilmeli

### Timestamp Çakışması
```javascript
// Her kaydetmede yeni timestamp
p.u = Date.now();

// Firebase'den gelen timestamp
meta.updatedAt

// Cache'deki timestamp
sync.remoteUpdatedAt

// EN YENİ HANGİSİ? → ÇAKIŞMA!
```

**Çözüm:**
- Timestamp karşılaştırmasını doğru yap
- Firebase timestamp'i kaynak olsun
- Local değişiklikler kuyrukta beklesin

## Öncelikli Düzeltme Sırası

1. ✅ **`fin → finance` typo** (YAPILDI)
2. 🔴 **Duplike `queueSave` çağrısını kaldır** (ACİL!)
3. 🔴 **Silinen projeleri IndexedDB'den temizle**
4. 🟡 **Kalıcı silme fonksiyonu ekle**
5. 🟡 **Offline senkronizasyon testleri**

## Manuel Test Komutları

### Firebase Console'dan Kontrol
```
https://console.firebase.google.com/project/lavoradesign-49ae4/database/lavoradesign-49ae4-default-rtdb/data/orgs/lavora-main/projectIndex
```

### IndexedDB Temizleme (Console)
```javascript
// Tüm cache'i temizle
const request = indexedDB.deleteDatabase('lavora');
request.onsuccess = () => console.log('IndexedDB temizlendi');

// Veya sadece belirli bir proje
const db = await indexedDB.open('lavora', 5);
const tx = db.transaction(['cloudCache'], 'readwrite');
tx.objectStore('cloudCache').delete('uid|project|PROJECT_ID');
```

### Network Log Kontrol
```javascript
// Firebase yazma işlemlerini say
let writeCount = 0;
const originalSet = firebase.database().ref().set;
firebase.database().ref().set = function(...args) {
  writeCount++;
  console.log(`Firebase write #${writeCount}:`, args[0]);
  return originalSet.apply(this, args);
};
```

---

## Sonuç

Bu 3 ana sorun **senkronizasyon mimarisi** probleminden kaynaklanıyor:

1. **LocalStorage ↔ IndexedDB ↔ Firebase** arasında tutarsızlık
2. **Queue sistemi** duplike işlem yapıyor
3. **isTrashed flag** düzgün yönetilmiyor

Düzeltmeler yapıldıktan sonra **yoğun test** gerekiyor!
