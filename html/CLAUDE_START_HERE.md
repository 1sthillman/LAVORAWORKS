# Lavora Firebase geçişi — Claude için başlangıç talimatı

Bu paket, mevcut Lavora tek HTML uygulamasını Firebase Authentication + Realtime Database ve IndexedDB tabanlı local-first senkronizasyon mimarisine aşamalı taşımak için hazırlanmıştır.

## Dosyaları şu sırayla oku

1. `LAVORA_FIREBASE_MIMARI_VE_GUVENLIK_PLANI.md` — ürün kararları, veri modeli, yetkiler, offline sync, kota, hata kurtarma ve kabul ölçütleri.
2. `LAVORA_KOD_GECIS_PLANI.md` — mevcut HTML'deki modüllerle entegrasyon planı, mapper/repository servis sınırları ve aşamalı migration.
3. `database.rules.json` ve `database.rules.test.js` — RTDB yetki sözleşmesinin başlangıç taslağı ve negatif testler.
4. `source/lavora-calisma-masasi-v38.html` — gerçek mevcut kaynak; ilgili fonksiyonları ve IndexedDB store'larını yeniden incele.
5. `README_TESTS.md`, `package.json`, `firebase.emulator.json` — emulator testlerini çalıştırma araçları.

## Çalışma sözleşmesi

- Bu paketteki Rules dosyası **taslaktır**; Emulator'da gerçek şekilde çalıştırılmadan ve kaynak şemayla eşleştirilmeden canlıya dağıtma.
- `REPLACE_WITH_REAL_ADMIN_UID` gerçek Firebase Auth UID'siyle değiştirilmeden canlı ortamı açma. İkinci admin rolü üretme yolunu uygulama.
- Eski `p`, `scans`, `led`, `rcpt`, `wph` IndexedDB store'larını ve `lvr_voice_db` ses verilerini geçiş sırasında silme/yeniden oluşturma.
- Tek HTML içindeki eski proje objesini `projectPublic` veya `workflowStaff` gibi çalışan tarafından okunabilir yollara topluca kopyalama. Alanları açık allowlist ile map et; fiyat/KDV/iskonto/teklif toplamı/masraf/fiş ve belirsiz kolonlar ayrı finansal alana gitmeli veya admin onayını beklemeli.
- UI'daki rol kontrolü, CSS ile gizleme veya localStorage'daki rol **yetki kontrolü değildir**. Firebase Security Rules son kapıdır.
- Görsel payload'ı ayrı ID altında olsun. Liste ekranı Base64 indirmesin. Kullanılmayan listener'ları kapat. Çalışan medyasında önce metadata, sonra thumbnail/payload yaz; sahiplik eşleşmesini koru.
- Offline save, IndexedDB entity ve `syncOutbox` kaydını aynı transaction içinde yazmadan başarılı sayılmasın. Firebase hata/izin reddi/kota hatasında outbox kaydı silinmesin.
- Her aşamada önce diff ve migration raporu üret. Mevcut özellikleri korumak için regresyon testleri ekle; sorunlu bir alanı “çalışıyor” varsayma.
- Gerçek bir testin çalıştırılmadığı yerde geçişi veya testleri başarılı diye bildirme.

## Zorunlu uygulama aşamaları

1. Kaynak SHA-256, mevcut verinin yerel yedeği ve IndexedDB envanteri; herhangi bir yazma değişikliğinden önce.
2. Şema/mapper testleri: legacy proje → public/workflow/financial/customer view ayrıştırması; finans alanı sızıntısı için pozitif ve negatif testler.
3. Firebase Emulator: Security Rules testlerinin tamamı geçmeli. Söz dizimi kontrolü emulator başarısı değildir.
4. Google Auth + bekleyen erişim ekranı + admin rol yönetimi. Üyeliği olmayan kullanıcı iş verisi okuyamamalı.
5. IndexedDB Repository + `syncOutbox` + `syncMeta` + çakışma deposu; önce yalnız test fixture'larıyla.
6. Read-only dry-run migration; kayıp/duplikasyon raporu. Kullanıcı onayı ve doğrulama olmadan commit yok.
7. Tek proje ve birkaç test UID ile küçük kapsamlı sync; ardından workflow, finance, media, customer portal modülleri sırayla.
8. Backup/restore, offline, çoklu sekme, çoklu cihaz, rol iptali, kota ve güvenlik regresyonu; ancak bundan sonra kontrollü canlı geçiş.

## Teslimat formatı

Her aşamada: değiştirilen dosyalar, veri şeması farkları, çalıştırılan komutlar ve gerçek sonuçları, başarısız testler, geri alma yöntemi, bilinen riskler. Güvenlik testlerinin çıktısı görülmeden “yetki sızıntısı yok” şeklinde kesin iddia yapma.
