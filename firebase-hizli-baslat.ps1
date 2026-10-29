# 🔥 Lavora Firebase Hızlı Başlatma Script'i

Write-Host "🔥 Lavora Firebase - Hızlı Başlatma" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Admin UID'sini sor
Write-Host "📋 Adım 1: Admin UID'sini Belirle" -ForegroundColor Yellow
Write-Host "Henüz Admin UID'in yoksa, şimdilik BOŞ BIRAK (Enter'a bas)" -ForegroundColor Gray
$adminUid = Read-Host "Admin UID'ini gir (örn: xYz123aBc...)"

if ($adminUid -and $adminUid -ne "") {
    Write-Host "✅ Admin UID: $adminUid" -ForegroundColor Green
    
    # Rules dosyasını güncelle
    Write-Host "`n📝 Adım 2: Security Rules Güncelleniyor..." -ForegroundColor Yellow
    
    $rulesPath = "html\database.rules.json"
    if (Test-Path $rulesPath) {
        $content = Get-Content $rulesPath -Raw
        $newContent = $content -replace 'REPLACE_WITH_REAL_ADMIN_UID', $adminUid
        Set-Content $rulesPath $newContent
        Write-Host "✅ Rules dosyası güncellendi: $rulesPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Rules dosyası bulunamadı: $rulesPath" -ForegroundColor Red
    }
    
    # Duplikat rules dosyasını da güncelle
    $rulesPath2 = "html\lavora-database-rules.json"
    if (Test-Path $rulesPath2) {
        $content2 = Get-Content $rulesPath2 -Raw
        $newContent2 = $content2 -replace 'REPLACE_WITH_REAL_ADMIN_UID', $adminUid
        Set-Content $rulesPath2 $newContent2
        Write-Host "✅ Duplikat rules dosyası da güncellendi" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Admin UID atlandı - Daha sonra ayarlayabilirsin" -ForegroundColor Gray
}

# Test çalıştırma seçeneği
Write-Host "`n🧪 Adım 3: Emulator Testleri" -ForegroundColor Yellow
$runTests = Read-Host "Security Rules testlerini çalıştırmak ister misin? (y/n)"

if ($runTests -eq "y" -or $runTests -eq "Y") {
    Write-Host "🧪 Testler çalıştırılıyor..." -ForegroundColor Cyan
    Push-Location html
    npm run test:rules
    Pop-Location
} else {
    Write-Host "⏭️  Testler atlandı" -ForegroundColor Gray
}

# Localhost server başlat
Write-Host "`n🚀 Adım 4: Localhost Server" -ForegroundColor Yellow
$startServer = Read-Host "Localhost server'ı başlatmak ister misin? (y/n)"

if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host "`n✅ Server başlatılıyor..." -ForegroundColor Green
    Write-Host "📍 Tarayıcıda aç: http://localhost:8080/lavora-calisma-masasi-v38-firebase.html" -ForegroundColor Cyan
    Write-Host "🛑 Durdurmak için: Ctrl+C`n" -ForegroundColor Yellow
    python -m http.server 8080
} else {
    Write-Host "⏭️  Server atlandı" -ForegroundColor Gray
}

Write-Host "`n✨ İşlem tamamlandı!" -ForegroundColor Green
Write-Host "📖 Detaylı bilgi için: FIREBASE_CONFIG_HAZIR.md" -ForegroundColor Cyan
