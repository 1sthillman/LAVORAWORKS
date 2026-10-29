# LAVORA v38 + Firebase — Kurulum ve Devreye Alma

Bu belge, `lavora-calisma-masasi-v38-firebase.html` dosyasına eklenen Google oturumu, rol portalı ve local-first Firebase katmanını yapılandırmak içindir.

> **Durum:** Firebase entegrasyonu HTML içine eklendi ve gömülü JavaScript bloklarının sözdizimi kontrol edildi. Gerçek bir Firebase projesi, gerçek admin UID'si ve Emulator ortamı bu çalışma sırasında mevcut olmadığı için Google OAuth, Security Rules, veri taşıma ve çok cihazlı senkronizasyon uçtan uca test edilmiş değildir. Gerçek kayıtları taşımadan önce test projesinde doğrulayın.

## 1. Neler eklendi?

- Mobil uyumlu, modern Google giriş ekranı ve Firebase ayar formu.
- Tek admin UID'sine bağlı rol yönetimi: `admin`, `partner`, `employee`, `customer`.
- Çalışan için ayrı proje/iş akışı arayüzü. Bu arayüzde defter, teklif toplamları, fiyat ve finans fotoğrafları yüklenmez.
- Müşteri için proje kodu, kendi proje özeti ve kendi talep ekranları.
- IndexedDB `cloudCache`, `cloudQueue`, `cloudMeta` depoları ve UID'ye özel çevrimdışı kuyruk.
- Proje, fiyat/finans, iş akışı ve müşteriye yayınlanan görünüm verilerini farklı Realtime Database yollarına ayıran eşitleme katmanı.
- Görselleri sıkıştırma, Base64 yükleme, medya metadata/thumbnail/payload ayrımı ve temizlik öncesi geri-okuma kontrolü.
- Mevcut HTML'in temel ekranları ve eski yerel depoları doğrudan silinmedi. Eski veriyi silme eylemi için ayrıca doğrulama gerekir.

## 2. Firebase projesi

1. Firebase Console'da bir proje oluşturun.
2. **Authentication → Sign-in method** altında Google sağlayıcısını etkinleştirin.
3. Authentication'ın **Authorized domains** listesine test için `localhost`, dağıtım için de uygulamanızı yayınlayacağınız gerçek alan adını ekleyin.
4. Realtime Database oluşturun ve veritabanı URL'sini not edin.
5. **Project settings → Your apps → Web app** bölümünden web uygulaması yapılandırmasını alın.
6. Uygulamayı `file://` ile doğrudan açmayın. `localhost` veya HTTPS üzerinden yayınlayın.

Resmî dokümanlar:
- Google ile web girişi: https://firebase.google.com/docs/auth/web/google-signin
- Realtime Database kuralları: https://firebase.google.com/docs/database/security
- Emulator ile kuralları test etme: https://firebase.google.com/docs/rules/emulator-setup

## 3. İlk admini güvenli biçimde belirleme

Kurucunun kimliği tahmin edilmemeli veya e-posta adresinden türetilmemelidir. Firebase Authentication'ın verdiği gerçek UID kullanılmalıdır.

1. HTML'i `localhost` üzerinden açın. Örnek Windows / macOS / Linux komutu:

   ```bash
   python -m http.server 8080
   ```

   Dosyanın bulunduğu dizinde çalıştırın ve `http://localhost:8080/lavora-calisma-masasi-v38-firebase.html` adresini açın.

