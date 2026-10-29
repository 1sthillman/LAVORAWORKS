# Canlıya geçiş kontrol listesi (taslak)

## Firebase proje kurulumu
- [ ] Doğru Firebase projesi ve Realtime Database instance seçildi; dev/test/prod ayrıldı.
- [ ] Authentication > Google provider etkin, desteklenen domain/redirect ayarları test edildi.
- [ ] Gerçek admin Auth UID'si console üzerinden doğrulandı; `REPLACE_WITH_REAL_ADMIN_UID` kalmadı.
- [ ] Web Firebase config uygulama ayarlarına doğru şekilde eklendi; service-account/private key istemci bundle'ında yok.
- [ ] Realtime Database Rules önce Emulator'da çalıştırıldı; sonra deploy edildi.

## Veri güvenliği
- [ ] Çalışan, doğrudan SDK/REST ile `projectFinancials`, `ledger`, `receipts`, `mediaPayloads/finance` okuyamıyor.
- [ ] `projectPublic`, `projectIndex`, `workflowStaff` ve `customerViews` unknown-field testleri geçiyor.
- [ ] İkinci admin atama, kendini yükseltme, disabled member erişimi, başka müşteri projesi ve davet tekrar kullanımı testleri geçiyor.
- [ ] Customer intake root read reddediliyor; yalnız `customerIntakeIndex` özeti ile ilgili UID/request detayı okunuyor.
- [ ] Görsel upload sahipliği, Base64 byte/string limitleri ve thumbnail/payload ayrı erişimleri test edildi.

## Yerel veri ve senkronizasyon
- [ ] Orijinal HTML ve tüm IndexedDB verisi için doğrulanmış backup mevcut.
- [ ] `p`, `scans`, `led`, `rcpt`, `wph`, `lvr_voice_db` için sayım ve migration map raporu mevcut.
- [ ] Offline create/update/delete, refresh, yeniden bağlanma, retry, idempotency ve conflict senaryoları test edildi.
- [ ] Yetki iptalinde bekleyen outbox kayıtları kaybolmadan karantinaya alınıyor.
- [ ] Restore önce dry-run ve fark raporu veriyor; eski veri doğrulanmadan silinmiyor.

## Üretime geçiş
- [ ] Küçük test kullanıcı/proje grubunda canary başarılı.
- [ ] Firebase usage/download metrics gözden geçirildi; Base64 egress ölçüldü.
- [ ] Rollback adımları ve eski HTML ile yeni şema arasındaki geri dönüş yolu prova edildi.
- [ ] Bilinen riskler, başarısız testler ve kalan işler yazılı.

**Not:** Bu checklist işaretlenmiş/uygulanmış sonucu değil, canlıya geçişte doğrulanması gereken maddeleri gösterir.
