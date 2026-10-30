# LAVORA WORKS - TEK TIKLAMA DEPLOY
# Bu script her seyi otomatik yapar!

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "LAVORA WORKS - OTOMATIK DEPLOY" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# ADIM 1: Login Kontrol
Write-Host "[1/4] Firebase login kontrol ediliyor..." -ForegroundColor Yellow
$loginTest = npx firebase-tools projects:list --project lavoradesign-49ae4 2>&1 | Out-String

if ($loginTest -like "*lavoradesign-49ae4*") {
    Write-Host "      Login mevcut!" -ForegroundColor Green
} else {
    Write-Host "      Login gerekiyor, tarayici aciliyor..." -ForegroundColor Cyan
    npx firebase-tools login
}

Write-Host ""

# ADIM 2: Database Rules Deploy
Write-Host "[2/4] Database Rules deploy ediliyor..." -ForegroundColor Yellow
npx firebase-tools deploy --only database --project lavoradesign-49ae4

if ($LASTEXITCODE -eq 0) {
    Write-Host "      Database Rules basariyla deploy edildi!" -ForegroundColor Green
} else {
    Write-Host "      UYARI: Database Rules deploy edilemedi!" -ForegroundColor Red
}

Write-Host ""

# ADIM 3: Hosting Deploy
Write-Host "[3/4] Hosting deploy ediliyor..." -ForegroundColor Yellow
npx firebase-tools deploy --only hosting --project lavoradesign-49ae4

if ($LASTEXITCODE -eq 0) {
    Write-Host "      Hosting basariyla deploy edildi!" -ForegroundColor Green
} else {
    Write-Host "      UYARI: Hosting deploy edilemedi!" -ForegroundColor Red
}

Write-Host ""

# ADIM 4: Admin Yetkisi Ver
Write-Host "[4/4] Admin yetkisi veriliyor..." -ForegroundColor Yellow
npx firebase-tools database:set /orgs/lavora-main/members/d03bSvP9kOY51iRg4GRY87StV1j1 admin-member.json --project lavoradesign-49ae4 --confirm

if ($LASTEXITCODE -eq 0) {
    Write-Host "      Admin yetkisi basariyla verildi!" -ForegroundColor Green
} else {
    Write-Host "      UYARI: Admin yetkisi verilemedi!" -ForegroundColor Yellow
    Write-Host "      Manuel olarak Firebase Console'dan ekleyebilirsiniz" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "DEPLOY TAMAMLANDI!" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Et:" -ForegroundColor Yellow
Write-Host "  Ana Sayfa:     https://lavoradesign-49ae4.web.app/" -ForegroundColor Cyan
Write-Host "  UID Kontrol:   https://lavoradesign-49ae4.web.app/get-my-uid.html" -ForegroundColor Cyan
Write-Host "  Calisma Masasi: https://lavoradesign-49ae4.web.app/lavora-calisma-masasi-v38-firebase.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "UID'niz: d03bSvP9kOY51iRg4GRY87StV1j1" -ForegroundColor Green
Write-Host ""
