# LAVORA — Mevcut HTML'den Firebase + IndexedDB Mimarisine Kod Geçiş Planı

> **Amaç:** Claude'un `lavora-calisma-masasi-v38.html` dosyasına mevcut davranışı kırmadan kimlik doğrulama, rol tabanlı veri ayrımı, yerel-öncelikli kayıt, senkronizasyon ve güvenlik katmanını aşama aşama entegre etmesi. Bu belge bir uygulama planıdır; canlıya uygulanmış veya tarayıcı uçtan uca testinden geçmiş bir teslimat değildir.

İlgili dosyalar:
- `LAVORA_FIREBASE_MIMARI_VE_GUVENLIK_PLANI.md` — ürün/mimari şartnamesi.
- `database.rules.json` — RTDB Security Rules için başlangıç taslağı; test/Emulator doğrulaması ve gerçek UID ile üretim ayarı olmadan dağıtılmamalı.
- `database.rules.test.js` — Security Rules Emulator test taslağı.

## 1. Şu anki kaynak kodu başlangıç envanteri

### 1.1 Statik incelemede tespit edilen yapı

Kaynak HTML yaklaşık 14.98 MB. Script yapısında SheetJS CDN bağımlılığı, yaklaşık 14.61 milyon karakterlik `lv-voice-data` bölümü ve aşağıdaki büyük inline script katmanları bulunuyor. HTML başlığının v36, dosya adının v38 olması ilk temizlik kalemidir.

Mevcut IndexedDB isimleri/sürümleri statik kaynakta:

- Ana DB: `lavora`, sürüm 4.
- Store isimleri: `p`, `scans`, `led`, `rcpt`, `wph`.
- Ses önbelleği için ayrıca `lvr_voice_db` kullanımı mevcut görünüyor.
- `localStorage` ayarları ve destekleyici eşlemeler içeriyor; `S.key` / `S.ak` gibi OCR/harici AI entegrasyon anahtarları senkronizasyona kesinlikle alınmamalı.

### 1.2 Değişiklik yapılmadan önce kaynak içinde yeniden izlenecek fonksiyonlar

Aşağıdakiler kaynakta isim olarak tespit edildi; her birinin iç davranışı, çağrı yeri ve veri nesnesi şekli Claude tarafından değişiklikten önce tekrar izlenmeli:

| Alan | Kaynak fonksiyon/alan isimleri | Geçiş yaklaşımı |
|---|---|---|
| Proje oluşturma/listeleme/ana render | `newP`, `home`, `plist`, `render`, `editor`, `field`, `rows`, `sum` | İlk aşamada davranışı değiştirme; önce `ProjectRepository` adaptörünü ekle. |
| Excel/CSV içe aktarma | `fromWb`, `openWb`, `rowsOf`, `build`, `pv`, `cols2`, `wxlimp`, `wfromSheet` | Legacy import çıktısını önce normalize ara modele dönüştür. Finans başlıkları belirsizse çalışan verisine aktarma. |
| OCR/fotoğraf | `shrink`, `readPhoto`, `ocrApi`, `ocrLocal`, `ocrClaude`, `analyze`, `compare`, `preview`, `apply` | Anahtarları hiçbir zaman buluta eşitleme; çalışan rolünde OCR/finans çıkarımını kapat veya sadece izinli alanlara indir. |
| Teklif/dışa aktarma | `xl`, `pdf`, `premiumBuild`, `exportPremium`, `wxl`, `wexp`, `lexp` | Rol kontrolü servis katmanında; finans dışa aktarma yalnız admin/ortak. Çalışan için veri kümesi baştan finanssız üretilmeli. |
| İş akışı | `wAll`, `wlist`, `wProj`, `wrender`, `wis`, `wsg`, `wcl`, `wexp`, `wpack`, `wunpack`, `wout`, `wovl`, `wshow` | Öncelikli modüllerden biri; `workflowStaff` yoluna yazıp outbox'a eklemeli. |
| Defter/fiş | `ledger`, `lfr`, `lf`, `lexp`, `rcpt` store kullanımları | Finansal yol/servis; çalışan/müşteri için hiçbir listener veya prefetch kurulmamalı. |
| QR/tarama | `qrFromFile`, `startQR`, `scan`, `qrResult` | Tarama geçmişinin şirkete sync edilmesi gerekip gerekmediği ayrıca kararlaştırılmalı; varsayılan kişisel/yerel. |
| Yedek/kurtarma | `bkAll`, `repair`, `delRec`, `wclean` | Geçiş başlamadan backup/restore gerçek örneklerle test edilmeli; `repair` bulut üstüne kör yazmamalı. |
| Klavye/yardım/arayüz | `nav`, `openPal`, `key`, `help`, `welcome`, `bind`, `layout`, `mount`, `unmount` | Login ve role guard ilk render'a girmeli; mevcut navigasyon ve klavye davranışları regression testinden geçmeli. |

