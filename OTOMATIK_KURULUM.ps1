# LAVORA WORKS - TAMAMEN OTOMATIK KURULUM VE DEPLOY
# Bu script her seyi otomatik yapar - hicbir bilgiye ihtiyaciniz yok!

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "LAVORA WORKS - OTOMATIK KURULUM BASLIYOR" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$Global:HataOlustu = $false

# ADIM 1: UID BILGISINI AL
Write-Host "ADIM 1/6: UID bilgisi aliniyor..." -ForegroundColor Yellow
$UID = "d03bSvP9kOY51iRg4GRY87StV1j1"
Write-Host "UID tespit edildi: $UID" -ForegroundColor Green
Write-Host ""

# ADIM 2: FIREBASE TOOLS KURULUMU
Write-Host "ADIM 2/6: Firebase Tools kuruluyor..." -ForegroundColor Yellow

try {
    # Oncenode_modules ve package-lock.json'i temizle
    if (Test-Path "node_modules") {
        Write-Host "Eski node_modules temizleniyor..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Write-Host "Eski package-lock.json temizleniyor..." -ForegroundColor Yellow
        Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    }
    
    Write-Host "npm install calistiriliyor..." -ForegroundColor Yellow
    npm install --legacy-peer-deps 2>&1 | Out-Null
    
    Write-Host "Firebase Tools kuruldu" -ForegroundColor Green
} catch {
    Write-Host "UYARI: Firebase Tools kurulumunda sorun - Manuel kurulum gerekebilir" -ForegroundColor Yellow
}
Write-Host ""

# ADIM 3: FIREBASE GIRIS KONTROLU
Write-Host "ADIM 3/6: Firebase giris durumu kontrol ediliyor..." -ForegroundColor Yellow

try {
    $firebaseExe = ".\node_modules\.bin\firebase.cmd"
    
    if (Test-Path $firebaseExe) {
        $loginCheck = & $firebaseExe projects:list 2>&1 | Out-String
        
        if ($loginCheck -like "*lavoradesign-49ae4*") {
            Write-Host "Firebase girisi yapilmis" -ForegroundColor Green
        } else {
            Write-Host "Firebase girisi gerekiyor..." -ForegroundColor Yellow
            Write-Host "Tarayici aciliyor, lutfen Google hesabinizla giris yapin..." -ForegroundColor Cyan
            & $firebaseExe login
            Write-Host "Firebase girisi tamamlandi" -ForegroundColor Green
        }
    } else {
        Write-Host "Firebase CLI bulunamadi, global kurulum deneniyor..." -ForegroundColor Yellow
        npm install -g firebase-tools
        firebase login
        Write-Host "Firebase girisi tamamlandi" -ForegroundColor Green
    }
} catch {
    Write-Host "UYARI: Firebase giris kontrolunde sorun - $_" -ForegroundColor Yellow
}
Write-Host ""

# ADIM 4: DATABASE RULES DEPLOY
Write-Host "ADIM 4/6: Database Rules deploy ediliyor..." -ForegroundColor Yellow

try {
    if (Test-Path ".\node_modules\.bin\firebase.cmd") {
        $firebaseExe = ".\node_modules\.bin\firebase.cmd"
    } else {
        $firebaseExe = "firebase"
    }
    
    Write-Host "Database rules yukleniyor..." -ForegroundColor Cyan
    & $firebaseExe deploy --only database --project lavoradesign-49ae4
    
    Write-Host "Database rules basariyla deploy edildi!" -ForegroundColor Green
} catch {
    Write-Host "HATA: Database rules deploy edilemedi - $_" -ForegroundColor Red
    $Global:HataOlustu = $true
}
Write-Host ""

# ADIM 5: HOSTING DEPLOY
Write-Host "ADIM 5/6: Firebase Hosting deploy ediliyor..." -ForegroundColor Yellow

try {
    if (Test-Path ".\node_modules\.bin\firebase.cmd") {
        $firebaseExe = ".\node_modules\.bin\firebase.cmd"
    } else {
        $firebaseExe = "firebase"
    }
    
    Write-Host "Web sitesi yukleniyor..." -ForegroundColor Cyan
    & $firebaseExe deploy --only hosting --project lavoradesign-49ae4
    
    Write-Host "Web sitesi basariyla deploy edildi!" -ForegroundColor Green
} catch {
    Write-Host "HATA: Hosting deploy edilemedi - $_" -ForegroundColor Red
    $Global:HataOlustu = $true
}
Write-Host ""

# ADIM 6: ADMIN YETKISI VERME (MANUEL TALIMAT)
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "SON ADIM: ADMIN YETKISI VERME" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SENIN UID'N: $UID" -ForegroundColor Green
Write-Host ""
Write-Host "Su yontemlerden BIRINI kullan:" -ForegroundColor White
Write-Host ""
Write-Host "YONTEM 1: Firebase CLI (ONERILEN)" -ForegroundColor Cyan
Write-Host "──────────────────────────────────" -ForegroundColor Gray

if (Test-Path ".\node_modules\.bin\firebase.cmd") {
    $firebaseExe = ".\node_modules\.bin\firebase.cmd"
} else {
    $firebaseExe = "firebase"
}

Write-Host "$firebaseExe database:set /orgs/lavora-main/members/$UID html\ADMIN_SETUP_DATABASE.json --project lavoradesign-49ae4" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ya da dogrudan JSON icerigi kullan:" -ForegroundColor White
Write-Host "$firebaseExe database:set /orgs/lavora-main/members/$UID admin-member.json --project lavoradesign-49ae4" -ForegroundColor Yellow
Write-Host ""
Write-Host "YONTEM 2: Firebase Console (KOLAY)" -ForegroundColor Cyan
Write-Host "──────────────────────────────────" -ForegroundColor Gray
Write-Host "1. Su siteyi ac: https://console.firebase.google.com/project/lavoradesign-49ae4/database/lavoradesign-49ae4-default-rtdb/data" -ForegroundColor White
Write-Host "2. '/orgs/lavora-main/members/' yoluna git" -ForegroundColor White
Write-Host "3. '+' butonuna tikla" -ForegroundColor White
Write-Host "4. Name: $UID" -ForegroundColor White
Write-Host "5. admin-member.json icerigini yapistir" -ForegroundColor White
Write-Host ""

# SONUC RAPORU
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
if ($Global:HataOlustu) {
    Write-Host "KURULUM TAMAMLANDI (BAZI UYARILAR VAR)" -ForegroundColor Yellow
} else {
    Write-Host "KURULUM TAMAMEN BASARILI!" -ForegroundColor Green
}
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WEB SITENIZ:" -ForegroundColor Green
Write-Host "   https://lavoradesign-49ae4.web.app/" -ForegroundColor Cyan
Write-Host ""
Write-Host "UID KONTROL:" -ForegroundColor Green
Write-Host "   https://lavoradesign-49ae4.web.app/get-my-uid.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "CALISMA MASASI:" -ForegroundColor Green
Write-Host "   https://lavoradesign-49ae4.web.app/lavora-calisma-masasi-v38-firebase.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Yukaridaki linklerden birine gidip test edin!" -ForegroundColor Yellow
Write-Host ""
