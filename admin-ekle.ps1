# LAVORA FIREBASE - ADMIN EKLEME SCRIPTI
# Bu script Firebase Database'e admin kaydini ekler

param(
    [string]$UID = "d03bSvP9kOY51iRg4GRY87StV1j1"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIREBASE ADMIN KAYIT EKLEME" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "UID: $UID" -ForegroundColor Green
Write-Host ""

# Admin kaydini JSON dosyasina yaz
$adminData = @"
{
  "role": "admin",
  "status": "active",
  "assignedBy": "system-init",
  "assignedAt": 1735488000000,
  "updatedAt": 1735488000000
}
"@

$adminData | Out-File -FilePath "temp-admin.json" -Encoding UTF8 -NoNewline

Write-Host "[1/3] Database'e admin kaydi ekleniyor..." -ForegroundColor Yellow
npx firebase-tools database:set "/orgs/lavora-main/members/$UID" temp-admin.json --project lavoradesign-49ae4 --confirm

if ($LASTEXITCODE -eq 0) {
    Write-Host "      BASARILI!" -ForegroundColor Green
} else {
    Write-Host "      HATA! Manuel olarak eklemen gerekiyor." -ForegroundColor Red
    Write-Host "      Firebase Console: https://console.firebase.google.com/project/lavoradesign-49ae4/database" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "[2/3] Database Rules deploy ediliyor..." -ForegroundColor Yellow
npx firebase-tools deploy --only database --project lavoradesign-49ae4

if ($LASTEXITCODE -eq 0) {
    Write-Host "      BASARILI!" -ForegroundColor Green
} else {
    Write-Host "      UYARI: Rules deploy edilemedi" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/3] Kontrol ediliyor..." -ForegroundColor Yellow
npx firebase-tools database:get "/orgs/lavora-main/members/$UID" --project lavoradesign-49ae4

# Temp dosyayi sil
Remove-Item "temp-admin.json" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SIMDI NE YAP:" -ForegroundColor Yellow
Write-Host "1. Tarayiciyi kapat ve yeniden ac" -ForegroundColor White
Write-Host "2. Cache temizle (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Siteye git:" -ForegroundColor White
Write-Host "   https://lavoradesign-49ae4.web.app/lavora-calisma-masasi-v38-firebase.html" -ForegroundColor Cyan
Write-Host "4. Google ile giris yap" -ForegroundColor White
Write-Host "5. ARTIK CALISACAK!" -ForegroundColor Green
Write-Host ""