**Önemli:** Bu tablo tam bir call graph değildir. Claude her fonksiyonun kodunu ve tüm çağrı noktalarını aramalı; isim benzerliğine göre değişiklik yapmamalı.

## 2. Değişiklikten önce geri dönüş noktası

1. Orijinal HTML dosyasını salt okunur yedek olarak kopyala ve SHA-256 hash'ini raporla.
2. Uygulamadaki mevcut JSON yedekleme özelliğiyle gerçek veriden bir yedek oluştur.
3. `p`, `scans`, `led`, `rcpt`, `wph` store'ları için yalnız sayım/kimlik bilgisi raporu çıkar. Satır içeriği, müşteri bilgileri veya API anahtarları loglanmamalı.
4. Yedeği boş bir test profilinde geri yükle; proje, sayfa, satır, defter, fiş ve iş akışı sayıları ile birkaç toplamı karşılaştır.
5. Tarayıcı/IndexedDB'den gelen her kayıt için kaynak örnekleri hazırla; mümkünse kişisel verileri değiştirilmiş fixture oluştur.
6. Bu kapı geçilmeden mevcut store silinmez, ismi değiştirilemez veya verinin tek kopyası buluta taşınmaz.

## 3. Önerilen servis sözleşmeleri

UI event handler'ları doğrudan `firebase.database().ref(...).set(...)` çağırmamalı. Eski global fonksiyonlar kademeli olarak aşağıdaki servis API'lerine bağlanmalı. İlk adımda mevcut HTML'e script/module katmanı eklemek gerekiyorsa, global namespace ve script yükleme sırası özellikle test edilmelidir.

```js
// Örnek sözleşme; Claude gerçek uygulamaya göre dosya ve tipleri uyarlamalı.
await ProjectService.save(projectDraft, { actor, expectedRevision });
const list = await ProjectService.listVisibleProjects({ actor, cursor });
const view = await ProjectService.getProjectView(projectId, { actor });
await WorkflowService.saveItem(projectId, itemId, patch, { actor, expectedRevision });
await LedgerService.save(record, { actor, expectedRevision });
await MediaService.add({ projectId, visibility, blob, mimeType }, { actor });
await SyncEngine.flush({ maxBytes: 250 * 1024 });
```

Servisler aşağıdaki sorumlulukları taşımalı:

- `AuthService`: Firebase Auth durumu, Google provider, logout ve auth hataları.
- `MembershipService`: kullanıcının `orgId`, rolü ve aktif/pasif durumunu çözer. Rol çözülene kadar veri yüklemez.
- `PermissionService`: özellik ve eylem izinlerini tek sözleşmede bildirir; fakat kuralların yerine geçmez.
- `ProjectMapper`: legacy model ↔ normalized model dönüşümü.
- `ProjectRepository`, `WorkflowRepository`, `LedgerRepository`, `ReceiptRepository`, `MediaRepository`: IndexedDB okuma/yazma.
- `SyncOutboxRepository`: yerel kayıt değişikliği ile mutation kaydını aynı transaction içinde yazar.
- `SyncEngine`: idempotency, sıra, retry/backoff, revizyon kontrolü ve çakışma kaydı.
- `FirebaseGateway`: RTDB path'lerine typed erişim; UI'ya ham ref vermemeli.
- `MigrationService`: dry-run, rapor, commit, doğrulama ve geri alma.
- `ExportService`: rolün görebildiği veri projeksiyonundan çıktı üretir; asla UI'dan gelen `role` parametresine körü körüne inanmaz.

