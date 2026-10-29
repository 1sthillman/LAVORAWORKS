# LAVORA DESIGN — Firebase + IndexedDB Mimari, Senkronizasyon ve Güvenlik Şartnamesi

> **Claude için ana mühendislik belgesi.** Bu dosya, `lavora-calisma-masasi-v38.html` uygulamasının Firebase Authentication + Realtime Database ile güvenli, çevrimdışı öncelikli ve düşük veri tüketimli bir ürün hâline getirilmesini tarif eder. Belgedeki kararlar uygulanmadan önce mevcut kaynak dosya tekrar incelenmeli; çalışan hiçbir özellik sessizce kaldırılmamalı. Bu belge bir tasarım/uygulama şartnamesidir; canlı Firebase projesine uygulanmış veya test edilmiş kod değildir.

## 0. Yönetici özeti — kararlar

1. **IndexedDB yerel çalışma deposu olarak kalacak.** Kullanıcının düzenlemeleri önce IndexedDB'ye yazılır. Böylece internet kesikken de kayıt, düzenleme ve fotoğraf ekleme mümkün olur.
2. **Firebase Realtime Database bulut senkronizasyonu ve çoklu cihaz/kişi eşitlemesi için kullanılacak.** Çevrimiçi olduğunda IndexedDB'deki bekleyen değişiklikler güvenli bir kuyrukla buluta aktarılır; diğer cihazlardan gelen değişiklikler yerel depoya işlenir.
3. **Firebase web SDK'sının çevrimdışı davranışına tek başına güvenilmeyecek.** Web için kalıcı, uygulama tarafından yönetilen çevrimdışı katman IndexedDB ve outbox kuyruğudur. Firebase'in bellekteki bağlantı/olay mekanizması, uygulamanın kalıcı yerel kuyruğunun yerine geçmez.
4. **İzinler ekranda saklamakla sınırlı olmayacak.** Çalışanın fiyat, teklif toplamı, KDV, masraf defteri veya fiş verisini okuyamaması Firebase Security Rules ile sunucu tarafında da zorunlu tutulacak. Hassas ve hassas olmayan alanlar aynı okunabilir düğümün altına konulmayacak. Employee/customer-readable düğümler (`projectIndex`, `projectPublic`, `workflowStaff`, `customerViews`) katı alan izin listeleriyle doğrulanacak; bilinmeyen alanlar reddedilecek. Eski proje nesnesi bu yollardan herhangi birine doğrudan kopyalanmayacak. Çalışan görselinin payload yazımı, kendi UID’sine bağlı medya metadata kaydına dayanacak.
5. **Tek bir kurucu yönetici olacak.** İlk kurulumda tek `ADMIN_UID` Firebase Authentication UID'si güvenli biçimde belirlenecek ve Realtime Database kurallarıyla sabitlenecek. Uygulama içinden ikinci admin atanamayacak. Admin; ortak, çalışan ve müşteri rollerini atayabilir, değiştirebilir veya erişimlerini kapatabilir.
6. **Ortak, işletme verilerinde admin gibi kapsamlı yetkiye sahip olacak; güvenlik sahipliği farklı kalacak.** Ortak projeleri, fiyatları, defteri, fişleri, raporları ve iş akışını görebilir/düzenleyebilir. Tek adminin değiştirilmesi, ikinci admin oluşturma, güvenlik kuralları veya Firebase yapılandırmasını değiştirme yetkisi ortağa verilmeyecek.
7. **Görseller ayrı medya kayıtları olacak.** Görsel Base64'ü proje/iş akışı/defter nesnesinin içine gömülmeyecek. Bu, RTDB dinleyicilerinin her güncellemede görselleri tekrar indirmesini önler. Ücretsiz Spark planıyla devam etmek gerekiyorsa, Firebase Storage'a erişilemeyeceği için görseller ayrı RTDB medya yollarında sıkıştırılmış Base64 olarak saklanabilir; bu tercih sıkı boyut limitleri ve gerçek kullanım ölçümüyle yapılacak.
8. **Ham Excel dosyası ile Excel içeriği ayrılacak.** İçe aktarılan çalışma kitabının ayrıştırılmış hücreleri/proje satırları senkronize edilir; orijinal `.xlsx` dosyası varsayılan olarak cihazda kalır. Ham dosyanın farklı cihazlara gitmesi gerekiyorsa ayrıca boyut sınırıyla medya eki olarak yüklenir. Sistem bu ayrımı kullanıcıya açıkça bildirir.
9. **Mevcut tek HTML uygulama bir kerede baştan yazılmayacak.** Önce yedek, test, veri modeli ve adaptör katmanı hazırlanacak; ardından auth, izinler, senkronizasyon ve modüller aşama aşama entegre edilecek.
10. **Güvenlik testi geçmeden canlı veri açılmayacak.** Security Rules Emulator testleri; çalışan/müşteri UID'leriyle fiyat ve başka müşterilerin projelerine erişimin reddedildiğini kanıtlamalıdır.

---

## 1. Mevcut projeye dair doğrulanmış başlangıç durumu

Kaynak dosya: `lavora-calisma-masasi-v38.html`.

- Dosya yaklaşık **14.98 MB** ve yaklaşık 1.811 satır.
- HTML başlığında **“Lavora Design · Çalışma Masası v36”** yazıyor; dosya adı v38. Başlık/sürüm uyuşmazlığı ilk temizlikte ele alınmalı, fakat veri modeli korunmadan sürüm numarası topluca değiştirilmemeli.
- Büyük bir `lv-voice-data` scriptinde yaklaşık **14.61 milyon karakter** Base64/ses verisi bulunuyor. Toplam dosya boyutunun ezici kısmı bu bölümden geliyor. Ses verilerinin hepsinin her açılışta HTML ile indirilmesi yerine mevcut `lvr_voice_db` IndexedDB önbelleğine uygun, gerektiğinde yüklenen ve sürümlenen bir varlık sistemine geçiş değerlendirilmeli.
- SheetJS `xlsx@0.18.5` şu anda CDN üzerinden yükleniyor. İnternet yokken Excel işlevinin çalışması gerekiyorsa kütüphanenin kontrollü yerel/bundle kopyası veya offline-cache stratejisi gerekir.
- Ana yerel veritabanı `lavora`, IndexedDB sürüm 4; görünen object store adları: `p`, `scans`, `led`, `rcpt`, `wph`. Uygulama ayrıca ses klipleri için `lvr_voice_db` kullanıyor.
- Proje yapısı kabaca `id`, `name`, `cust`, `kdv`, `u`, `s` (sayfa/tablolar) ve isteğe bağlı `w` (iş akışı) benzeri alanlara sahip. Sayfaların başlık/satır verileri `h` ve `r` gibi alanlarla tutuluyor. Şema, gerçek kaynak koddan tam alan alan çıkarılıp migration mapper testleriyle doğrulanmalı.
- `led` masraf defteri kayıtları, `rcpt` fiş/görsel kayıtları ve `wph` iş akışı görselleri ayrı saklanabiliyor. Bu ayrılık yeni sistemde de korunmalı.
- Uygulamada `localStorage` ile ayar kaydı var; `S.key` ve `S.ak` benzeri alanlar API Ninjas / Anthropic isteklerinde API anahtarı olarak kullanılıyor. Bu alanlar kullanıcı ayarlarıyla birlikte Firebase'e gönderilmemeli.
- Anthropic isteği tarayıcıdan, API anahtarı `x-api-key` başlığına konularak yapılıyor. İstemciye girilmiş bir sağlayıcı API anahtarı gerçek bir gizli anahtar gibi korunamaz. Bu entegrasyonun mevcut güvenlik riski ayrı ele alınmalı; anahtarlar kesinlikle tüm şirket üyeleriyle eşitlenmemeli.
- Kaynakta proje oluşturma/render etme, Excel/CSV içe aktarma, akıllı sütun eşleme, fiyat/tutar yerelleştirme, OCR/fotoğraf okuma, iş akışı, masraf defteri, fiş, QR tarama, premium Excel/PDF/print çıktıları, yedek/geri yükleme ve yardım/tanıtım akışları mevcut görünüyor. Bu özellikler entegrasyon sırasında regresyon testine tabi olmalı.

**Önemli:** Bu bilgiler kaynak kodunun statik incelemesine dayanır. Dosyanın tarayıcıda tüm işlevleriyle çalıştırıldığı ve bütün uçtan uca testlerin geçtiği anlamına gelmez. Claude, değişikliğe başlamadan önce ilgili fonksiyonları ve veri nesnelerini tekrar incelemeli.

## 2. Ürün hedefi ve kapsam sınırları

### 2.1 Hedef

Lavora Design; işletme sahibinin, ortağın, çalışanların ve müşterilerin aynı işletme/proje alanında ama birbirinden ayrı veri yetkileriyle çalıştığı; masaüstü ve mobil tarayıcıda kullanılabilen; internet kesintisinde yerel olarak çalışmayı sürdüren; internet gelince çakışmaları veri kaybetmeden çözen bir uygulama olacak.

### 2.2 Tasarım ilkeleri

- **Local-first:** Önce yerel kayıt, sonra buluta senkronizasyon.
- **Security by design:** İzinlerin kaynağı Firebase Security Rules; arayüz yalnızca bu izinlerin kullanıcı deneyimindeki karşılığı.
- **Least privilege:** Her rol sadece işini yapmak için gerekli alanı okur/yazar.
- **Data minimization:** Hiçbir ekranda/istekte ihtiyacından fazla kayıt, satır, görsel veya kullanıcı verisi indirilmez.
- **Explicit sync status:** “Kaydedildi”, “Senkron bekliyor”, “Senkronize”, “Çakışma var” ve “Hata” durumları farklı gösterilir.
- **No silent loss:** Çakışma, kotaya ulaşma, izin reddi veya başarısız kayıt kullanıcıdan gizlenmez.
- **Backward compatibility:** Mevcut projeler, formüller, sayfalar, iş akışı, masraf defteri, fişler, içe aktarma ve dışa aktarma veri kaybı olmadan korunur.
- **Incremental delivery:** Her aşama test edilebilir ve geri alınabilir olmalı.

### 2.3 Kapsam dışı / açıkça yasak

- Tek adımda bütün HTML'i yeniden yazıp eski davranışların korunduğunu varsaymak.
- Fiyatları sadece CSS/menü ile gizleyip Firebase'e aynı veriyi yüklemek.
- Tüm veritabanını `onValue()` ile tek kökten indirmek.
- Görselleri her proje/defter kaydıyla beraber tekrar tekrar indirmek.
- Bir kullanıcının `localStorage` içindeki `role=admin` değerine inanmak.
- Firebase Admin SDK/service account anahtarını HTML/JavaScript'e koymak.
- Test yapılmadan kuralları `read: true` / `write: true` gibi açık bırakmak.
- Ücretsiz katmanın sınırsız olacağına dair varsayımda bulunmak.

---

## 3. Hedef mimari

