# Lavora Firebase Setup Script
# Bu script Firebase projesini yapilandirmak icin kullanilir

Write-Host ""
Write-Host "=== LAVORA FIREBASE SETUP ===" -ForegroundColor Cyan
Write-Host ""

# Proje bilgileri
$projectId = "lavoradesign-49ae4"
$databaseUrl = "https://lavoradesign-49ae4-default-rtdb.firebaseio.com"

Write-Host "[PROJE]" -ForegroundColor Yellow
Write-Host "   Project ID: $projectId"
Write-Host "   Database URL: $databaseUrl"
Write-Host ""

# Admin UID kontrolu
Write-Host "[ADMIN UID]" -ForegroundColor Yellow
$rulesContent = Get-Content "database.rules.json" -Raw

if ($rulesContent -match "test_admin_uid") {
    Write-Host "   [UYARI] TEST UID KULLANILIYOR!" -ForegroundColor Red
    Write-Host "   Production icin gercek UID gerekli."
    Write-Host ""
    Write-Host "   Admin UID'yi degistirmek icin:" -ForegroundColor Cyan
    Write-Host '   $adminUid = "FIREBASE_CONSOLE_UID"'
    Write-Host '   (Get-Content database.rules.json) -replace "test_admin_uid_replace_in_production", $adminUid | Set-Content database.rules.json'
    Write-Host ""
} else {
    Write-Host "   [OK] Admin UID ayarlanmis" -ForegroundColor Green
    Write-Host ""
}

# Dependencies kontrolu
Write-Host "[DEPENDENCIES]" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   [OK] node_modules mevcut" -ForegroundColor Green
} else {
    Write-Host "   [EKSIK] node_modules bulunamadi" -ForegroundColor Red
    Write-Host "   Calistir: npm install"
}
Write-Host ""

# Firebase CLI kontrolu
Write-Host "[FIREBASE CLI]" -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Firebase CLI kurulu ($firebaseVersion)" -ForegroundColor Green
    } else {
        Write-Host "   [EKSIK] Firebase CLI bulunamadi" -ForegroundColor Red
        Write-Host "   Kur: npm install -g firebase-tools"
    }
} catch {
    Write-Host "   [EKSIK] Firebase CLI bulunamadi" -ForegroundColor Red
    Write-Host "   Kur: npm install -g firebase-tools"
}
Write-Host ""

# Kullanilabilir komutlar
Write-Host "[KOMUTLAR]" -ForegroundColor Cyan
Write-Host ""
Write-Host "   npm install              " -ForegroundColor White -NoNewline
Write-Host "- Dependencies yukle" -ForegroundColor Gray
Write-Host "   npm run test:rules       " -ForegroundColor White -NoNewline
Write-Host "- Security Rules testleri" -ForegroundColor Gray
Write-Host "   npm run emulator         " -ForegroundColor White -NoNewline
Write-Host "- Firebase Emulator baslat" -ForegroundColor Gray
Write-Host "   npm run serve            " -ForegroundColor White -NoNewline
Write-Host "- HTML'i Firebase ile serve et" -ForegroundColor Gray
Write-Host "   npm run deploy:rules     " -ForegroundColor White -NoNewline
Write-Host "- Security Rules deploy" -ForegroundColor Gray
Write-Host "   npm run deploy:hosting   " -ForegroundColor White -NoNewline
Write-Host "- HTML hosting deploy" -ForegroundColor Gray
Write-Host "   npm run deploy           " -ForegroundColor White -NoNewline
Write-Host "- Tam deploy" -ForegroundColor Gray
Write-Host ""

# Python HTTP Server (alternatif)
Write-Host "[ALTERNATIF - Python Server]" -ForegroundColor Cyan
Write-Host "   python -m http.server 8080"
Write-Host "   Sonra ac: http://localhost:8080/lavora-calisma-masasi-v38-firebase.html"
Write-Host ""

# Firebase Console baglantilari
Write-Host "[FIREBASE CONSOLE]" -ForegroundColor Cyan
Write-Host "   Proje: https://console.firebase.google.com/project/$projectId"
Write-Host "   Authentication: https://console.firebase.google.com/project/$projectId/authentication"
Write-Host "   Database: https://console.firebase.google.com/project/$projectId/database"
Write-Host "   Rules: https://console.firebase.google.com/project/$projectId/database/rules"
Write-Host ""

Write-Host "Setup kontrolleri tamamlandi!" -ForegroundColor Green
Write-Host ""