## 4. Eski tek proje nesnesinin bölünmesi

Mevcut proje nesnesi `id`, `name`, `cust`, `kdv`, `u`, `s` ve opsiyonel `w` gibi alanlar içerebiliyor. Gerçek nesne biçimi önce fixture'larla doğrulanmalı. `s`, `h`, `r`, `w`, `u` isimleri anlaşılmadan doğrudan alan eşlemesi yapılmamalı.

### 4.1 Normalize hedef kayıtlar

**`projectIndex/{projectId}` — küçük liste kartı**

- `id`, `name`, yalnız paylaşılması gereken müşteri görüntü adı, `workflowStatus`, `dueDate`, `updatedAt`, `schemaVersion`.
- Teklif toplamı, KDV, fiyat, indirim, marj/kâr, masraf, fiş içeriği, ham tablo satırı ve gizli not burada bulunmayacak.
- Personel ana sayfası bu indeksle çalışır; `/orgs/{orgId}` tamamı dinlenmez.

**`projectPublic/{projectId}` — proje tanımı**

- İş için gereken ad/açıklama ve onaylanmış, hassas olmayan metadata.
- Admin/ortak tüm uygun alanları yönetebilir; çalışan ihtiyaca göre okuyabilir ama finansı bu nesneden alamaz.

**`projectFinancials/{projectId}` — yalnız admin/ortak**

- KDV, teklif satırlarının finansal alanları, fiyatlar, satır/toplam tutarlar ve ilgili finansal özetler.
- Çalışan ve müşteri bu path için ne listener kurmalı ne de bir istek gönderebilmeli; gönderirse Security Rules reddetmeli.

**`workflowStaff/{projectId}` — işletme içi çalışma**

- Termin, aşama, atama, miktar/ölçü, durum, işçilik/proses notu ve çalışanların yönetmesi gereken öğeler.
- Eğer mevcut satırlar teklif satırlarıyla aynı sıra düzenini kullanıyorsa, finansal satır numarasına bağımlı kalma. Kararlı `rowId` / `itemId` kullan.

**`customerProjectIndex/{uid}/{projectId}` ve `customerViews/{uid}/{projectId}` — müşteri portalı**

Yeni Google kullanıcısı otomatik olarak müşteri/çalışan/ortak yetkisi almaz. İlk girişte yalnızca kendi profil kaydı oluşturulur ve durumu “Yetki bekleniyor” olarak tutulur. Tek admin, profil dizininden kişiyi doğrulayıp rol atar; `customer` rolü verildikten sonra admin/ortak o kullanıcıya belirli proje için süreli ve tek kullanımlı kod üretir. Kod genel yetki vermez; yalnızca o `uid + projectId` bağı kurar. Admin rol atama ekranı tüm profilleri ancak admin yetkisiyle sorgulamalı, kullanıcılar birbirlerinin profil dizinini okuyamamalıdır.


- UID altında müşteriye verilmiş proje listesi ve dışarıya açılmış başlık, durum, ilerleme, termin, onaylı görseller/duyurular.
- Personel iç notları, finans, maliyet, çalışan ataması veya başka müşterinin bilgisi kopyalanmaz.

### 4.2 Satır alanlarını ayırma kuralı

Mevcut proje tablosundaki satır dizileri ham şekilde `projectPublic` veya `workflowStaff` içine kopyalanamaz. Başlık isimleri çok çeşitli olabileceği için:

1. Her tablo için başlık satırını belirle ve sütunları tip sınıflandırıcısına yönlendir.
2. Açıkça belirlenmiş iş adı, ölçü/birim, adet ve üretim durumu gibi alanlar çalışma verisine aktarılabilir.
3. Birim fiyat, fiyat, tutar, toplam, KDV, vergi, indirim, maliyet, marj, kâr, tahsilat, ödeme ve benzeri başlıklar finansal alana gider.
4. Anlamı belirsiz sütun **varsayılan olarak personele açık kabul edilmez**. Admin migration preview ekranında sütunun hedef sınıfını seçer.
5. Aynı kaynak satır için kararlı bir `rowId` üretilir. Public/workflow/financial kayıtlar aynı `rowId` ile bağlanır; kullanıcının düzenlemesi sıralamaya göre yanlış satıra kaymaz.
6. Matematiksel toplamların hesaplanması orijinal uygulama ile karşılaştırılır. Kaynakta formül/metin hücresi ve yerelleştirilmiş sayı ayrımı varsa dönüşüm bunları sessizce sayıya zorlamamalı.