```text
Kullanıcı arayüzü (Lavora)
  ├─ Authentication / rol çözümleyici
  ├─ Yetkiye göre navigasyon ve bileşenler
  ├─ Proje / iş akışı / defter / fiş / müşteri görünümü
  └─ Senkronizasyon göstergesi + çakışma çözüm ekranı
           │
           ▼
Uygulama servisleri (UI doğrudan Firebase'e yazmaz)
  ├─ ProjectService
  ├─ WorkflowService
  ├─ LedgerService
  ├─ MediaService
  ├─ MembershipService
  ├─ CustomerInviteService
  └─ Export / Import / MigrationService
           │
           ├────────► IndexedDB Repository (kalıcı yerel veri)
           │             ├─ entity stores
           │             ├─ media/blob stores
           │             ├─ syncOutbox
           │             ├─ syncMeta
           │             └─ conflictStore
           │
           └────────► Sync Engine (outbox/inbox, retry, revisions)
                          │
                          ▼
                    Firebase SDK
                      ├─ Firebase Authentication (Google)
                      ├─ Realtime Database (veri + Security Rules)
                      └─ App Check (uygun biçimde yapılandırıldığında)
```

### 3.1 Tek bir veri sahibinin mantığı

Bu sistemde “IndexedDB ve Firebase aynı anda ayrı ayrı gerçeğin tek kaynağıdır” gibi bir yaklaşım olmayacak.

- **İstemci arayüzünün anlık çalışma kaynağı:** IndexedDB.
- **Buluta başarıyla eşitlenmiş kayıtlar için ortak cihazlar arası kaynak:** Firebase Realtime Database.
- **Henüz eşitlenmemiş yerel değişiklik:** IndexedDB içindeki outbox kaydıdır; başarıyla buluta aktarılmadan silinmez.
- **Çakışan değişiklik:** Otomatik ve sessizce ezilmez; revizyon karşılaştırması yapılır, güvenli birleştirme mümkün değilse yerel ve uzak sürüm korunup çakışma kuyruğuna alınır.

Firebase'den gelen olay, yerel depodaki bekleyen düzenlemenin üzerine yazmamalıdır. Yerel kaydın outbox'ında aynı entity için bekleyen değişiklik varsa uzak kopya ya uyumlu biçimde birleştirilmeli ya da çatışma olarak işaretlenmelidir.

### 3.2 Dosya/klasör düzeni önerisi

Mevcut proje tek HTML olsa da Firebase kodu yeni, test edilebilir modüllere ayrılmalı. Seçilecek build aracı mevcut kurulum doğrulandıktan sonra belirlenmeli; Vite gibi küçük bir araç tercih edilebilir. Bir kerede tüm uygulamayı yeniden yazma.

Örnek hedef düzen:

```text
src/
  app/
    bootstrap.js
    session.js
    route-guard.js
    permissions.js
  firebase/
    initialize.js
    auth.js
    database.js
    rules-contract.js
  repositories/
    indexeddb.js
    projects-local.js
    workflow-local.js
    ledger-local.js
    media-local.js
    outbox-local.js
  services/
    projects.js
    workflow.js
    ledger.js
    media.js
    members.js
    customer-invites.js
    migration.js
  sync/
    engine.js
    outbox.js
    remote-listeners.js
    conflict-resolution.js
    quota-monitor.js
  ui/
    login-view.js
    role-gate.js
    sync-indicator.js
    conflict-dialog.js
  tests/
    security-rules/
    migration/
    sync/
```

Bu yalnızca hedef organizasyondur. Entegrasyon mevcut event handler'ları bozmayacak biçimde küçük PR/adımlarla yapılmalı. Hâlihazırdaki global fonksiyonlar ve `data-a` tabanlı eylem modeli incelenmeden aynı isimli global fonksiyonlar eklenmemeli.

---

## 4. Google ile giriş ve hesap durumları

### 4.1 Giriş sayfası

Modern, temiz, responsive bir Lavora giriş sayfası hazırlanmalı. Uygulamanın çalışma masası ekranını doğrudan açmak yerine kullanıcı doğrulanana ve rolü çözülene kadar uygulama içeriği gösterilmemeli.

**Görsel yön:**

- Lavora Design markası; açık, rafine ve ürün/atölye kimliğiyle uyumlu yüzey; güçlü tipografi; kontrollü koyu vurgu; gereksiz gradient, hareket veya kart yığını yok.
- Masaüstünde iki kolonlu sade kompozisyon olabilir: solda kısa marka/değer cümlesi ve soyut üretim/planlama görseli; sağda giriş paneli. Mobilde tek kolon, tek birincil eylem.
- Ana eylem: **“Google ile devam et”**. Google markası/kimliği doğru kullanım kurallarına uygun olmalı.
- Alt durumlar: giriş devam ediyor, popup engellendi, erişim beklemede, yönetici onayı gerekiyor, internet yok, rol iptal edildi, oturum kapatıldı.
- Erişilebilir etiketler, görünür focus, klavye ile kullanım, iyi kontrast ve mobilde 44px civarı dokunma hedefleri.
- Giriş ekranı hiçbir zaman defter/fiyat/proje verisi içermemeli.

### 4.2 Authentication akışı

1. Firebase Auth başlangıcı yapılır.
2. `onAuthStateChanged` beklenir. Henüz sonuç gelmeden `home()` veya `render()` gibi eski kodla tüm modüller açılmaz.
3. Google hesabı doğrulanır; uygun yerde popup ve popup engellendiğinde redirect fallback sağlanır.
4. `auth.currentUser.uid` ile profil/üyelik bilgisi yüklenir.
5. Rol yüklenmeden varsayılan olarak en düşük izin (`pending` veya `unassigned`) uygulanır.
6. Üyelik kapalı/devre dışı ise uygulama verisi yüklenmez ve açık oturum güvenli biçimde kapatılır veya erişim engellendi durumu gösterilir.
7. Rol değişiklikleri için üyelik kaydı canlı izlenir. Rol kaldırılırsa o andan sonra yeni bulut istekleri reddedilmeli, görünüm kapatılmalı, erişilemeyen yerel önbellek kullanıcı arayüzünden temizlenmeli/izole edilmelidir.
8. Firebase Google provider için yetkilendirilmiş domainler sadece gerçek üretim domaini ve test domainleri olacak. `file://` ile doğrudan açma Google OAuth üretim yöntemi değildir; uygulama HTTPS üzerinden sunulmalı.

### 4.3 Hesap ve yerel veri izolasyonu

- Yerel veri tek bir ortak `P` dizisinde bütün kullanıcı hesaplarına açık tutulmamalı. Yeni local şemada kayıtlar `orgId` ve uygun kullanıcı/rol bağlamıyla namespace edilmelidir.
- Kullanıcı A çıkış yapıp kullanıcı B ile giriş yaptığında A'nın projeleri B'nin ekranına gelmemeli.
- Hesap ilk kez açılıyor ve internet yoksa Google kimliği ilk kez doğrulanamaz; uygulama bunu dürüstçe belirtmeli. Daha önce doğrulanmış oturumla çevrimdışı çalışma desteklenebilir, ancak bulut kimliği ve rolün güncel olduğu çevrimdışında garanti edilemez.
- Admin verisi indirilmiş olan bir cihazı sonradan çevrimdışı bırakmakla bu verinin uzaktan geri alınamayacağı unutulmamalıdır. Bu yüzden çalışan cihazına fiyat verisinin hiç indirilmemesi temel gerekliliktir.

---

## 5. Rol modeli ve yetki matrisi

Uygulama tek işletme için başlayacak; veritabanı şeması `orgId` ile bölümlendirilerek gelecekte birden fazla işletmeye genişlemeye elverişli olmalı. İlk işletme kimliği sabit bir `orgId` olabilir.

### 5.1 Roller

#### `admin` — tek kurucu/yönetici

- Bütün iş modüllerini görür ve yönetir.
- Proje oluşturma, düzenleme, arşivleme, silme/geri alma, kopyalama.
- Fiyatlar, teklif toplamları, KDV, masraf defteri, fişler, raporlar ve dışa aktarımlar.
- Bütün iş akışı; çalışan/müşteri erişim hakları; proje kodu/invitation yönetimi.
- Rol atama/kaldırma, erişim kapatma, güvenlik/audit kayıtlarını inceleme.
- Tek admin UID'si değişikliği **uygulama içi rol atama ekranından yapılmaz**. Kurtarma/devir prosedürü Firebase Console + kontrollü kural değişikliğidir.

#### `partner` — işletme ortağı

- İş verisinde admin gibi kapsamlı: projeler, fiyat/teklif, KDV, masraf defteri, fişler, raporlar, iş akışı, yedekleme ve dışa aktarma.
- Adminin işletme operasyonlarını yürütebilmesini sağlar.
- **Güvenlik sahipliği ayrıdır:** yeni admin atayamaz, kendini/başkasını admin yapamaz, sabit kurucu admin UID'sini değiştiremez, Firebase Security Rules veya proje kimlik bilgilerini değiştiremez.
- Kullanıcı rol yönetimi istenirse ilk sürümde yalnız admin ile sınırlandırılmalı. İleride ortağa sınırlı personel yönetimi eklenecekse bu ayrı izin (`canManageMembers`) olmalı; `admin` rolüne dönüşmemeli.

#### `employee` — çalışan

- Sadece **İş Akışı** modülünü görür ve yönetir.
- Kendisine/işletmeye açık iş akışı kayıtlarını, görevleri, ürün adını, gerekli ölçü/adet bilgilerini, aşamaları, terminleri ve iş için gerekli not/fotoğrafları görebilir.
- Çalışan iş akışındaki üretim alanlarını değiştirebilir; hangi alanları düzenleyebileceği net bir allowlist ile tanımlanmalı.
- Proje adını/müşteri için gerekli görünen bilgiyi görebilir; fiyat/teklif verisini alamaz.
- Şunları göremez/çağıramaz: Masraf Defteri, fişler, maliyet ve kâr, birim fiyatlar, satır tutarları, KDV, teklif toplamları, tahsilat, finansal raporlar, finans içeren PDF/Excel/print çıktıları, kullanıcı yönetimi, davet/kod yönetimi, yedeklerden finansal veri çıkarma.
- Bir ekran/menü URL'sini elle çağırsa bile servis ve Firebase kuralları erişimi reddetmelidir.
- Proje verisiyle birlikte fiyat alanlarını içeren bir nesne indirilmemeli. “Fiyatı render ederken göstermeyelim” yeterli değildir.

#### `customer` — müşteri

- Yalnızca UID'sine bağlanmış ve paylaşılmış proje(ler)i görebilir.
- Projenin müşteriye açık durumu, aşama özeti, izin verilmiş termin, müşteriyle paylaşılmış fotoğraflar ve dışa açık güncellemeleri görür.
- Müşteri başka proje adlarını, diğer müşterileri, şirketin genel proje listesini, finans defterini, iç notları, çalışan yönetimini veya admin ekranlarını göremez.
- Varsayılan olarak fiyat/maliyet/masraf verisi gösterilmez. İleride müşteriye teklif gösterilecekse ayrı, admin tarafından onaylanmış bir `customerQuote` veri modeli olmalı; iç maliyet/markup/masraf kayıtları aynı düğümden sunulmamalı.
- Müşteri kendi yeni iş talebini oluşturabilir. Bu bir **talep** olarak kaydedilir; otomatik olarak onaylanmış operasyon projesi sayılmaz.
- İzin verilmiş kendi talep alanlarını düzenleyebilir; işletme içi aşama/tarih/atama alanlarını keyfi olarak değiştiremez.

#### `pending` / `disabled`

