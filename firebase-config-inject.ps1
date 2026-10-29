# 🔥 Firebase Config Auto-Inject Script

Write-Host "🔥 Firebase Config Otomatik Enjeksiyon" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Firebase config
$firebaseConfig = @{
    apiKey = "AIzaSyAO7UomC_1wv-1lMEuDD6Z5lvzy3coZH_M"
    authDomain = "lavoradesign-49ae4.firebaseapp.com"
    databaseURL = "https://lavoradesign-49ae4-default-rtdb.firebaseio.com"
    projectId = "lavoradesign-49ae4"
    storageBucket = "lavoradesign-49ae4.firebasestorage.app"
    messagingSenderId = "78076586593"
    appId = "1:78076586593:web:24e0cc4219d73d25471820"
    measurementId = "G-Z9LH4NPWRD"
}

$orgId = "lavora-main"
$adminUid = ""  # Şimdilik boş - ilk girişten sonra doldurulacak

Write-Host "📋 Firebase Config:" -ForegroundColor Yellow
Write-Host "  Project ID: $($firebaseConfig.projectId)" -ForegroundColor Gray
Write-Host "  Database: $($firebaseConfig.databaseURL)" -ForegroundColor Gray
Write-Host "  Org ID: $orgId" -ForegroundColor Gray

# Admin UID iste
Write-Host "`n👤 Admin UID'ini gir (Henüz yoksa Enter'a bas):" -ForegroundColor Yellow
$inputUid = Read-Host "Admin UID"

if ($inputUid -and $inputUid -ne "") {
    $adminUid = $inputUid
    Write-Host "✅ Admin UID ayarlandı: $adminUid" -ForegroundColor Green
} else {
    Write-Host "⏭️  Admin UID boş - İlk girişten sonra ayarlayabilirsin" -ForegroundColor Gray
}

# Config objesi oluştur
$cloudConfig = @{
    firebase = $firebaseConfig
    orgId = $orgId
}

if ($adminUid -ne "") {
    $cloudConfig.adminUid = $adminUid
}

# JSON'a çevir
$configJson = $cloudConfig | ConvertTo-Json -Depth 10 -Compress

Write-Host "`n💾 Config localStorage'a kaydedilecek:" -ForegroundColor Yellow
Write-Host $configJson -ForegroundColor Gray

# localStorage set script'i oluştur
$setConfigScript = @"
// Firebase Config Auto-Inject
(function() {
  const config = $configJson;
  localStorage.setItem('lavora.cloud.config.v1', JSON.stringify(config));
  console.log('✅ Firebase config localStorage\'a kaydedildi!');
  console.log('🔄 Sayfayı yenile (F5) ve Firebase modu aktif olacak');
  alert('✅ Firebase config kaydedildi!\\n\\n🔄 Sayfayı yenile (F5)');
})();
"@

# Dosyaya yaz
$scriptPath = "firebase-config-inject.js"
Set-Content $scriptPath $setConfigScript

Write-Host "`n✅ Config script oluşturuldu: $scriptPath" -ForegroundColor Green

Write-Host "`n📖 Kullanım:" -ForegroundColor Yellow
Write-Host "1. Firebase HTML dosyasını tarayıcıda aç" -ForegroundColor Gray
Write-Host "2. F12 → Console" -ForegroundColor Gray
Write-Host "3. Aşağıdaki kodu yapıştır ve Enter'a bas:`n" -ForegroundColor Gray

Write-Host $setConfigScript -ForegroundColor Cyan

Write-Host "`n4. Sayfayı yenile (F5)" -ForegroundColor Gray
Write-Host "5. Firebase modu otomatik aktif olacak!" -ForegroundColor Green

# Panoya kopyala (isteğe bağlı)
$copyToClipboard = Read-Host "`n📋 Script'i panoya kopyalamak ister misin? (y/n)"

if ($copyToClipboard -eq "y" -or $copyToClipboard -eq "Y") {
    Set-Clipboard $setConfigScript
    Write-Host "✅ Script panoya kopyalandı! Tarayıcı Console'a yapıştırabilirsin" -ForegroundColor Green
}

Write-Host "`n✨ Hazır! Firebase config inject edilmeye hazır!" -ForegroundColor Green