## 5. IndexedDB upgrade ve local-first atomik kayıt

Ana DB `lavora` sürüm 4'ten sürümlü bir upgrade ile yeni store'lara geçmeli. Var olan store'lar ilk migration sırasında silinmemeli.

Önerilen minimum store'lar:

- Var olan `p`, `scans`, `led`, `rcpt`, `wph` korunur; adapter arkasına alınır.
- `syncOutbox`: `mutationId`, `orgId`, `actorUid`, `entityType`, `entityId`, `operation`, `payload`, `baseRevision`, `createdAt`, `attemptCount`, `nextAttemptAt`, `lastErrorCode`.
- `syncMeta`: kullanıcı/org namespace, yerel schema version, son başarılı delta cursor, son başarılı sync zamanı ve sync durum bilgileri.
- `syncConflicts`: mutation id, entity, base revision, local payload ve remote payload/revision. Çözülene kadar iki sürüm de kalmalı.
- `mediaLocal`: Blob/ArrayBuffer, mimetype, checksum, boyut, visibility, proje kimliği, thumb/ref bilgisi. Çok büyük Base64 JSON metinleri yerine mümkünse Blob kullan.
- Gerekirse `migrationMap`: eski kimlik → yeni kararlı kimlik ve migration durumu.

Yerel save akışı:

1. UI taslağı temel veri doğrulamasından geçer.
2. Tek IndexedDB transaction açılır.
3. İlgili local entity kaydı ve aynı değişikliğe ait outbox kaydı birlikte yazılır.
4. Transaction başarıyla tamamlanmadan UI “cihaza kaydedildi” bile göstermez.
5. Çevrimiçi ise arka plandaki sync worker outbox kaydını sırayla işler; değilse kayıt `pending` durumunda kalır.
6. Firebase write başarıyla onaylanırsa local entity'nin `serverRevision`, `syncedAt` bilgileri ve outbox silme işlemi atomik biçimde işlenir.
7. Firebase reddi (permission_denied), kota, çevrimdışı veya validation hatası aynı şekilde ele alınmaz: yetki reddi kullanıcıya gösterilir; geçici ağ/kota hatasında outbox korunur; bozuk payload otomatik sonsuz tekrar döngüsüne girmez.

## 6. Sync Engine ayrıntısı

### 6.1 Değişiklik zarfı

Her değişiklik bir entity/path üzerinde sınırlı kalmalı. Finansal ve workflow mutation'ı aynı payload içine karışmamalı.

```json
{
  "mutationId": "uuid",
  "orgId": "ORG_ID",
  "actorUid": "AUTH_UID",
  "entityType": "workflowItem",
  "entityId": "PROJECT_ID/ITEM_ID",
  "operation": "patch",
  "baseRevision": 12,
  "localRevision": 13,
  "payload": { "status": "done" },
  "createdAt": 1793300000000,
  "attemptCount": 0
}
```

Bu bir örnek; `payload` izin verilen alan listesine göre tekrar doğrulanmalı. Kullanıcı istemciden `role`, `orgId`, hedef Firebase path veya role değişimi içeren serbest JSON mutation gönderememeli.

### 6.2 Retry ve idempotency

- `mutationId` her değişiklik için sabit üretilir; aynı mutation yeniden gönderildiğinde ikinci kez eklenen kayıt yaratmaz.
- Yeni entity oluşturma `push()` anahtarını tekrar tekrar üretmemeli. ID ilk yerel kayıtta üretilir ve outbox içinde sabit kalır.
- Retry üssel gecikmeli ve jitter'lı olmalı (ör. kısa ilk retry, sonra 2x büyüme; üst sınır 5 dakika). Sekmeler arasında aynı kuyruğu iki worker göndermemeli; Web Locks desteklenirse kullan, değilse IndexedDB lease/lock yap.
- Başarıdan sonra outbox silinmeden önce Firebase'deki değişikliğin revision/idempotency işareti doğrulanır.
- Silme işlemi tombstone/revision üretir; buluttan bir kaydı silip offline eski kopyanın tekrar eklemesine izin verme.

