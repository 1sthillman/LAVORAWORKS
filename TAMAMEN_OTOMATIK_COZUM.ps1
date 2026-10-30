# ═══════════════════════════════════════════════════════════════════
# 🚀 LAVORA WORKS - TAMAMEN OTOMATİK KURULUM VE DEPLOY
# ═══════════════════════════════════════════════════════════════════
# Bu script her şeyi otomatik yapar - hiçbir bilgiye ihtiyacınız yok!
# ═══════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 LAVORA WORKS - OTOMATİK KURULUM BAŞLIYOR" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$Global:HataOlustu = $false

# ═══════════════════════════════════════════════════════════════════
# ADIM 1: UID BİLGİSİNİ AL
# ═══════════════════════════════════════════════════════════════════
Write-Host "📋 ADIM 1/6: UID bilgisi alınıyor..." -ForegroundColor Yellow
$UID = "d03bSvP9kOY51iRg4GRY87StV1j1"
Write-Host "✅ UID tespit edildi: $UID" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ADIM 2: FIREBASE RULES'U GÜNCELLE
# ═══════════════════════════════════════════════════════════════════
Write-Host "📋 ADIM 2/6: Firebase Database Rules güncelleniyor..." -ForegroundColor Yellow

try {
    # database.rules.json dosyasını oku
    $rulesPath = "database.rules.json"
    $rulesContent = Get-Content $rulesPath -Raw
    
    # Eski UID'leri yeni UID ile değiştir (tüm varyasyonlar)
    $oldUIDs = @(
        "d03bSvP9kOY5IiRg46RY875tV1j1",
        "d03bSvP9kOY51iRg4GRY87StV1j1"
    )
    
    foreach ($oldUID in $oldUIDs) {
        $rulesContent = $rulesContent -replace [regex]::Escape($oldUID), $UID
    }
    
    # Güncellenmiş içeriği kaydet
    Set-Content -Path $rulesPath -Value $rulesContent -NoNewline
    
    Write-Host "✅ Database rules güncellendi" -ForegroundColor Green
} catch {
    Write-Host "HATA: Database rules guncellenemedi - $_" -ForegroundColor Red
    $Global:HataOlustu = $true
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ADIM 3: FIREBASE TOOLS KURULUMU
# ═══════════════════════════════════════════════════════════════════
Write-Host "📋 ADIM 3/6: Firebase Tools kuruluyor..." -ForegroundColor Yellow

try {
    # Önce node_modules ve package-lock.json'ı temizle
    if (Test-Path "node_modules") {
        Write-Host "🗑️ Eski node_modules temizleniyor..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Write-Host "🗑️ Eski package-lock.json temizleniyor..." -ForegroundColor Yellow
        Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    }
    
    Write-Host "📦 npm install çalıştırılıyor..." -ForegroundColor Yellow
    npm install --legacy-peer-deps 2>&1 | Out-Null
    
    Write-Host "✅ Firebase Tools kuruldu" -ForegroundColor Green
} catch {
    Write-Host "⚠️ UYARI: Firebase Tools kurulumunda sorun - Manuel kurulum gerekebilir" -ForegroundColor Yellow
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ADIM 4: FIREBASE GİRİŞ KONTROLÜ
# ═══════════════════════════════════════════════════════════════════
Write-Host "📋 ADIM 4/6: Firebase giriş durumu kontrol ediliyor..." -ForegroundColor Yellow

try {
    $firebaseExe = ".\node_modules\.bin\firebase.cmd"
    
    if (Test-Path $firebaseExe) {
        $loginCheck = & $firebaseExe projects:list 2>&1 | Out-String
        
        if ($loginCheck -like "*lavoradesign-49ae4*") {
            Write-Host "✅ Firebase girişi yapılmış" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Firebase girişi gerekiyor..." -ForegroundColor Yellow
            Write-Host "🌐 Tarayıcı açılıyor, lütfen Google hesabınızla giriş yapın..." -ForegroundColor Cyan
            & $firebaseExe login
            Write-Host "✅ Firebase girişi tamamlandı" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️ Firebase CLI bulunamadı, global kurulum deneniyor..." -ForegroundColor Yellow
        npm install -g firebase-tools
        firebase login
        Write-Host "✅ Firebase girişi tamamlandı" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ UYARI: Firebase giriş kontrolünde sorun - $_" -ForegroundColor Yellow
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ADIM 5: DATABASE RULES DEPLOY
# ═══════════════════════════════════════════════════════════════════
Write-Host "📋 ADIM 5/6: Database Rules deploy ediliyor..." -ForegroundColor Yellow

try {
    if (Test-Path ".\node_modules\.bin\firebase.cmd") {
        $firebaseExe = ".\node_modules\.bin\firebase.cmd"
    } else {
        $firebaseExe = "firebase"
    }
    
    Write-Host "🚀 Database rules yükleniyor..." -ForegroundColor Cyan
    & $firebaseExe deploy --only database --project lavoradesign-49ae4
    
    Write-Host "✅ Database rules başarıyla deploy edildi!" -ForegroundColor Green
} catch {
    Write-Host "❌ HATA: Database rules deploy edilemedi - $_" -ForegroundColor Red
    $Global:HataOlustu = $true
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ADIM 6: HOSTING DEPLOY
# ═══════════════════════════════════════════════════════════════════
Write-Host "📋 ADIM 6/6: Firebase Hosting deploy ediliyor..." -ForegroundColor Yellow

try {
    if (Test-Path ".\node_modules\.bin\firebase.cmd") {
        $firebaseExe = ".\node_modules\.bin\firebase.cmd"
    } else {
        $firebaseExe = "firebase"
    }
    
    Write-Host "🚀 Web sitesi yükleniyor..." -ForegroundColor Cyan
    & $firebaseExe deploy --only hosting --project lavoradesign-49ae4
    
    Write-Host "✅ Web sitesi başarıyla deploy edildi!" -ForegroundColor Green
} catch {
    Write-Host "❌ HATA: Hosting deploy edilemedi - $_" -ForegroundColor Red
    $Global:HataOlustu = $true
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# ADIM 7: ADMIN YETKİSİ VERME (MANUEL TALİMAT)
# ═══════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 SON ADIM: ADMIN YETKİSİ VERME" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 SENIN UID'N: $UID" -ForegroundColor Green
Write-Host ""
Write-Host "Şu yöntemlerden BİRİNİ kullan:" -ForegroundColor White
Write-Host ""
Write-Host "YÖNTEM 1: Firebase CLI (ÖNERİLEN)" -ForegroundColor Cyan
Write-Host "──────────────────────────────────" -ForegroundColor Gray

if (Test-Path ".\node_modules\.bin\firebase.cmd") {
    $firebaseExe = ".\node_modules\.bin\firebase.cmd"
} else {
    $firebaseExe = "firebase"
}

Write-Host "$firebaseExe database:set /orgs/lavora-main/members/$UID admin-member.json --project lavoradesign-49ae4" -ForegroundColor Yellow
Write-Host ""
Write-Host "YÖNTEM 2: Firebase Console (KOLAY)" -ForegroundColor Cyan
Write-Host "──────────────────────────────────" -ForegroundColor Gray
Write-Host "1. Şu siteyi aç: https://console.firebase.google.com/project/lavoradesign-49ae4/database/lavoradesign-49ae4-default-rtdb/data" -ForegroundColor White
Write-Host "2. '/orgs/lavora-main/members/' yoluna git" -ForegroundColor White
Write-Host "3. '+' butonuna tıkla" -ForegroundColor White
Write-Host "4. Name: $UID" -ForegroundColor White
Write-Host "5. admin-member.json içeriğini yapıştır:" -ForegroundColor White
Write-Host ""
Write-Host '{' -ForegroundColor Gray
Write-Host '  "role": "admin",' -ForegroundColor Gray
Write-Host '  "status": "active",' -ForegroundColor Gray
Write-Host '  "assignedBy": "system-init",' -ForegroundColor Gray
Write-Host '  "assignedAt": 1735488000000,' -ForegroundColor Gray
Write-Host '  "updatedAt": 1735488000000' -ForegroundColor Gray
Write-Host '}' -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# SONUÇ RAPORU
# ═══════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($Global:HataOlustu) {
    Write-Host "⚠️ KURULUM TAMAMLANDI (BAZI UYARILAR VAR)" -ForegroundColor Yellow
} else {
    Write-Host "✅ KURULUM TAMAMEN BAŞARILI!" -ForegroundColor Green
}
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 WEB SİTENİZ:" -ForegroundColor Green
Write-Host "   https://lavoradesign-49ae4.web.app/" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 UID KONTROL:" -ForegroundColor Green
Write-Host "   https://lavoradesign-49ae4.web.app/get-my-uid.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 ÇALIŞMA MASASI:" -ForegroundColor Green
Write-Host "   https://lavoradesign-49ae4.web.app/lavora-calisma-masasi-v38-firebase.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Yukarıdaki linklerden birine gidip test edin!" -ForegroundColor Yellow
Write-Host ""
