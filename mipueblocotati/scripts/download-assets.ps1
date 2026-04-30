param()

# ============================================================
# Mi Pueblo Cotati — descarga idempotente de assets desde Wix
# ============================================================
# Ejecutar: powershell -ExecutionPolicy Bypass -File scripts\download-assets.ps1
# Idempotente: omite archivos ya descargados (Test-Path).

$root = Join-Path $PSScriptRoot "..\assets"
$root = (New-Item -ItemType Directory -Path $root -Force).FullName

@("logos","hero","menu","gallery","icons","placeholders") | ForEach-Object {
    New-Item -ItemType Directory -Path (Join-Path $root $_) -Force | Out-Null
}

function Get-Asset {
    param([string]$Url, [string]$Folder, [string]$FileName)
    $dest = Join-Path $root (Join-Path $Folder $FileName)
    if (Test-Path $dest) { Write-Host "  [SKIP] $Folder/$FileName"; return }
    try {
        $h = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        Invoke-WebRequest -Uri $Url -OutFile $dest -Headers $h -UseBasicParsing -TimeoutSec 60 -ErrorAction Stop
        $sz = [math]::Round((Get-Item $dest).Length/1KB, 1)
        Write-Host "  [OK]   $Folder/$FileName ($sz KB)"
    } catch {
        Write-Host "  [ERR]  $Folder/$FileName - $($_.Exception.Message)"
    }
}

$wix = "https://static.wixstatic.com/media"

# ---------- LOGOS ----------
Write-Host ""
Write-Host "--- LOGOS ---"
Get-Asset "$wix/302d76_9e488716ce1947aca988479479171c72~mv2.png" "logos" "logo-mi-pueblo.png"
Get-Asset "$wix/302d76_7330664f382f4ffda7beea7e692eae60~mv2.png" "logos" "logo-secondary.png"

# ---------- HERO ----------
Write-Host ""
Write-Host "--- HERO ---"
Get-Asset "$wix/302d76_afe4c7b0bc9a4b0dbbdc9caae96b56ea~mv2.jpg" "hero" "hero-restaurante-interior.jpg"
Get-Asset "$wix/11062b_975703e074c740e8b0d99568f870d239~mv2_d_4256_2832_s_4_2.jpg" "hero" "hero-avocado-bowl.jpg"
Get-Asset "$wix/302d76_a090c3dccca7477698ad3118c9782ba1~mv2.jpg" "hero" "hero-fajitas.jpg"
Get-Asset "$wix/302d76_b3ad7976c8be4079b20022d723e4e45a~mv2.jpeg" "hero" "hero-platillo-1.jpeg"
Get-Asset "$wix/302d76_e6863ad2771f4a7abd25c3a1975a1439~mv2.jpeg" "hero" "hero-platillo-2.jpeg"
Get-Asset "$wix/302d76_adc6133fd6114ad08aa9e46cbf654e1d~mv2.jpeg" "hero" "hero-platillo-3.jpeg"

# ---------- ICONS (badges de servicios en home) ----------
Write-Host ""
Write-Host "--- ICONS ---"
Get-Asset "$wix/302d76_a46f99a9bb274695840d1d148e62ab0b~mv2.png" "icons" "icon-mexican-restaurant.png"
Get-Asset "$wix/302d76_103de8a80872441a8d4689d4b4d6cb16~mv2.png" "icons" "icon-mexican-restaurant-2.png"
Get-Asset "$wix/302d76_828a1004eb0d482286c69b4dc64d23a0~mv2.png" "icons" "icon-doordash.png"
Get-Asset "$wix/302d76_c862e196681f4cb9a160e4a00b399bc3~mv2.png" "icons" "icon-foodtruck.png"
Get-Asset "$wix/302d76_ec41adf81adc47fbb24d7d3763c17142~mv2.png" "icons" "icon-misc.png"
Get-Asset "$wix/01c3aff52f2a4dffa526d7a9843d46ea.png" "icons" "icon-generic-1.png"
Get-Asset "$wix/0fdef751204647a3bbd7eaa2827ed4f9.png" "icons" "icon-generic-2.png"
Get-Asset "$wix/23fd2a2be53141ed810f4d3dcdcd01fa.png" "icons" "icon-generic-3.png"

# ---------- AWARDS (badges de premios) ----------
Write-Host ""
Write-Host "--- AWARDS / GALLERY ---"
Get-Asset "$wix/302d76_2ff1917d2ac34a609698ff7b8caec4df~mv2.png" "gallery" "award-best-burrito-restaurant.png"
Get-Asset "$wix/302d76_af86e9ec5ef84a48bdb71bed67ce47bd~mv2.png" "gallery" "award-mi-pueblo-badge.png"
Get-Asset "$wix/302d76_46250abffb4b4ab587c6896ee174ebab~mv2.png" "gallery" "award-best-steaks-sonoma.png"
Get-Asset "$wix/302d76_b22e695c930a4c8ebec76431940cbffb~mv2.png" "gallery" "award-restaurant-guru-certificate.png"
Get-Asset "$wix/302d76_a07b2c57b50f4393a6e11a52e8c3a984~mv2.png" "gallery" "award-best-mexican-sonoma.png"

# ---------- MENU PDF (oficial, fuente de verdad para precios) ----------
Write-Host ""
Write-Host "--- MENU PDF ---"
$pdfDest = Join-Path $root "menu\menu-oficial.pdf"
if (-not (Test-Path $pdfDest)) {
    try {
        Invoke-WebRequest -Uri "https://drive.google.com/uc?export=download&id=1yySEviBLR8ZMpMLQcHVfbEkh6bmQGSJv" `
            -OutFile $pdfDest `
            -UseBasicParsing -TimeoutSec 120
        $sz = [math]::Round((Get-Item $pdfDest).Length/1KB, 1)
        Write-Host "  [OK]   menu/menu-oficial.pdf ($sz KB)"
    } catch {
        Write-Host "  [ERR]  menu-oficial.pdf - $($_.Exception.Message)"
    }
} else {
    Write-Host "  [SKIP] menu/menu-oficial.pdf"
}

# ---------- RESUMEN ----------
$tc = (Get-ChildItem $root -Recurse -File).Count
$ts = [math]::Round((Get-ChildItem $root -Recurse -File | Measure-Object Length -Sum).Sum/1MB, 2)
Write-Host ""
Write-Host "== COMPLETADO: $tc archivos, $ts MB =="