### 6.3 Çakışma politikası

- Farklı alanlara dokunan patch'ler kontrollü birleştirilebilir.
- Aynı alanın iki cihazda farklı güncellenmesi last-write-wins ile sessizce çözülmemeli; conflict kaydı açılmalı.
- Sayısal toplamlar için buluttan gelen toplamı tek doğru kabul etmek yerine kaynak alanlar üzerinden mevcut hesaplama fonksiyonları yeniden çalıştırılmalı ve fark raporlanmalı.
- Aynı proje üzerinde admin fiyatları değiştirirken çalışan iş akışını güncelliyorsa bu ayrı path'ler olduğundan birbirini ezmemeli.
- Rolü iptal edilmiş kullanıcının bekleyen mutation'ları sync sırasında Security Rules'tan `permission_denied` alır; bunlar silinmeden karantinaya alınmalı ve kullanıcıya “erişimin değiştiği için gönderilmedi” denmeli.

### 6.4 Firebase listener stratejisi

- `orgs/{orgId}` veya `orgs/{orgId}/projectFinancials` root seviyesinde genel `onValue` açılmaz.
- Personel başlangıçta küçük `projectIndex` okur; iş akışı detayları seçili projeye göre indirilir.
- Her proje için gerekiyorsa `onChildAdded/Changed/Removed` ile delta uygula; ilk liste snapshot'ının bir kez indirileceğini unutma.
- Media payload dinleyicisi sadece görsel açılırken kurulur; kapanınca unsub edilir.
- Admin/ortak finans listener'ları yalnız finans modülü açıldığında; çalışan/müşteride hiçbir zaman kurulmaz.
- Account switch/logout olduğunda bütün listener ve pending callback'ler durdurulur; önceki hesabın event'i yeni hesabın UI/local namespace'ine işlenmez.

## 7. Base64 görsel ve veri kotası politikası

Base64 ikili veriyi yaklaşık üçte bir büyütür. Bundan dolayı kaynak fotoğrafı doğrudan her iş akışı olayına eklemek veya tam proje nesnesini güncellemek hem RTDB indirme miktarını hem de payload boyutunu gereksiz büyütür.

İlk performans hedefleri (Emulator ve gerçek cihaz ölçümünden sonra ayarlanacak; başlangıç Security Rules üst sınırlarıyla aynı tutulur):

- Thumb: maksimum 240 px uzun kenar; en fazla 20 KiB binary hedefi.
- Görüntü: maksimum 1280 px uzun kenar, JPEG/WebP kalite uyarlaması; **azami 300 KiB binary**, Rules taslağı Base64 string uzunluğunu 410.000 karakterle sınırlar.
- Büyük/orijinal resim ve ham Excel dosyası: varsayılan olarak yerelde. Cihazlar arası orijinal dosya kesin gerekecekse ayrı kararlaştırılır, görsel yükleme onayı ve kotası gösterilir.
- Thumbnail ve full payload ayrı path/kimlikle tutulur; liste kartlarında yalnız thumbnail metadata/ID, görsel açıksa içerik indirilir.
- Değişmeyen görsel tekrar yüklenmez; `checksum` ile içerik tekrarı tespit edilir.
- Görsel Base64'ü hiçbir zaman `projectIndex`, `projectPublic`, `workflowStaff`, `ledger` veya `receipts` genel kayıtlarına eklenmez.
- Çalışan fotoğrafı varsayılan olarak staff görünürlüğündedir. Müşterinin göreceği fotoğrafı admin/ortak ayrıca onaylayıp `mediaMetadata/customer`, `mediaThumbnails/customer`, `mediaPayloads/customer` yollarına yayınlar; çalışan doğrudan müşteriye medya yayınlayamaz.
- Kullanıcıdan kaynaklı medya her yüklemede type/size kontrolünden geçer; SVG/HTML veya çalıştırılabilir veri dosyası kabul edilmez.
- Firebase indirme ve saklama limitleri `database.rules.json` ile belirlenemez; kullanım raporu/uyarı ayrı izlenmeli. Spark ücretsiz kullanımı sınırsız değildir.