- `pending`: Google ile giriş yapmış ama admin tarafından rol/erişim verilmemiş hesap. İş verisi okuyamaz.
- `disabled`: üyelik kapalı. İş verisi okuyamaz/yazamaz.
- Bilinmeyen/eksik role varsayılan `employee` veya `admin` muamelesi yapılmaz; daima en düşük erişim.

### 5.2 Yetki matrisi

| Özellik/veri | Admin | Ortak | Çalışan | Müşteri |
|---|---:|---:|---:|---:|
| Proje tam içeriği ve ticari alanlar | Tam | Tam | Hayır | Hayır |
| Proje adı ve güvenli özet | Tam | Tam | İş için gerekli | Yalnız kendisine bağlı proje |
| Birim fiyat, satır tutarı, KDV, teklif toplamı | Tam | Tam | **Yasak** | Varsayılan **yasak** |
| İş akışı ekranı | Tam | Tam | **Tam operasyonel erişim** | Yalnız müşteri görünümü |
| İş akışı iç notları | Tam | Tam | İş için izin verilen notlar | Hayır |
| Müşteriye açık güncelleme/fotoğraf | Tam | Tam | Yetkili alanlarda | Kendi projesinde oku |
| Masraf defteri | Tam | Tam | **Yasak** | **Yasak** |
| Fişler ve finansal ekler | Tam | Tam | **Yasak** | **Yasak** |
| Finansal PDF/Excel/print | Tam | Tam | **Yasak** | **Yasak** |
| Genel yedek/geri yükleme | Tam | Tam (işletme verisi) | **Yasak** | **Yasak** |
| Kullanıcı rolleri / erişim kapatma | Tam | İlk sürümde hayır | Hayır | Hayır |
| Müşteri talebi gönderme | İzinli | İzinli | Hayır | Kendi talebini gönderir |
| Yeni admin oluşturma | UI üzerinden hayır | Hayır | Hayır | Hayır |

Bu tablo, uygulama UI'sı kadar Realtime Database kurallarının ve servis katmanının da sözleşmesidir.

---

## 6. Adminin rol ataması ve kullanıcı yönetimi

1. Google ile giriş yapan kullanıcı, ilk girişte `pending` olur; uygulama şirket verisini yüklemez.
2. Admin panelindeki **Kullanıcılar ve Roller** ekranında yeni giriş yapan hesap listelenir: görünen ad, e-posta, UID'nin kısaltılmış/ayrıntı görünümü, ilk görülme tarihi, mevcut rol ve durum.
3. Admin, doğrulanan kullanıcı UID'sine `partner`, `employee`, `customer` veya `disabled` atar. Rol değişikliği audit kaydı oluşturur.
4. E-posta adresini tek başına yetki anahtarı yapma. Temel kimlik `auth.uid` olmalı. Aynı e-postanın sağlayıcı durumu/değişmesi gibi durumlarda rol eşleştirmesi UID üzerinden yapılmalı.
5. İstemci, kullanıcı kendi `role` alanını değiştiremesin diye kendi profil yazma yolunu rol yazma yolundan ayırmalı. Üyelik rolünü yalnız sabit admin UID'si yazabilir.
6. Ortak/çalışan müşteri rolünü kendi lehine değiştirememeli, üyelik yazamazsa UI hatası gösterip sunucu reddini loglamalı.
7. Admin kendisini yanlışlıkla devre dışı bırakamamalı; kurucu admin üyelik kaydı güvenli kuralla korunmalı.
8. Kullanıcının rolü değiştiğinde açık ekran ve abonelikler derhal yeniden değerlendirilir. Sadece menüyü gizlemek yeterli değildir.
9. Adminin rol atama işlemi, kullanıcı birden fazla sekmede açıkken de güvenli çalışmalı; üyelik tekrar okunmalı, eski oturum yetkileri güncellenmeli.
10. Üyelik ve rol atamalarında kim, kimi, ne zaman, hangi rolden hangi role aldı gibi asgari audit bilgisi tutulmalı; API anahtarı, token veya hassas içerik loglanmamalı.

---

## 7. Müşteri akışı: talep, proje ve erişim kodu

Müşteri kodu, genel bir giriş parolası değildir; sadece belirli bir proje için, sınırlı erişim sağlayan, tahmin edilmesi zor bir davet/bearer kodudur.

### 7.1 Önerilen akış

1. Müşteri Google ile giriş yapar. Rolü henüz yoksa admin onayı/rol bekleme ekranını görür.
2. Admin bu kullanıcıyı `customer` rolüne alır veya müşteri kaydı admin tarafından açılır.
3. Müşteri “Yeni proje talebi” gönderir. Bu talep ayrı `customerIntakes` alanında tutulur; projelerin ana verisine otomatik erişim vermez.
4. Admin talebi inceler, gerçek çalışma projesini oluşturur ya da mevcut projeye bağlar.
5. Admin bu proje için tek kullanımlık, yüksek entropili bir kod üretir (örn. kriptografik rastgele 128 bit veya daha fazla). Kod arayüzde yalnız oluşturulduğunda gösterilir; kısa ardışık kod/`1234`/tahmin edilebilir ID kullanılmaz.
6. Müşteri, uygulamada “Proje kodunu gir” ekranında kodu girer. Kod projeye ait üyelik ile eşleştirilir; sadece o `projectId` için müşteri görünümü açılır.
7. Kod kullanıldıktan sonra yeniden kullanılamaz; süre/iptal/yenileme desteği olur. Kod iptal edilse dahi daha önce verilmiş proje üyeliği ayrıca kaldırılabilir.
8. Kod asla doğrudan “projenin bütün JSON'unu gönder” endpoint'i gibi çalışmamalı. Yalnızca müşterinin UID'si ile belirli proje arasında erişim ilişkisi oluşturmalı.

### 7.2 Güvenli kod kullanımı

- Kodun kendisini path/URL query içinde taşımama, analytics/console loglarına yazmama.
- Kodun hash'ini saklama tercih edilmeli. Örn. kriptografik `SHA-256` ile kod normalize edilip hash anahtarı üretilebilir; ham kod kalıcı olarak DB'ye yazılmamalı.
- Yalnız üyeliği doğrulanmış kullanıcı kod kullanabilmeli.
- Kod tek kullanımlık tüketimde atomik işlem/RTDB transaction kullanılmalı; iki eşzamanlı redeem birden başarılı olmamalı.
- Redeem akışı yarıda kesilirse müşteri kilitlenmemeli: aynı UID için güvenli idempotent tekrar denemede önceki başarılı claim tespit edilip üyelik tamamlama tekrar yapılabilmeli.
- İptal edilmiş, süresi dolmuş, yanlış biçimli veya kullanılmış kodlar açıklayıcı ama bilgi sızdırmayan hata göstermeli.
- Cloud Functions gibi backend doğrulaması eklenirse dağıtım/ücret gereksinimi ayrıca değerlendirilmelidir. Sadece Spark istemci akışı kullanılacaksa güvenlik kuralları ve atomik claim tasarımı Security Rules Emulator ile kanıtlanmalı; “rastgele uzun kod” tek güvenlik katmanı olarak bırakılmamalı.

### 7.3 Müşteri görünümü ile işletme görünümünü ayır

Müşterinin gördüğü proje sayfası, iç proje editörünün gizlenmiş kopyası olmamalı. Ayrı bir müşteri görünümü ve ayrı veri modeli kullan. Müşteriye açılmış tek bir fotoğraf/not kaydı, başka müşteri notlarının veya personel iç notlarının bulunduğu genel koleksiyonun okunmasını sağlamamalı.

---

## 8. Realtime Database veri şeması

Aşağıdaki şema mantıksal taslaktır; Claude kaynak verileri bu şemaya dönüştürürken bir migration tablosu ve tip doğrulayıcıları yazmalıdır. Gerçekten ihtiyaç duyulmayan alanlar sırf burada yazıyor diye eklenmemeli.

```text
/meta
  schemaVersion
  minimumClientVersion

/userProfiles/{uid}
  displayName
  email
  photoURL
  createdAt
  lastSeenAt
  # Rol burada tutulmaz; profil ile yetki ayrıdır.

/orgs/{orgId}/members/{uid}
  role                 # admin/partner/employee/customer/pending/disabled
  status               # active/pending/disabled
  assignedBy
  assignedAt
  updatedAt

/orgs/{orgId}/projectIndex/{projectId}
  id
  name
  customerDisplayName # gizlilik için yalnız gerekli bilgi
  workflowStatus
  dueDate              # paylaşılmasına karar verilmiş termin
  updatedAt
  schemaVersion
  # fiyat, toplam, KDV, kâr, masraf, iç not, fiş Base64'i YOK.

/orgs/{orgId}/projectPublic/{projectId}
  id
  name
  safeDescription
  customerDisplayName
  createdAt
  updatedAt
  schemaVersion
  # çalışan/müşteri tarafından görülebilecek alanlar. Hassas veri YOK.

/orgs/{orgId}/projectFinancials/{projectId}
  kdv
  sheets/{sheetId}
    title
    rows/{rowId}
      itemName
      unit
      quantity
      unitPrice
      lineTotal
  quoteTotals
  internalCost
  margin
  paymentSummary
  updatedAt
  revision
  # Admin ve partner alanı. Employee/customer erişimi kesinlikle reddedilir.

/orgs/{orgId}/workflowStaff/{projectId}
  dueDate
  items/{itemId}
    name
    quantityOrMeasure
    stageStates
    status
    assignedTo
    staffNotes
    staffVisibleMediaIds
    updatedAt
    revision

/orgs/{orgId}/customerViews/{uid}/{projectId}
  customerStatus
  progressPercent
  customerVisibleDueDate
  updates/{updateId}
    text
    createdAt
    createdBy
    mediaIds
  # Yalnız müşteri için açıkça hazırlanmış veriler. İç personel notlarını/atanan
  # çalışan bilgisini veya finans alanlarını kendiliğinden kopyalama.

/orgs/{orgId}/internalNotes/{projectId}/{noteId}
  text
  createdBy
  createdAt
  # İlk sürüm: admin + ortak. Çalışan notlarının ayrı, iş için gerekli bir alanı olabilir.

/orgs/{orgId}/ledger/{recordId}
  date
  kind
  amount
  category
  projectId
  note
  createdAt
  updatedAt
  # Admin + ortak.

/orgs/{orgId}/receipts/{receiptId}
  date
  amount
  mediaId
  projectId
  note
  createdAt
  # Admin + ortak. Receipt görüntüsü ayrı, yetkili medya yolunda.

/orgs/{orgId}/mediaMetadata/staff/{projectId}/{mediaId}
/orgs/{orgId}/mediaMetadata/customer/{uid}/{projectId}/{mediaId}
/orgs/{orgId}/mediaMetadata/finance/{mediaId}
/orgs/{orgId}/mediaMetadata/customerIntakes/{uid}/{requestId}/{mediaId}
  # Yalnız metadata: mimeType, byteLength, checksum, createdAt, createdBy,
  # width/height, thumbnailId, projectId ve visibility. Base64 YOK.

/orgs/{orgId}/mediaThumbnails/{visibility-specific-path...}/{mediaId}
  dataBase64           # düşük çözünürlüklü thumbnail; doğrudan tek mediaId ile okunur

/orgs/{orgId}/mediaPayloads/{visibility-specific-path...}/{mediaId}
  dataBase64           # sıkıştırılmış full görsel; doğrudan tek mediaId ile okunur
  # Media payload koleksiyon köklerine .read izni verilmez; genel liste snapshot'ı
  # yanlışlıkla bütün Base64 dosyalarını indirmemelidir.

/orgs/{orgId}/customerProjectIndex/{uid}/{projectId}
  projectId
  inviteHash
  grantedAt
  # Müşterinin kendi proje listesi. Customer reads are UID-scoped.
  # Admin/ortak bu ilişkiyi atar veya davet kullanımıyla kurallar üzerinden doğrular.

/orgs/{orgId}/projectInvites/{inviteHash}
  projectId
  createdBy
  createdAt
  expiresAt
  usedBy
  usedAt
  revokedAt

/orgs/{orgId}/internalNotes/{projectId}/{noteId}
  text
  createdBy
  createdAt
  # Yalnız admin/ortak; çalışan için ayrı staffNotes alanı kullanılır.

/orgs/{orgId}/customerIntakeIndex/{requestId}
  requestId, uid, title, status, createdAt, updatedAt  # Küçük özet; yalnız admin/ortak listesi

/orgs/{orgId}/customerIntakes/{uid}/{requestId}
  title
  description
  attachmentMediaIds
  status               # submitted/reviewing/accepted/rejected
  createdAt
  updatedAt

/orgs/{orgId}/audit/{eventId}
  actorUid
  action
  entityType
  entityId
  at
  safeSummary
```