2. Açılışta **Firebase / admin ayarları** ekranından Firebase Web App config JSON'unu girin. `orgId` için ilk kurulumda `lavora-main` kullanabilirsiniz. `adminUid` alanını şimdilik boş bırakın.

   Beklenen config alanlarının örneği (değerlerin tamamını kendi Firebase Console'unuzdan alın):

   ```json
   {
     "apiKey": "FIREBASE_CONSOLE_DEGERI",
     "authDomain": "PROJE_ID.firebaseapp.com",
     "databaseURL": "https://VERITABANI_URL",
     "projectId": "PROJE_ID",
     "appId": "FIREBASE_CONSOLE_APP_ID",
     "messagingSenderId": "FIREBASE_CONSOLE_SENDER_ID"
   }
   ```

3. Kaydedip yeniden açıldıktan sonra Google ile giriş yapın. `adminUid` henüz boş olduğu için uygulama normal iş alanını açmak yerine ilk admin UID'sini gösteren kurulum ekranında kalmalıdır. UID'yi kopyalayın.
4. Bir kopya üzerinde `database.rules.json` içindeki **tüm** `REPLACE_WITH_REAL_ADMIN_UID` değerlerini bu gerçek UID ile değiştirin. Varsayılan dosyayı placeholder ile dağıtmayın.
5. Rules dosyasını önce Emulator'da test edin. Başarılı test ve incelemeden sonra doğru Firebase projesinin Realtime Database Rules bölümüne yayınlayın.
6. HTML'deki Firebase ayarlarına geri dönün, aynı config ve `orgId` değerlerini koruyup `adminUid` alanına gerçek UID'yi yazın. Kaydedip Google ile yeniden giriş yapın.
7. İlk admin üyeliği ve rol atama işlemlerinin kurallarla izinli olduğunu doğrulayın. Bir admin hesabı dışında hiç kimse admin rolü alamamalıdır.

## 4. Eski veriyi taşıma

1. İlk önce **asıl HTML'in tam yedeğini** alın. Eski dosyayı veya tarayıcı verilerini silmeyin.
2. Firebase'e bağlandıktan sonra sabit admin hesabıyla giriş yapın ve **Bulut / Taşıma** ekranını açın.
3. Aktarımın proje, iş kalemi, fiyat/finans, defter, fiş fotoğrafı, iş akışı fotoğrafı ve tarama kayıtlarını saydığını kontrol edin.
4. Aktarımı test projesinde çalıştırın. Aynı ID bulunan kayıtlar otomatik üzerine yazılmaz. Hata/çakışma varsa kaynağı koruyun ve logu inceleyin.
5. Müşteri/çalışan hesapları açmadan önce test hesabıyla veri erişim senaryolarını gerçekleştirin.
6. **Eski yerel depoları temizle** düğmesini ancak ayrı yedek aldıktan, proje/defter/medya geri-okuma kontrolleri başarıyla geçtikten ve testleri doğruladıktan sonra kullanın. Uygulama bilinmeyen/bağlantısız fiş veya fotoğraflar tespit ederse temizlik durmalıdır.

## 5. Roller

| Rol | Beklenen erişim |
|---|---|
| Admin | Projeler, finans/teklif, defter/fiş, kullanıcı rolleri, müşteri talepleri, proje erişim kodları ve taşıma aracı |
| Ortak | Proje, finans ve defter; kullanıcı rolü atama ekranı admin rolüne özeldir |
| Çalışan | Proje listesi ve iş akışı; iş kalemi durum/not değişiklikleri. Finansal düğümler bu kullanıcıya indirilmemelidir |
| Müşteri | Kendi UID'sine bağlanan projelerin yayınlanmış özeti, kendi talepleri ve yalnız kendi hesabına ait proje erişim kodları |
| Bekleyen/Devre dışı | İşletme verileri açılmaz |

Arayüz kısıtları güvenlik sınırı sayılmaz. Yetki sınırı, Realtime Database Security Rules'ta da uygulanmalıdır.

## 6. Kuralları test etme

Hazırlık paketinin `lavora-firebase-blueprint` dizininde bir Emulator test iskeleti var:

```bash
npm install
npm run test:rules
```

Bu komut Node.js, npm ağ erişimi ve Firebase Realtime Database Emulator için desteklenen Java kurulumu gerektirir. Test iskeleti bu teslim sırasında başarıyla çalıştırılamadı; yalnız JSON ve JavaScript sözdizimi kontrolleri yapıldı. Emulator testinin geçmesi de tek başına canlı OAuth, migration ve çok cihaz senkronizasyonunun doğrulandığı anlamına gelmez.

## 7. Önemli sınırlar

- Firebase Web App config, tarayıcı uygulamalarında görünürdür; gerçek koruma Security Rules'tur. Gizli servis hesabı anahtarlarını HTML'e koymayın.
- Base64, aynı ikili içeriğe göre daha büyük temsil oluşturur. Fotoğraflar sıkıştırılır ve tam içerik ayrı yolda tutulur; yine de indirme/depolama kotası gözlenmelidir.
- Tarayıcı kapalıyken internet olmadan ilk kez Google giriş yapılması mümkün değildir. Daha önce bu cihazda doğrulanmış oturum varsa uygulama yerel kuyrukla çalışmayı deneyebilir; çevrimdışı yetki, sunucu tarafından güncel olarak iptal edilmiş rolü anında öğrenemez. İnternet gelince yeniden doğrulama şarttır.
- İki cihaz aynı kaydı değiştirirse kuyrukta çakışma oluşabilir. Çakışmalar otomatik sessizce üzerine yazılmamalı; manuel çözüm / merge akışı test edilmelidir.
- Bu HTML bir entegrasyon başlangıç sürümüdür; gerçek Firebase ortamında test ve kod incelemesi tamamlanmadan canlı iş verisiyle kullanmayın.