## 8. Migration akışı: dry-run → commit → audit → doğrulama

### Adım 1 — Kaynağı dondurma

Migration başlamadan yedek alınır. Aynı cihazda veri yazmaya devam edilecekse migration snapshot'ı oluşturulur ve değişiklikler outbox kuyruğuna alınır; eski uygulama veriyi yok etmez.

### Adım 2 — Dry-run raporu

Hiçbir bulut verisi yazmadan şu rapor çıkarılır:

- Her store'daki entity sayıları.
- Proje başına sayfa/sheet, satır ve workflow item sayısı.
- Defter ve fiş sayıları.
- Görsel adedi, mime türü, toplam ve medyan boyut; decode edilemeyen/bozuk Base64 sayısı.
- Finansal olarak sınıflandırılan kolonlar ve anlamı belirsiz kolonlar.
- Kaynaktaki sayı/tutar/toplam ile normalize edilmiş toplam karşılaştırması.
- Her hedef path için beklenen entity sayıları ve yaklaşık JSON byte ölçümü.

### Adım 3 — Admin sütun eşleme/onay ekranı

Belirsiz kolonların müşteri/çalışan görünümüne aktarılması varsayılan olarak reddedilir. Admin bunları public/workflow/financial/internal olarak sınıflandırır; seçim migration versiyonuna kaydedilir. Bu eşleme, sonraki içe aktarma akışında yeniden kullanılabilir.

### Adım 4 — Chunk'lı idempotent yazma

- Önce küçük `projectIndex` ve güvenli proje özetleri.
- Ardından `projectPublic` ve `workflowStaff`.
- Daha sonra `projectFinancials`, ledger, receipts ve medya.
- Müşteri erişim indeksleri yalnız admin belirli proje ve UID'yi onayladıktan sonra üretilir; sırf e-posta eşleşti diye erişim açılmaz.
- Birden fazla path için atomik multipath update kullanılacaksa her hedef path'in write rule'u test edilir; güncelleme kısmen başarısız olma durumunu destekleyecek idempotent chunk tasarımı yapılır.
- İstek payload üst sınırı konservatif biçimde 250 KiB hedeflenir; çok büyük medya ayrı işlenir. Her chunk'ın id/hash/migration ID kaydı tutulur.
- Aynı migration tekrar çalıştırıldığında tekrar proje/satır/fiş yaratmaz.

### Adım 5 — Kontrol toplamları

Her entity için kaynak id, hedef id, alan sayıları ve checksum karşılaştırması yapılır. Her proje için satır sayısı, sayfa sayısı ve orijinal matematik fonksiyonlarından çıkan toplamlar karşılaştırılır. Fark varsa commit tamamlandı sayılmaz.

### Adım 6 — Canary kullanımı

Önce test verisi, sonra bir düşük riskli gerçek proje; admin, çalışan ve müşteri test hesaplarında kontroller. Eski local model hâlâ saklanır. Sonuçlar uygun olursa diğer projeler parti parti taşınır.

### Adım 7 — Eski veriyi koruma/temizleme

- Migration başarılı diye eski IndexedDB store'ları otomatik silme.
- En az bir yedek/geri-yükleme turu ve operasyonel onay olmadan legacy store temizliği yapma.
- Her temizleme işlemi ayrı, geri döndürülebilir ve loglanan bakım adımı olmalı.

## 9. Login, bootstrap ve role gate entegrasyonu

Eski uygulamada `boot`, `home`, `render` ve `nav` gibi yollar uygulamanın ana gövdesini açabiliyor. Firebase/Auth geçişinden sonra ilk render sırası şöyle olmalı:

1. Minimal login shell ve Firebase Auth kurulumu.
2. `onAuthStateChanged` bekle.
3. Kullanıcının profili/üyeliği ve `orgId` bilgisi yükle.
4. Rol `pending`, `disabled`, yok veya yüklenemedi ise veri servislerini başlatma.
5. `PermissionService` yetkili görünümü seçsin.
6. Yetkiye uygun repository/listener'lar başlatılsın.
7. Logout/account switch sırasında listener'ları kaldır, memory state'i sıfırla ve local namespace seçimini yenile.