### 8.1 Kritik şema kuralı: hassasiyet sınırı

Realtime Database Security Rules üst düğümde `.read: true` veya role için `.read` izni verdiğinde alt çocuklar da o okuma iznine miras kalabilir. Bu nedenle `/projects/{id}` gibi tek nesnenin içinde `name`, `workflow` ve `unitPrice` alanları birlikteyken, çalışan için üst düğümü okunur bırakıp sadece `unitPrice` çocuk yolunu kapatmaya çalışmak güvenli bir tasarım değildir.

- Çalışanın okuması gereken alanlar `projectPublic`, `workflowStaff` gibi ayrı güvenli yollarda olmalı.
- Finans alanları `projectFinancials`, `ledger`, `receipts` gibi ayrı yollar altında kalmalı.
- Müşteri görünümü ayrı `customerViews/{uid}/{projectId}` ve `customerProjectIndex/{uid}/{projectId}` ilişkisiyle sınırlı olmalı.
- Farklı görünürlüğe sahip görseller de ayrı yetki yollarında saklanmalı. Bir `media/{id}` düğümünün tamamını okumak hem thumbnail hem özel payload'i açıyorsa, o düğüm farklı görünürlükteki alanları içermemeli.

### 8.2 İndeksler ve sorgular

- `updatedAt`, `projectId`, `status` veya gerçekten sorgu yapılan alanlar için gerekli `.indexOn` tanımları eklenmeli.
- İşletmenin bütün verisi tek `/orgs/{orgId}` snapshot'ıyla çekilmemeli.
- Ana ekranda küçük `projectIndex` özetleri; detay ekranında yalnız seçilen proje için ilgili kayıt; görsel açılırken ilgili media payload okunmalı.
- Müşteri tüm `projectIndex` koleksiyonunu okuyamamalı. Sadece UID'sine erişim ilişkisi bulunan proje ID'leri için ayrı kayıtlar sorgulanmalı/yüklenmeli.
- Fiyat/defter verisini yükleyen repository yalnız admin/partner görünümünde çağrılmalı; yine de son kararı Security Rules vermeli.

---

## 9. Security Rules: güvenlik sözleşmesi