UI izinleri önerisi:

| Yetenek | Admin | Ortak | Çalışan | Müşteri |
|---|---:|---:|---:|---:|
| Proje listesi ve güvenli proje detayları | ✓ | ✓ | ✓ | Yalnız atanan projeler |
| Fiyat, KDV, teklif toplamı, kâr/maliyet | ✓ | ✓ | ✗ | ✗ |
| Defter ve fiş | ✓ | ✓ | ✗ | ✗ |
| Üretim/iş akışı yönetimi | ✓ | ✓ | ✓ | Yalnız görüntüleme |
| Kullanıcı rolü atama | ✓ | ✗ | ✗ | ✗ |
| Müşteri talebi açma | — | — | — | Kendi talebi |
| Fiyat içeren Excel/PDF/dışa aktarma | ✓ | ✓ | ✗ | ✗ |
| Firebase üyelik/erişim ayarları | Yalnız sabit kurucu admin | ✗ | ✗ | ✗ |

Bu tablo UI içindir; gerçek güvenlik RTDB kurallarından gelir. Çalışan kodunda finans repository'si import edilmemeli veya çağrılmamalıdır.

Employee/customer-readable düğümler (`projectIndex`, `projectPublic`, `workflowStaff`, `customerViews`) katı allowlist ile yazılmalı; bilinmeyen her alan reddedilmelidir. Eski tek proje objesini bu yollardan birine olduğu gibi kopyalamak yasaktır. Çalışan görselinin Base64 payload'ı, yalnızca aynı UID'nin `createdBy` değeriyle kayıtlı metadata varsa yazılabilir.

## 10. Test ve kabul ölçütleri

### 10.1 Güvenlik testleri (`database.rules.test.js`)

- Çalışan `projectIndex` / `workflowStaff` okuyabilir.
- Çalışan `projectFinancials`, `ledger`, `receipts`, `media/finance` okuyamaz.
- Çalışan kendi rolünü veya başka birinin rolünü değiştiremez.
- Müşteri yalnız `customerProjectIndex/{uid}` ve atanmış `customerViews/{uid}/{projectId}` okuyabilir.
- Admin ekranı `customerIntakes` kök düğümünde sürekli `onValue` kullanma; bekleyen talepleri sayfalı/limitli veya UID ve request ID bazında oku. Security Rules admin/ortak için izin verse bile uygulama gereksiz tam ağaç okumamalı; bu, indirme kotasını ve istemci belleğini korur.
- Müşteri finans, defter, fiş veya başka müşterinin proje görünümüne erişemez.
- Müşteri sadece kendi adına ilk `submitted` talebi yaratabilir; onu `accepted` olarak kendisi işaretleyemez.
- Ortak finansı görebilir ancak ikinci admin yaratamaz.
- Sabit admin kullanıcı atayabilir; yalnız kendi UID'si `admin` rolünü alabilir.
- Kullanılmış/iptal edilmiş/süresi geçmiş müşteri daveti tekrar kullanılamaz; davet başka proje erişimi oluşturamaz.
- Oturum açmamış kullanıcı tüm iş verisinden mahrumdur.

Çalıştırma önkoşulları: Node.js, `firebase`, `@firebase/rules-unit-testing` ve Firebase Emulator Suite. Testler yerel emulator'a karşı çalıştırılmalı; sadece `node --check` başarılı olması kuralların güvenli olduğunu kanıtlamaz.

### 10.2 Sync testleri

- Offline create/update/delete → sayfayı kapat/aç → outbox kaybolmadan var.
- İki cihaz aynı entity'nin farklı alanlarını değiştirir → kontrollü birleştirme.
- İki cihaz aynı alanı değiştirir → conflict kaydı; sessiz overwrite yok.
- Aynı mutation tekrar oynatılır → duplicate oluşmaz.
- Upload sırasında bağlantı kesilir → outbox ve medya korunur.
- Kullanıcı hesap değiştirir → önceki hesabın kuyruğu yeni hesaba gönderilmez.
- İzin iptal edilir → sync permission-denied alır, payload kaybolmaz, kullanıcı uyarılır.
- QuotaExceededError ve Firebase kota/izin hata durumları → başarılı yazma gibi gösterilmez.