Başlangıç dosyaları bu şartnameyle birlikte hazırlanmıştır: `database.rules.json` (placeholder UID'li, henüz canlıya dağıtılmaya hazır olmayan Rules taslağı) ve `database.rules.test.js` (Emulator için otomatik test taslağı). Bunlar ürünün gerçek Firebase şemasıyla karşılaştırılıp Emulator'da çalıştırılmalı; JSON'un parse olması veya JS syntax kontrolü Rules'un geçerli/güvenli olduğunu kanıtlamaz. Security Rules Emulator testleri olmadan yayına geçme.

### 9.1 Zorunlu kurallar

- Varsayılan her şey kapalı: açıkça izin verilmemiş hiçbir yol okunamaz/yazılamaz.
- `auth != null` tek başına iş verisine erişim vermemeli.
- Admin, uygulama istemcisinden gelen bir `role: "admin"` alanıyla değil, Firebase Auth `auth.uid` değeri ile tanımlanan sabit kurucu UID üzerinden doğrulanmalı.
- Üyelik rol yazımı yalnız bu sabit admin UID'sine açık olmalı; kullanıcı kendi rolünü güncelleyememeli.
- `projectFinancials`, `ledger`, `receipts`, finansal export hazırlamak için gereken bulut verisi: yalnız admin + partner.
- `workflowStaff`: admin + partner + çalışan, ama sadece tanımlanmış alanlarda yazma izni.
- `customerViews/{uid}/{projectId}`: admin + partner ve yalnız `customerProjectIndex/{uid}/{projectId}` ile projeye atanmış aynı UID müşteri için okunabilir.
- Müşteri erişim kuralı e-posta karşılaştırmasına değil, `auth.uid` ile `customerProjectIndex/{uid}/{projectId}` eşleşmesine dayanmalı. Liste yalnız müşterinin kendi UID düğümündedir.
- `customerIntakes/{uid}` yazımı yalnız `auth.uid === uid` ve kabul edilen alan şeması için mümkün olmalı. Bu yol iç projeleri veya üyelikleri değiştirememeli. Tam `customerIntakes` ağacına okuma verilmez; admin listesi küçük `customerIntakeIndex` özetlerini sorgular ve ayrıntıyı UID/request ID üzerinden açar.
- `mediaMetadata`, `mediaThumbnails` ve `mediaPayloads` yolları görünürlüklerine göre ayrılmalı. Metadata listesi Base64 içermemeli; thumbnail/full payload için koleksiyon kökünde okuma izni verilmemeli, yalnız bilinen `{mediaId}` doğrudan okunmalı.
- Üyelik/rol/audit/finansal alanlarda istemcinin gelişigüzel alan eklemesini engellemek için `.validate` kuralları (tip, alan listesi, uzunluk ve aralık) kullanılmalı.
- Silme/geri alma, rol iptali, davet redeem/expire ve değişiklik günlüğü akışları da kurallarla sınırlandırılmalı.
- App Check web için uygun sağlayıcıyla yapılandırılmalı; bu ek korumadır, Authentication veya Security Rules yerine geçmez.

### 9.2 Client-side güvenliğe dair yasaklar

- Sadece `if (role === 'admin')` kontrolüyle Firebase erişimini güvenli kabul etme.
- Rolü localStorage'dan veya URL parametresinden okuma.
- Yetkileri `display:none`/CSS ile koruduğunu iddia etme.
- Bütün kullanıcıların okuyabildiği bir `users` düğümüne rol listesini açma.
- Firebase API anahtarını gizli sunucu anahtarı sanma. Firebase web config'in istemcide bulunması normal olabilir; asıl erişim güvenliği Authentication ve Security Rules'dur.
- Servis hesabı/private key/Anthropic/Ai provider anahtarlarını HTML, localStorage, IndexedDB veya Realtime Database'e koyma.

### 9.3 Kurucu adminin ilk kurulumu

- Google ile ilk giriş yapan her kullanıcı kendi alanlarıyla sınırlı `/userProfiles/{uid}` profilini oluşturur/günceller. Bu profil yetki vermez; yalnız sabit admin profil listesini okuyabilir. Üyeliği olmayan kullanıcıya iş verisi açılmaz; uygulamada “Erişim bekliyor” ekranı gösterilir.
- Admin Google ile ilk giriş yaptıktan sonra Firebase Console'dan doğrulanan UID tespit edilir.
- `ADMIN_UID` değeri kurallar içinde sabitlenir. Bu UID olmadan kimse admin olamaz.
- Admin profil listesinden UID'yi kontrol ederek kullanıcıya `partner`, `employee` veya `customer` rolü atar. Rol ataması UID ile yapılır, e-posta eşleşmesi yetkilendirme anahtarı değildir.
- Müşteri `customer` olarak etkinleştirildikten sonra admin/ortak proje için tek kullanımlı, süreli davet kodu üretir. Kod sadece `customerProjectIndex/{uid}/{projectId}` oluşturur; kod kendi başına finans veya genel proje erişimi vermez.
- Canlı veri açılmadan önce `database.rules.json` içinde gerçek UID yerleştirilir; placeholder ile yayına çıkılmaz.
- Admin UID'sini istemci kodunda sabitlemek tek başına yeterli değildir; sunucu tarafında kontrol eden Security Rules esastır.
- Admin e-posta adresi değişse bile UID temel kimliktir. Hesap kaybedilirse kontrollü kurtarma prosedürü uygulanır; herkese açık “ilk gelen admin olur” mantığı kesinlikle bulunmaz.

---

## 10. IndexedDB şeması ve yerel dayanıklılık

Mevcut `lavora` veritabanı sürüm 4 olduğu için object store'ları silip baştan kurma. Sürümlü `onupgradeneeded` geçişi yaz; eski veriyi yedekleyip dönüştürmeden yok etme.

### 10.1 Önerilen store'lar

- `p` / `projectsLocal`: mevcut proje kaydının backward-compatible gövdesi veya yeni normalize kayıtlar. Geçiş süresince mevcut store adını korumak gerekiyorsa adapter arkasına al.
- `scans`: QR/tarama geçmişi, açıkça gerekli değilse otomatik olarak tüm şirkete senkronize edilmez.
- `led`: yerel defter kayıtları; finansal bulut sync sadece admin/partner.
- `rcpt`: fiş meta + Blob/Base64 yerel içerik referansı.
- `wph`: iş akışı fotoğrafı meta ve yerel Blob.
- `mediaLocal`: yerel Blob/ArrayBuffer ve thumb; büyük Base64 JSON metinlerini mümkünse Blob olarak sakla.
- `syncOutbox`: henüz başarıyla gönderilmemiş idempotent değişiklikler.
- `syncMeta`: son sync bilgileri, schema version, user/org namespace, cursor ve sağlık durumu.
- `syncConflicts`: yerel ve uzak sürümleri birlikte koruyan çakışma kayıtları.
- `syncInbox` gerekiyorsa: sunucudan alınıp henüz işlenmemiş delta/olaylar; işlendikten sonra temizlenebilir.

### 10.2 IndexedDB tasarım kuralları

- Bir iş değişikliği ile outbox kaydı **tek IndexedDB transaction** içinde yazılmalı. Değişiklik kaydedilip kuyruk kaydı yazılamazsa sistem bunu başarılı saymamalı.
- Blob'lar için boyut hesapla; `navigator.storage.persist()` talebi mevcut koddaki gibi devam edebilir ama bunun kesin garanti olmadığı UI'da anlaşılmalı.
- `QuotaExceededError` yakalanmalı; kaydı başarısız olan kullanıcıya “kaydedildi” denmemeli. Alternatif olarak medya sıkıştırma/temizleme/backup yönergesi gösterilmeli; kritik veriyi otomatik silme.
- Tarayıcı verisi temizlenmesi/cihaz kaybı riski için tam JSON yedeği ve geri yükleme mevcut kabiliyeti korunmalı; yedek dışa aktarımı yetki kontrollü olmalı.
- Yerel veriler `uid`/`orgId` sınırında ayrılmalı. Farklı Google hesabına girildi diye aynı yerel proje koleksiyonu başka hesaba bağlanmamalı.
- Yerel store'a doğrudan UI'dan dağınık `tx()` çağrıları eklemek yerine repository servisi üzerinden erişim kademeli standardize edilmeli.

---

## 11. Senkronizasyon motoru

### 11.1 Temel outbox şeması

Her değişiklik için örnek alanlar:

```json
{
  "mutationId": "uuid-v4-or-crypto-random-id",
  "orgId": "ORG_ID",
  "actorUid": "FIREBASE_UID",
  "entityType": "workflowItem",
  "entityId": "ENTITY_ID",
  "operation": "upsert",
  "baseRevision": 12,
  "localRevision": 13,
  "createdAtLocal": 1790000000000,
  "status": "pending",
  "attemptCount": 0,
  "lastErrorCode": null,
  "payload": {}
}
```

Bu örnek mantıksaldır. `payload` yalnız o rolün değiştirebildiği alanları içermeli. Finansal entity'lerin payload'ı hiçbir zaman employee/customer outbox'ına girmemeli.

### 11.2 Yerel yazım sırası

1. Kullanıcı işlemi yapar.
2. İstemci rol/alan allowlist'i kontrol eder (hızlı UX kontrolü; tek güvenlik katmanı değil).
3. Yerel entity ve outbox kaydı aynı IndexedDB transaction içinde yazılır.
4. UI “Cihaza kaydedildi · Senkron bekliyor” gösterir.
5. Online ise sync engine outbox'ı işler; offline ise bekler.
6. Firebase yazımı sunucudan başarı dönmeden outbox kaydı tamamlandı olarak işaretlenmez.
7. Başarıdan sonra cloud revision ve server timestamp işlenir; outbox öğesi idempotent olarak tamamlanır.
8. Başarısızlıkta kayıt korunur, hata sınıflandırılır, tekrar deneme zamanlanır.

### 11.3 Online durum ve tekrar deneme

- `/.info/connected` Firebase bağlantı sinyali, `navigator.onLine` ise yardımcı sinyaldir; ikisi de tek başına write'ın başarılı olduğunu kanıtlamaz.
- Gerçek write response/transaction sonucu kontrol edilmeli.
- Yeniden denemeler exponential backoff + jitter ile olmalı; ör. 1s, 2s, 4s, 8s, üst sınır, jitter. Sekme her açıldığında tüm geçmişe saldıran hızlı döngü olmasın.
- `permission_denied`, `invalid_payload`, `quota_exceeded` gibi kalıcı hatalar sonsuz tekrar edilmemeli; kullanıcıya aksiyon gösterilmeli.
- Ağ yeniden geldiğinde tüm veriyi tam snapshot ile göndermek yerine sadece outbox mutation'ları gönderilmeli.
- Aynı mutation tekrar gönderilirse ikinci kez kayıt/fiş/proje üretmemeli. `mutationId` ile idempotent işlem tasarlanmalı.

### 11.4 Uzak veriyi alma

- İlk senkronizasyon yalnız rolün okuyabildiği küçük indeksler ve gerekli yerel proje detaylarından oluşmalı.
- Sonraki turda sadece ilgili path için `child_added`, `child_changed`, `child_removed` veya uygun sorgulu listener kullan; tüm kök `value` listener'ı kullanma.
- İlgili listener kapatılırken `off()`/unsubscribe çalışmalı; bir proje ekranından çıkınca gereksiz listener kalmamalı.
- Medya payload'ları proje snapshot'larına eklenmez. Thumbnail ve full image ayrı isteğe bağlı indirilir.
- Uzak değişiklik yerel store'a işlenirken o entity için bekleyen yerel outbox varsa overwrite edilmez; çakışma çözümüne gider.
- `lastSyncAt` tek başına güvenilir cursor kabul edilmemeli; aynı zaman damgasındaki değişiklikler için `revision`/key veya overlap-window mantığı düşünülmeli.

### 11.5 Çakışma politikası

Genel “son yazan kazanır” projede sessiz veri kaybına yol açabileceği için varsayılan olamaz.

- Farklı entity/bağımsız alanlar mümkün olduğunda ayrı path/entity'lerde tutulur; örneğin çalışan iş akışını değiştirirken finansal teklif dokümanını ezmemelidir.
- Aşamalar/görevler gibi düşük çakışma riskli alanlar item bazında yazılır.
- Hem yerel hem uzak sürüm aynı `baseRevision` üzerinden değiştiyse, sistem her iki değişikliği de koruyup çakışma kaydı açar.
- Çakışma ekranında “Yerel sürüm”, “Bulut sürümü”, farklı alanların karşılaştırması ve “Birleştir / yereli ayrı kopya yap / bulut sürümünü seç” seçenekleri olur. Fiyat/toplam gibi finansal verilerde otomatik birleşim yapılmaz.
- Silmeler tombstone (`deletedAt`, `deletedBy`, `revision`) ile temsil edilir. Uzak silinmiş kayıt varken eski offline kopya tekrar upload edilip projeyi diriltmemeli.
- İşlem geçmişi ve silme/geri alma admin/ortak için görünür olmalı.

### 11.6 Değişiklik sıralaması

- Aynı entity için bekleyen operasyonlar yaratılma/revision sırasına göre işlenmeli.
- Örneğin proje oluşturma başarısızken ona bağlı iş akışı fotoğrafı referansı yüklenmemeli; parent entity ve medya ilişkisi kurulana kadar beklemeli.
- Bir görselin yüklemesi başarısız olursa not/iş akışı metni kaydedilmiş olabilir; UI bu görselin “yüklenmedi” durumunu açıkça göstermeli ve cloud kaydına kırık URL/var olmayan media ID yazmamalı.

---

## 12. Görsel, Base64, Excel ve diğer medya dosyaları

### 12.1 Ücretsiz katman gerçeği

Firebase Realtime Database'in resmi fiyatlandırmasında Spark planında **1 GB saklama** ve **aylık 10 GB indirme** kotası bulunur. Realtime Database indirme tüketimi yalnız dosyanın kendisi değil ağ/protokol overhead'ini de içerebilir. Cloud Storage for Firebase için yeni varsayılan bucket oluşturma ve mevcut bucket'lara erişim, güncel politika uyarınca Blaze planı gerektirir; bu yüzden **“Firebase Storage'ı tamamen ücretsiz Spark projesinde kullanırız” varsayımı yapılmamalı**. Güncel durum canlıya çıkıştan önce Firebase Console ve fiyatlandırma sayfasından yeniden teyit edilmeli.

Resmî kaynaklar:
- Realtime Database fiyatlandırma ve kota: https://firebase.google.com/pricing/
- RTDB indirme tüketimini anlama: https://firebase.google.com/docs/database/usage/billing
- Cloud Storage for Firebase plan değişikliği: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024

### 12.2 Base64 kararı

Kullanıcının ücretsiz Spark hedefi nedeniyle Base64 görsel içeriği RTDB'de saklanacaksa aşağıdaki kısıtlar zorunlu:

- Görseller RTDB'nin `project` veya `workflow` JSON nesnesine gömülmez; görünürlük bazlı `mediaMetadata`, `mediaThumbnails` ve `mediaPayloads` yollarına ayrılır. Metadata kaydı Base64 içermez.
- Base64 metni ham ikili veriden yaklaşık %33 daha büyük olur. Bu nedenle sıkıştırma **Base64'e çevirmeden önce** yapılır.
- Görseller önce tarayıcıda boyut düşürülerek JPEG/WebP üretilir. Şeffaflık gerekmiyorsa fotoğraf için JPEG; şeffaf grafik gerekirse WebP/PNG kararını içerik türü belirler.
- Başlangıç hedefi: full görsel uzun kenar en fazla 1280 px, kalite yaklaşık 0.68–0.78; hedef 150–220 KB, hard limit 300 KB. Thumbnail uzun kenar 240 px, hedef en fazla 20 KB. Bunlar başlangıç limitleridir; gerçek fotoğraf kalitesi ve kullanım senaryosuyla test edilip yapılandırılabilir.
- 300 KB hedefini aşan görsel tekrar sıkıştırılır; hâlâ geçemiyorsa otomatik sınırsız yüklemek yerine kullanıcıya uyarı ve yerel-only seçeneği sunulur.
- Upload'dan önce `byteLength`, `mimeType`, `width`, `height`, `checksum` hesaplanır. Tam veri ve metadata arasındaki ilişki doğrulanır.
- Büyük Base64 string'leri localStorage'a koyma. Yerelde Blob/ArrayBuffer olarak IndexedDB kullan.
- Proje listesi, iş akışı listesinin genel snapshot'ı veya RTDB listener'ı görsel Base64'ü içermemeli. Görselin küçük thumbnail'i ayrı istenir, tam görsel yalnız açıldığında ve o kullanıcının izni varsa indirilir.
- Müşteri fotoğrafı, çalışan üretim fotoğrafı ve finans fişi ayrı görünürlükle saklanır. Fişler employee/customer tarafından okunamaz.
- Görsel kimliği değişmez olmalı; tekrar yükleme/dosya aynıysa checksum yardımıyla duplicate azaltılabilir.
- Silinen görsel için önce referanslar kontrol edilir; tombstone ve güvenli temizlik yapılır. Başka kayıt referans veriyorsa doğrudan silinmez.

### 12.3 Excel/CSV stratejisi

- Excel içeriği içe aktarılırken projeye yazılan hücreler/satırlar normal proje verisi olarak senkronize edilir.
- Ham `.xlsx` dosyasının Base64'e çevrilip her proje kaydıyla saklanması varsayılan değildir: XLSX sıkıştırılmış bir ZIP olduğundan Base64 ile tekrar büyür ve büyük dosyalar kotayı hızla tüketebilir.
- Varsayılan: dosyayı cihazda tut, içeriği senkronize et, diğer cihazda Excel'i yeniden üretebil.
- Ham Excel'in cihazlar arasında korunması gerekiyorsa media attachment olarak ayrı kaydet, maksimum boyut (başlangıç önerisi: 500 KB) ve download-on-demand uygula. Bu limiti aşan dosya için “sadece bu cihazda” veya başka bir dosya depolama altyapısı seçeneği gösterilir; sessizce kesilmez.
- Dışa aktarılan Excel/PDF dosyası varsayılan olarak cloud'a geri yüklenmez; tekrar üretilebilir çıktı yerelde oluşturulur.
- Fiyat içeren export için admin/ortak rolü hem UI hem servis hem Security Rules seviyesinde kontrol edilir.

### 12.4 Firebase Base64 medya yükünün maliyeti nasıl izlenecek

- `mediaPayloads` listener'ı genel listeye bağlanmaz; Rules taslağında payload collection parent'larına `.read` verilmez, her tam görsel yalnız doğrudan `mediaId` ile istenir.
- Her medya için cloud `byteLength` ve local cache boyutu raporlanır.
- Admin panelinde günlük/aylık tahmini yükleme/indirme, toplam medya sayısı, yaklaşık RTDB depolaması ve kalan kota için yardımcı gösterge olur. Firebase faturası/kota ölçümü yerine geçmediği açık yazılır.
- Her kullanıcı girişinde bütün görseller tekrar çekilmez. Yerel cache varsa checksum/updatedAt üzerinden yalnız değişen kayıt çekilir.
- Canlı sistemde RTDB usage grafiklerine ve budget alerts kullanılabiliyorsa uyarılara bakılır. Spark planında ücretlendirilmemek kullanım limitlerinin önemsiz olduğu anlamına gelmez; limit aşımı/kapasite etkisi olabilir.

---

## 13. Eski uygulamadaki verilerin güvenli geçişi

### 13.1 Migration ilkeleri

- Mevcut IndexedDB verisi kullanıcı için değerli; hiçbir store silinmeden önce tam yedek alınmalı.
- Migration iki geçişte uygulanmalı: önce dry-run ve rapor, sonra admin onayıyla aktarım.
- Mevcut proje verisini Firebase'e olduğu gibi JSON.stringify ederek yükleme. `p.s` içindeki fiyat satırları ve workflow'u ayıran mapper gerekiyor.
- Eski proje ID'leri mümkün olduğu kadar korunmalı; kimlik değişecekse kalıcı `legacyId -> newId` haritası tutulmalı.
- `u` gibi eski yerel timestamp alanları yeni `updatedAt/revision` değerine dönüştürülürken kaydın orijinal tarihi kaybolmamalı.
- Proje, defter, fiş, workflow fotoğrafı ve scan sayıları migration öncesi/sonrası karşılaştırılmalı.
- `S` içinden API sağlayıcı anahtarları, kimlik bilgileri, ses tercihi gibi kişisel/cihaz-özel ayarlar cloud'a yüklenmemeli. Bu alanları export etmek için ayrı bir kullanıcı onayı ve filtre gerekir; en güvenlisi API key'leri dışarıda bırakmaktır.
- Fiyat içeren proje nesnesi `employee` rolüyle giriş yapılmış tarayıcıda cloud'a upload edilmemeli.

### 13.2 Önerilen migration adımları

1. Eski dosyanın kopyası ve tam yerel JSON yedeği alınır.
2. `lavora` v4 içindeki tüm store'ların kayıt sayıları, boyutları ve örnek şemaları raporlanır; bozuk kayıtlar otomatik silinmez.
3. `migrationPreview()` proje/sayfa/satır/defter/fiş/medya sayılarını, eksik ID'leri, bozuk hücreleri ve ayrıştırılan finansal alanları listeler.
4. Şema mapper'ı pure function olarak yazılır ve aynı girdi her zaman aynı sonucu üretir; test örnekleri yedek JSON'dan üretilir.
5. Admin giriş yapmış ve rolü doğrulanmışken yalnız o cihazdaki mevcut işletme verisini yeni `orgId`'ye aktarmayı seçer.
6. Yerel proje public ve private parçalara ayrılır; workflow'un çalışan ve müşteri görünümü ayrı üretilir; medya referansları temizlenir.
7. Cloud upload başarılı sayılmadan migration checkpoint'i “tamamlandı” olmaz. Başarısız kayıtlara retry verilir.
8. Firebase'deki kayıtlar tekrar okunur, izin sınırları doğrulanır; sayılar/alan toplamları karşılaştırılır.
9. Admin onayından sonra `migrationVersion` ve `migrationCompletedAt` işaretlenir. İkinci kez çalıştırıldığında duplicate proje/defter/fiş üretmemeli.
10. Eski yerel kayıtlar korunur. Güvenli bir süre ve yedek doğrulaması geçmeden kaynak veriyi silme.

### 13.3 Finansal verinin ayrıştırılması

- Proje sayfası satırlarının hangi sütunlarının ürün/ölçü/adet, hangilerinin fiyat/tutar olduğuna mevcut formül/render kodlarından bakılmalı. Sütun başlık metnine göre tek başına karar vermek hatalı olabilir.
- UI çıktısı veya HTML tablosunu parse ederek migration yapma; gerçek veri nesnesinden map et.
- `kdv`, birim fiyat, satır tutarı, toplam, iskonto, kâr/markup, tahsilat gibi alanlar ayrı finansal kaynakta tutulur.
- İş akışında gereken `itemName`, `quantity`, `measure`, `stage`, `dueDate` gibi alanlar güvenli staff workflow kopyasında bulunabilir; para ile ilgili alanlar bulunmaz.
- Müşteriye özel teklif gösterilecekse iç maliyet ve satış teklifini farklı nesne ve izin seti olarak tut.

---

## 14. UI/UX entegrasyonu ve yetki uygulaması

### 14.1 Navigasyon

- `admin`: Çalışma Masası, Projeler, İş Akışı, Masraf Defteri, Kullanıcılar/Roller, Müşteri Talepleri, Yedekleme/Ayarlar.
- `partner`: Çalışma Masası, Projeler, İş Akışı, Masraf Defteri, rapor/çıktı ve işletme yedekleri. Rol ve Firebase sahiplik ekranları yok.
- `employee`: Sadece İş Akışı ana navigasyonu; iş için açılan projeye ait güvenli detaylar. Defter/fiş/fiyat/teklif menü öğeleri hiç render edilmez.
- `customer`: Müşteri Alanım, Projelerim, Proje kodunu gir, Yeni talep, müşteri mesajları/güncellemeler.
- `pending`: erişim bekleme ve çıkış eylemi.
- Navigasyon kısaltması güvenlik sayılmaz; servis her eylemde izin kontrolü yapmalı ve Security Rules yazmayı reddetmeli.

### 14.2 İş akışı ve çalışan görünümü

- İş akışı bileşenleri maliyet/teklif datasına referans vermeden çalışmalı.
- Mevcut `wProj`, `wAll`, `wpack`, `wunpack` gibi workflow fonksiyonları incelenmeli. `wProj` içindeki tüm `p` nesnesini çalışan ekranına vermek yerine güvenli view model kullanılmalı.
- Çalışanın açtığı proje nesnesinin konsolda/Network panelinde fiyat alanı olmadığı test edilmeli.
- Workflow export ve JSON yedekleme içinde gizli finans alanı olmamalı. İçe/dışa aktarılan workflow paketi de aynı role ve alan filtresine tabi olmalı.
- Çalışan, finansal proje nesnesi ID'sini tahmin ederek başka path'i çağırsa bile Firebase `permission_denied` dönmeli.

### 14.3 Admin / ortak görünümü

- Finansal toplamlar yalnız finans kaynağından okunur ve `projectFinancials` yüklenmeden ana proje listesinde gerekmedikçe hesaplanmaz.
- Defter/fiş sayfaları yalnız `ledger`/`receipts` repository üzerinden açılır. Çalışan rolünde repository çağrısı uygulama düzeyinde de reddedilir.
- Finansal kayıt değişikliklerinde audit bilgisi ve revisions tutulmalı.

### 14.4 Müşteri görünümü

- Müşteri sayfası yalnız müşteri paylaşım modeliyle üretilen view model kullanmalı; tam `P`/project nesnesini alıp alan saklamamalı.
- Müşteri proje görünümü `customerProjectIndex/{auth.uid}/{projectId}` erişim kaydı olmadan route parametresiyle açılmaz.
- Müşteri yalnız dışa açık durum mesajı/termin/fotoğrafı görür. İç nota ve deftere yapılan URL/ID değiştirme denemeleri başarısız olmalı.
- Müşterinin yeni talebi ayrı intake yoluna yazılır; adminin onayladığı operasyonel proje yaratma eylemini tetiklemez.

---

## 15. Güvenlik, kişisel veri ve gizli anahtarlar

### 15.1 Mevcut API anahtarı riskleri

Kaynakta `S.key` ile API Ninjas'a, `S.ak` ile Anthropic'e tarayıcıdan istek yapılıyor. Bu anahtarlar tarayıcıda bulunuyorsa yetkili kullanıcı veya tarayıcıyı inceleyen kişi tarafından görülebilir. Firebase'e eşitlenmeleri riski büyütür.

- `S.key` ve `S.ak` asla `userProfiles`, `orgs`, backup/sync payload veya audit log'a dahil edilmemeli.
- Eski backup fonksiyonlarındaki ayar nesnesi, sync/migration öncesi hassas key'lerden arındırılmalı.
- API key'i admin dışı rolden gizlemek UI düzeyinde yardımcı olur ama browser'a bir kez verilmiş anahtar güvenli saklanmış değildir.
- Üretim için en güvenli seçenek: anahtarlı OCR çağrısı server-side proxy üzerinden yapılır (bunun Blaze/başka hosting maliyeti olabilir), sağlayıcı tarafı kısıtlar konur veya kullanılmayacaksa kaldırılır. Ücretsiz plan zorunlu ise kullanıcıya bu entegrasyonun istemci anahtarı nedeniyle gizli tutulamayacağı açıkça anlatılmalı; yerel Tesseract yolu mümkün olduğunda tercih edilebilir.

### 15.2 Uygulama bütünlüğü ve veri doğrulama

- Girdiler, başlıklar, notlar, dosya boyutları, URL'ler ve Base64 payload'ları sınırlandırılmalı.
- `innerHTML` kullanan mevcut kod yollarında kullanıcı kaynaklı metinlerin escape/sanitization durumu incelenmeli; XSS yalnız UI sorunu değil, kullanıcının Firebase oturumuyla veri okuma/yazma yapmasına yol açabilecek bir risk.
- Upload'larda MIME type tek başına güvenilir kabul edilmemeli; gerçek format kontrolü mümkünse yapılmalı.
- HTML/Excel içeriğinden gelen formüller export sırasında formula injection riskine göre ele alınmalı (özellikle `=`, `+`, `-`, `@` ile başlayan hücreler).
- Console loglarında auth token, API key, proje tam içeriği veya Base64 data basılmamalı.
- Kullanıcı fotoğrafı/e-posta gibi profile alanları yalnız gereken bağlamda gösterilmeli.
- Oturum kapatıldığında Firebase listener'ları kapatılmalı ve hassas view model bellekte temizlenmeli.

### 15.3 Audit ve takip

- Rol değişikliği, üyelik devre dışı bırakma, müşteri kodu yaratma/iptali, finansal kayıt silme/geri alma, migration ve backup eylemleri audit'e girmeli.
- Audit kaydı hassas tam JSON payload'ı taşımaz; yalnız eylem, entity ID, aktör UID, zaman ve güvenli özet tutar.
- Audit kayıtları istemci tarafından silinemez veya yeniden yazılamaz (tasarımın desteklediği güvenli yazım kapsamı uygulanmalı).

---

## 16. Düşük veri tüketimi için zorunlu optimizasyonlar

1. **Tüm veritabanını çekme:** root snapshot yok. Önce minimal indeks, sonra ihtiyaç duyulan proje.
2. **Ayrı medya:** her proje/iş akışı güncellemesi ile fotoğrafın kendisi yeniden inmez.
3. **Görsel lazy-load:** thumbnail listede, full payload tıklamayla.
4. **Delta sync:** `updatedAt`/revision bazlı küçük güncellemeler; bütün projeleri yeniden yazma yok.
5. **Değişmeyen veri cache:** mevcut checksum/revision değişmediyse aynı medya tekrar indirilmez.
6. **Tek listener kuralı:** aynı path'e birden çok eşdeğer listener bağlanmamalı; route değişiminde unsubscribe.
7. **Debounce:** sık değişen text/input alanlarında local save hızlı, cloud sync kuyruğuna yazım kontrollü; kullanıcının yaptığı son metin kaybolmamalı.
8. **Patch yazımı:** yalnız değişen alanlar/path'ler gönderilir; 10 MB'lık tüm proje nesnesi her editte yazılmaz.
9. **Ses paketi:** 14.6 MB gömülü ses scripti ana HTML'in her kullanımında indirme maliyetini yükseltiyor. Sesi gerektiğinde yükle ve local IndexedDB cache kullan; ses özelliğini kaldırma gerekiyorsa kullanıcı onayı olmadan kaldırma.
10. **Excel kütüphanesi:** kullanılmadığı sayfada gereksiz yüklemeyi önle. Offline ihtiyacı test ederek yerel bundle/cache yaklaşımı kararlaştır.
11. **Tarihçe limiti:** audit ve değişiklik geçmişi kontrolsüz büyümesin; yasal/iş ihtiyacına göre saklama ve arşiv politikası olsun.
12. **Listener kapsamı:** çalışan/müşteri yalnız yetkili proje/listeleri dinler; müşteri genel işletme dizinine abone olmaz.
13. **Gereksiz status yazımlarını azalt:** presence/lastSeen gibi değerleri her tuşta yazma; gerekiyorsa seyrek ve kontrollü güncelle.
14. **Quota monitoring:** RTDB saklama/indirme metriklerini kontrol et; ürün içi tahminleri gerçek Firebase ölçümünün yerine koyma.

---

## 17. Çevrimdışı davranış sözleşmesi

### Çevrimdışıyken çalışması gerekenler

- Daha önce doğrulanmış ve bu cihazda yerel workspace'i bulunan yetkili kullanıcının cache'teki izinli proje/iş akışı verisini açması.
- Proje veya iş akışı kaydında izinli düzenlemeleri IndexedDB'ye kaydetmek.
- Fotoğrafı yerelde sıkıştırmak, IndexedDB'ye Blob olarak yazmak, outbox'a upload işi eklemek.
- Defter/fiş işlemlerini (yalnız admin/ortak) yerel olarak kaydetmek; bunların buluta aktarılmadığını görünür belirtmek.
- Excel içeriğini ayrıştırıp yerel proje verisine yazmak; cloud sync'i bekletmek.
- Kullanıcıya son sync, bekleyen işlem sayısı, son hata ve yaklaşık medya kuyruğu göstermek.

### Çevrimdışıyken yapılamayacağı açıkça belirtilmesi gerekenler

- İnternet olmadan ilk kez Google ile kimlik doğrulamak.
- Bir müşterinin kodunun güncel/iptal edilmemiş olup olmadığını yeni bir uzak istekle doğrulamak.
- Çevrimdışıyken rol değişikliğini anında öğrenmek. Kullanıcı online olduğunda üyelik durumu yenilenir.
- Uzak veriye başarılı yazım veya çoklu cihaz eşitliği olduğunu iddia etmek.
- Yerelde kaydedilmeyen bir görseli/projeyi “kaydedildi” olarak göstermek.

### Durum etiketleri

- `Yerel olarak kaydedildi` — IndexedDB transaction tamamlandı.
- `Senkron bekliyor` — outbox'ta bekleyen değişiklik mevcut.
- `Senkronize` — sunucu write başarılı ve revizyon alındı.
- `Çakışma` — hem yerel hem uzak değişiklik var; çözüm gerekli.
- `İzin reddedildi` — kullanıcı rolü/path için write reddedildi; retry ile tekrarlanmaz.
- `Depolama dolu` — yerel kota aşıldı; son işlem kaydedilememiş olabilir.
- `Medya yüklenemedi` — metin kaydı ve görsel yükleme durumları ayrı izlenir.

---

## 18. Yedekleme, geri yükleme ve veri bütünlüğü

- Mevcut “tam yedek” kabiliyeti korunmalı ve yeni şema/medya/outbox mantığıyla uyarlanmalı.
- Yedek içinde role göre izin verilmeyen alanlar dışa aktarılmamalı. Employee/customer tarafından full backup asla hazırlanamaz.
- Yeni yedek formatında `app`, `schemaVersion`, `exportedAt`, `orgId`, `createdByUid`, proje/defter/fiş/medya manifest'i ve checksum olmalı.
- API keys, Firebase token, kullanıcı kimlik bilgileri ve gereksiz `localStorage` ayarları yedeğe eklenmez.
- Restore işlemi önce preview/dry run ve çakışma raporu verir; tek tıklamayla var olan projeyi sessizce ezmez.
- Geri yükleme idempotent olmalı; aynı backup ikinci kez çalıştırıldığında gereksiz duplikasyon yaratmamalı veya bunu kullanıcıya açık şekilde seçtirmeli.
- Medya referansları var mı kontrol edilir; orphan payload'lar raporlanır; veri doğrulaması başarılı olmadan eski local veriler silinmez.
- Admin/ortak için ayrı finansal yedek ve çalışan için finans içermeyen iş akışı paketi oluşturulması değerlendirilebilir; ancak çalışan genel backup yetkisine sahip olmaz.

---

## 19. Test stratejisi — canlıya geçiş için zorunlu kapı

### 19.1 Unit / veri modeli

- Mevcut proje objesinden public/private/workflow mapper testleri.
- Türkçe sayı biçimleri, KDV, toplam, satır hesapları ve mevcut Excel import mapping regresyonları.
- Boş/bozuk/null sheet ve row kayıtları; eksik ID'ler; duplicate migration.
- Media compression boyut/format ve checksum testleri.
- Outbox idempotency, backoff ve kalıcı hata sınıflandırması.
- Revision conflict, tombstone, tekrar deneme, rollback ve aynı kullanıcı iki sekme senaryoları.

### 19.2 Security Rules Emulator testleri

Aşağıdaki testler gerçek UID/rol örnekleriyle otomatik yazılmalı. Her bir “red” testinin gerçekten başarısız istek döndürmesi gerekir.

1. Giriş yapmamış kullanıcı `projectIndex`, `projectFinancials`, `ledger`, `mediaPayloads` okuyamaz; ayrıca yetkili kullanıcı bile `mediaPayloads` toplu yolunu okuyamaz, yalnız ID bazlı payload okunabilir.
2. Employee `projectPublic` ve kendi iş akışını okuyabilir.
3. Employee `projectFinancials` okuyamaz; doğrudan RTDB SDK/REST isteklerinde de `permission_denied` alır.
4. Employee `ledger`, `receipts`, fiş medyası, finansal export datası okuyamaz/yazamaz.
5. Employee `members/{uid}/role` üzerinde kendini `partner` veya `admin` yapamaz.
6. Customer başka `projectId`'nin `customerViews`, `projectPublic` veya `mediaPayloads` verisine erişemez.
7. Customer kendisine bağlı proje için izinli görünümü okuyabilir; `workflowStaff`, `internalNotes`, `projectFinancials` erişimi reddedilir.
8. Customer başka kullanıcının `customerIntakes/{uid}` düğümüne yazamaz/okuyamaz.
9. Partner finans/defter/proje görebilir ama admin UID'sini değiştiremez ve yeni admin atayamaz.
10. Sıradan kullanıcı rol atayamaz, üyelik kaydını silip kendine rol veremez.
11. Expired/revoked/redeemed invite tekrar kullanılamaz; eşzamanlı iki claim yalnız bir kez başarıyla gerçekleşir.
12. Payload alanları schema validation'dan geçmiyorsa write reddedilir.
13. Client `role: admin` veya sahte `actorUid` alanı gönderse dahi izin yükseltemez.
14. Yanlış `orgId`/projectId ile farklı işletmeye ait veri okunamaz.

### 19.3 Uçtan uca senaryolar

- **A — Admin online:** Google ile giriş → mevcut yerel veriyi preview → import → projeyi başka admin cihazından aç → aynı sayılar/alanlar.
- **B — Employee online:** aynı projeyi iş akışında gör → fiyat/defter/fiş menüsü yok → Network/SDK ile finans path'i dene → red.
- **C — Employee offline:** iş akışı aşamasını değiştir, fotoğraf ekle → local kaydedildi/senkron bekliyor → bağlantı getir → tek kayıt olarak sync → farklı cihazda güncel durumu gör.
- **D — Customer:** Google login → kendi yeni talebini gönder → admin onaylar/projeye bağlar → müşteri kodunu bir kez redeem eder → yalnız o projeyi görür → başka projectId deneyince red.
- **E — Role revoke:** employee açık sekmede iken admin rolü kapatır → online employee görünümü kilitlenir; yeni istekler server rules tarafından reddedilir.
- **F — Çakışma:** aynı workflow item iki cihazda offline güncellenir → sync sonrası iki farklı değer kaybolmaz; conflict view gelir.
- **G — Büyük medya:** limitsiz fotoğraf eklenemez; boyut düşürme çalışır, thumbnail/full görsel ayrı çekilir, tekrar yüklemede duplicate/download artışı kontrol edilir.
- **H — Quota/network failure:** upload reddi/kota hatası → outbox kalır, kullanıcı uyarılır, veriler silinmez.
- **I — Browser refresh/crash:** yerel kaydedilmiş ama sync edilmemiş değişiklik yeniden açılışta mevcut olur ve uygun kimlikle sync kuyruğuna girer.
- **J — Backup/restore:** admin tam yedek alır, test workspace'e restore eder, satır/fiş/medya sayıları eşleşir.
- **K — Eski fonksiyonlar:** Excel/CSV import, QR, OCR (API key güvenliği notuyla), PDF, Excel, print, defter, fiş, help/tour ve mobil ekran regresyon testlerinden geçer.

### 19.4 Güvenlik testini geçme şartı

Tek bir çalışan veya müşteri testi finansal veri okuyabiliyorsa veya başka müşterinin projesine erişebiliyorsa canlıya çıkış engellenir. Yetki UI'da gizlenmiş olsa bile testten geçmek için Firebase isteğinin reddedilmesi şarttır.

---

## 20. Uygulama aşamaları ve beklenen çıktılar

Claude her aşamadan sonra değiştirdiği dosyaları, test komutlarını, geçen/kalan testleri ve bilinen riskleri açıklamalı. “Bitti” demek için yalnız kod yazılmış olması yeterli değildir.

### Aşama 0 — Kaynak envanteri ve regresyon tabanı

Çıktılar:
- Mevcut HTML fonksiyonları/modülleri ve veri şeması envanteri.
- IndexedDB store başına sayım/alan örnekleri (hassas içerik loglamadan).
- Projeler, tablolar, satırlar, workflow item'ları, ledger, receipts ve fotoğraflar için örnek fikstürler.
- Yedek/geri yükleme smoke testi.
- Mevcut fonksiyonların regresyon kontrol listesi.

**Kapı:** Geçiş öncesi tam yedek üretilebiliyor ve geri yükleme doğrulanabiliyor olmalı.

### Aşama 1 — Modüler Firebase adaptörü ve Google login

Çıktılar:
- Firebase init ve yapılandırma dosyası (secret yok).
- Google login/logout; loading/error/unassigned states.
- Giriş doğrulanmadan proje/defter render edilmesini durduran bootstrap gate.
- Basit, modern, responsive login view.
- Henüz bütün veriyi senkronize etmeden Authentication smoke testleri.

**Kapı:** Oturum/çıkış/hesap değiştirme yerel kullanıcı verisini karıştırmamalı.

### Aşama 2 — Üyelik sistemi ve Security Rules

Çıktılar:
- Tek ADMIN_UID kurulumu ve admin/partner/employee/customer/pending/disabled veri sözleşmesi.
- Adminin kullanıcı atama ekranı.
- RTDB path'leri ve Security Rules.
- Emulator testleri; role escalation / price leak testleri.

**Kapı:** Güvenlik testleri geçmeden gerçek proje/defter verisi cloud'a taşınmamalı.

### Aşama 3 — Veri ayrımı ve migration preview

Çıktılar:
- Project public/private/workflow/customer view mapper.
- Ledger/receipt/media ID eşleme tablosu.
- Dry-run migration ve rapor ekranı.
- Admin onayı ve idempotent import.

**Kapı:** Önce/sonra kayıt sayıları, proje satırları ve matematiksel toplamlar doğrulanmalı.

### Aşama 4 — Local-first outbox ve metin verisi sync

Çıktılar:
- IndexedDB upgrade; syncOutbox/syncMeta/conflict stores.
- Yerel save işlemini outbox'a atomik yazan repository.
- RTDB delta listener ve retry/backoff.
- Senkron durum göstergesi.
- İki cihazlı test; offline ve conflict testi.

**Kapı:** Ağ kesilmesi/kapanıp açılması veri kaybına veya duplicate kayda yol açmamalı.

### Aşama 5 — Medya ve Excel davranışı

Çıktılar:
- Media service: sıkıştırma, thumbnail/full ayrımı, Base64, checksum, size limit.
- Fotoğraf/fiş erişim yolları ve rules.
- Medya lazy-load/cache ve orphan cleanup.
- Ham Excel local-only / seçmeli sync davranışı.

**Kapı:** Worker finance image ve customer private media okuyamamalı; kota hedefleri doğrulanmalı.

### Aşama 6 — Müşteri deneyimi

Çıktılar:
- Yeni müşteri talebi.
- Admin onayı ve projeye bağlama.
- Tek kullanımlık erişim kodu oluşturma/redeem/expire/revoke.
- Müşteri proje durumu ve paylaşılan fotoğraflar ekranı.
- Code replay/concurrency/IDOR testleri.

**Kapı:** Başka projectId/uid ile erişim denemeleri Security Rules'ta reddedilmeli.

### Aşama 7 — Tam regresyon ve prod hazırlığı

Çıktılar:
- Giriş/rol/iş akışı/defter/fiş/import/export/mobile/offline/e2e test raporu.
- Üretim Firebase rules, indexes ve App Check ayarları.
- Geri dönüş ve yedekten kurtarma planı.
- Firebase kullanımı, RTDB payload boyutları ve ücretsiz katman izleme talimatı.
- Güncellenmiş README ve kısa admin kurulum rehberi.

**Kapı:** Hiçbir kritik güvenlik/veri kaybı testi açık kalmadan canlıya alınmamalı.

---

## 21. Claude'un çalışma biçimi ve kesin yasaklar

Claude aşağıdaki talimatlara uymalı:

1. İlk olarak mevcut dosyayı ve gerçek çağrı akışını incele; varsayımla fonksiyon değiştirme.
2. Büyük tek HTML'de aynı adlı global fonksiyonları tekrar tanımlama; scope/isim çakışmalarını test et.
3. Yeni Firebase çağrılarını UI event handler'larının içine dağınık biçimde ekleme; service/repository API üzerinden yap.
4. Çalışan eski özellikleri “kolaylık için” kaldırma. Silme/değiştirme gerekiyorsa nedenini, alternatifini ve testini belirt.
5. Firebase Security Rules olmadan sadece frontend rol kontrolü bırakma.
6. Admin/partner verisini çalışan ve müşteri payload'ına dahil etme; hassas alanlar ayrılmış path'lere dönüştürülecek.
7. Fotoğraf Base64'ünü project/workflow/ledger root path'lerinde saklama.
8. `S.key`, `S.ak`, Firebase auth token veya private key'i senkronize etme ve loglama.
9. Offline değişiklikleri doğrudan `set()` ile bütün nesneyi körlemesine overwrite etme; revisions, outbox ve conflict çözümü uygula.
10. Ağ hatasında başarı mesajı verme; IndexedDB transaction veya Firebase write sonucu bekle.
11. “Ücretsiz” için Cloud Storage/Functions kullanıldığını varsayma; her ürünün mevcut plan gereksinimini kontrol et. Blaze'e geçiş gerekirse açıkça bildir ve onaysız ücretli mimariye geçme.
12. Security Rules testleri olmadan “veri sızıntısı imkânsız” deme. Test sonuçlarını somut olarak raporla.
13. Test edilmemiş özellik için “çalışıyor” deme; “kodlandı, uçtan uca test edilmedi” şeklinde dürüst ol.
14. Migration sırasında orijinal veriyi silme. Backup ve round-trip doğrulaması olmadan destructive action yapılmaz.
15. Büyük bir dönüşümde küçük, anlamlı ve geri alınabilir aşamalar oluştur; her aşamada test/rapor üret.

---

## 22. Tamamlanma tanımı (Definition of Done)

Bu proje yalnızca şu koşulların **tamamı** sağlandığında tamamlanmış kabul edilir:

- [ ] Google ile giriş, çıkış, hesap değişimi, popup/redirect hataları düzgün ele alınıyor.
- [ ] Rolü olmayan kullanıcı iş verisi göremiyor.
- [ ] Tek admin UID'si Security Rules tarafından doğrulanıyor; UI ile ikinci admin yaratılamıyor.
- [ ] Admin rol atayabiliyor; rol güncellemesi bulut tarafında güvenli ve auditli.
- [ ] Ortak işletme operasyon/finans özelliklerini görebiliyor ama admin sahipliğini devralamıyor.
- [ ] Employee yalnız izin verilen iş akışı verisini okuyor/yazıyor; fiyat/defter/fiş/finance export isteği Firebase tarafından reddediliyor.
- [ ] Customer yalnız UID'sine atanmış proje(ler)i ve müşteri görünümü verisini görüyor; diğer projeler, finans ve iç notlar reddediliyor.
- [ ] Müşteri kodu tek kullanımlı, süre/iptal kontrollü, tekrar çağrıda idempotent ve güvenli.
- [ ] IndexedDB local-first; yerel kayıt/outbox atomik; offline işlerde veri kaybı yok.
- [ ] Realtime Database'e delta/patch aktarımı yapılıyor; tüm veriyi her seferinde indirme yok.
- [ ] Görseller sıkıştırılıyor, ayrı path'te, on-demand; duplicate gereksiz download yok.
- [ ] Excel içeriği korunuyor; ham dosyanın local/cloud durumunu kullanıcı biliyor.
- [ ] Çakışmalar sessizce ezilmiyor; tekrar deneme ve tombstone doğru.
- [ ] Migration sonrası proje/sayfa/satır/defter/fiş/medya sayıları ve matematiksel değerler karşılaştırılarak doğrulanıyor.
- [ ] Yedek/geri yükleme yeni şemayla çalışıyor ve secrets filtreleniyor.
- [ ] Eski Excel/CSV, QR, OCR, çıktı, defter ve workflow özellikleri regresyon testinden geçiyor.
- [ ] Giriş sayfası modern, mobil uyumlu, erişilebilir ve auth durumu tamamlanmadan içerik göstermiyor.
- [ ] Firebase Security Rules Emulator testlerinin tamamı geçiyor.
- [ ] Kritik test raporu ve deploy/rollback rehberi hazırlanmış.
- [ ] Kullanım/kota ölçümü kurulmuş ve ücretsiz katman sınırları anlaşılır.

---

## 23. Karar notu: “Bütün görseller Base64 RTDB'de” talebi

Bu istek teknik olarak yapılabilir ama **hiçbir boyut kuralı olmadan yapılması düşük maliyet hedefiyle çelişir**. Base64 yaklaşık üçte bir ek yük getirir; Realtime Database'den görsel okunması indirme kotasını tüketir. Bu nedenle önerilen uzlaşma:

- Küçük, sıkıştırılmış thumbnail'ler RTDB'de Base64 olarak tutulabilir.
- Sık kullanılan iş akışı görsellerinin sıkıştırılmış full sürümü de, tanımlı üst boyut sınırı ve yalnız gerektiğinde indirmeyle RTDB'ye aktarılabilir.
- Ham Excel ve büyük/orijinal fotoğraflar varsayılan olarak IndexedDB'de kalır; cross-device kesin gerekiyorsa kullanıcıya boyut/kota etkisi gösterilir ve karar ayrıca alınır.
- Dosya yükleri hiçbir zaman genel proje snapshot'ına dahil edilmez.

Eğer “her dosya kesinlikle tüm cihazlarda bulutta olsun ve hiçbir ücret/limit riski olmasın” koşulları birlikte istenirse bunlar birbiriyle çelişir. Firebase Spark sınırlıdır; bu şartname çevrimdışı çalışmayı koruyarak okuma/yazma tüketimini olabildiğince azaltır ama sınırsız bulut saklama/indirme garantisi veremez.

---

## 24. Resmî kaynaklar ve uygulama öncesi tekrar kontrol

Firebase politika ve fiyatları değişebileceğinden, Claude uygulamaya başlarken ve canlıya almadan önce aşağıdaki dokümanları yeniden kontrol etmeli:

- Firebase fiyatlandırma: https://firebase.google.com/pricing/
- RTDB kullanım/indirme hesaplaması: https://firebase.google.com/docs/database/usage/billing
- Realtime Database temel mimari: https://firebase.google.com/docs/database
- RTDB Security Rules: https://firebase.google.com/docs/database/security
- Query tabanlı erişim kuralları: https://firebase.google.com/docs/database/security/rules-conditions
- Firebase Auth custom claims/rol yaklaşımı (özel claim kullanılması tercih edilirse): https://firebase.google.com/docs/auth/admin/custom-claims
- Firebase web offline capabilities: https://firebase.google.com/docs/database/web/offline-capabilities
- Firebase App Check web: https://firebase.google.com/docs/app-check/web/recaptcha-provider
- Cloud Storage for Firebase ve Blaze şartı: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024
- Firebase Google ile giriş: https://firebase.google.com/docs/auth/web/google-signin

**Tamamlayıcı çalışma dosyaları:** `LAVORA_KOD_GECIS_PLANI.md` mevcut HTML fonksiyonlarına göre kod geçiş sırasını; `database.rules.json` Security Rules taslağını; `database.rules.test.js` Emulator testlerini içerir. Üç dosyanın hedef path ve alan şemaları birlikte tutulmalı; birini değiştirmek diğerlerini ve migration mapper'larını gözden geçirmeyi gerektirir.

**Son talimat:** İlk çıktı doğrudan “entegre edilmiş final uygulama” olmamalı. Önce kaynak envanteri, veri şeması/migration planı, Security Rules tasarımı ve test matrisi hazırlanmalı; daha sonra aşama aşama değişiklik yapılmalı. Kodun ve güvenlik kurallarının gerçek Firebase Emulator'da gerçekten test edildiği kanıtlanmadan proje tamamlandı ilan edilmemeli.