### 10.3 Regression testleri

Excel/CSV import, sütun eşleme, locale sayı ayrıştırma, toplamlar, proje kopyalama/arşiv/çöp kutusu, defter, fiş, QR, OCR (API anahtarının güvenli yönetimi koşuluyla), Excel/PDF/print, premium export, yedek/geri yükleme, onarım ve mobil düzen her rol için test edilir. Çalışan/müşteri dışa aktarmalarında finance alanlarının payload'a düşmediği ayrıca test edilir.

## 11. Canlıya geçiş ve geri alma

- `database.rules.json` içinde `REPLACE_WITH_REAL_ADMIN_UID` kalmışsa deploy pipeline başarısız olmalı.
- RTDB Emulator'da bütün testler geçmeden gerçek veri senkronizasyonu açılmamalı.
- Firebase Console'da Rules simülatörü/Emulator ile deny-case'ler ayrıca kontrol edilmeli.
- İlk canlı geçişte özellik bayraklarıyla küçük grup ve az proje; her aşamada kullanım/indirme miktarı ölçümü.
- Geri alma, eski HTML ve yerel store'lara dönme prosedürü olmalı; buluttaki yeni veri değişiklikleri dışa alınmadan eski sürüme körlemesine geçilmemeli.
- Rules değişikliği sonrası mevcut istemci sürümünün veri şeması uyumsuzsa kullanıcıya anlaşılır minimum sürüm uyarısı gösterilmeli.

## 12. Claude için kesin talimat

1. Önce kaynak fonksiyonlarını ve fixture'ları incele; eksik şemayı tahmin etme.
2. İlk yanıt olarak entegre final HTML üretme. Önce envanter, migration dry-run, Rules Emulator testi ve aşamalı değişiklik planı.
3. İlgili her değişiklikte dosya listesi, risk, test komutu, test sonucu ve kalan sorunları raporla.
4. Önce local repository facade, sonra auth/role shell, sonra Rules, sonra migration/sync. Bir modülü birden fazla kez değiştiren büyük regex değişikliklerinden kaçın.
5. Hiçbir çalışan/client finance alanını indirip sonra gizleyemez. Finansal path okunamayacak ve bu istek Rules testleriyle reddedilecek.
6. Ücretsiz Spark varsayımı korunur. Blaze, Cloud Functions veya ücretli medya servisi gerekiyorsa kendiliğinden seçme; ücret/plan etkisini açıkla ve kullanıcı kararı olmadan ücretli yaklaşımı uygulama.
7. Başarılı test kanıtı olmayan hiçbir parça için “tamamlandı/güvenli” deme.


## 12. Müşteri talep listesi ve düşük veri okuması

- Tam talepler yalnız `customerIntakes/{uid}/{requestId}` altında saklanır; bu düğümün root seviyesinden toplu okunmasına izin verilmez.
- Admin panelindeki tablo `customerIntakeIndex/{requestId}` üzerinden yalnız `requestId`, `uid`, `title`, `status`, `createdAt`, `updatedAt` alanlarını kullanır. Bu index'e `.indexOn: [status, createdAt, updatedAt]` eklenir.
- Müşteri önce kendi tam talep kaydını oluşturur; başarılı olduktan sonra aynı `requestId` için küçük index kaydını oluşturur. Index yazımı tam kaydın UID, başlık, durum ve oluşturulma zamanı ile eşleşmesini kontrol eder. Index yazısı başarısızsa outbox kaydı tutulur ve tekrar denenir; admin paneli ham root'tan bütün talepleri indirmez.
- Admin/ortak bir talebi açarken index'teki `uid + requestId` ile yalnız o tam kaydı okur. Çalışan müşteri talep indeksini okuyamaz. Müşteri yalnız kendi talebini okur.


**Müşteri talep medyası:** müşteri medya kaydı yalnız kendi UID’si altına ve önceden oluşturulmuş kendi `customerIntakes/{uid}/{requestId}` talebine iliştirebilir. Önce metadata, ardından thumbnail/payload yazılır. Payload yükleme/indirme hatasında yerel Blob ve outbox korunur; medyanın request ID’siz bir namespace’e yüklenmesi reddedilir.
