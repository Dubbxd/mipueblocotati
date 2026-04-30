param()

# ============================================================
# Mi Pueblo Novato — descarga idempotente de assets de SpotHopper
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

$wsBase  = "https://static.spotapps.co/website_images/ab_websites/544706_website_v1"
$spots   = "https://static.spotapps.co/spots"

# ---------- LOGOS y FAVICON ----------
Write-Host ""
Write-Host "--- LOGOS / BRAND ---"
Get-Asset "$wsBase/logo.png"                          "logos" "logo.png"
Get-Asset "$wsBase/icon.png"                          "logos" "icon.png"
Get-Asset "$wsBase/favicons/apple-touch-icon.png"     "icons" "apple-touch-icon.png"
Get-Asset "$wsBase/favicons/favicon.ico"              "icons" "favicon.ico"
Get-Asset "$wsBase/favicons/favicon.svg"              "icons" "favicon.svg"
Get-Asset "$wsBase/favicons/favicon-96x96.png"        "icons" "favicon-96x96.png"
Get-Asset "$wsBase/favicons/site.webmanifest"         "icons" "site.webmanifest"

# ---------- HERO / TEMPLATE IMAGES ----------
Write-Host ""
Write-Host "--- HERO / TEMPLATE ---"
Get-Asset "$wsBase/social.jpg"          "hero"  "og-social-share.jpg"
Get-Asset "$wsBase/v8.jpg"              "hero"  "hero-v8.jpg"
Get-Asset "$wsBase/video_poster.jpg"    "hero"  "video-poster.jpg"
Get-Asset "$wsBase/catering.png"        "hero"  "section-catering.png"
Get-Asset "$wsBase/party.png"           "hero"  "section-party.png"

# ---------- GALLERY / FOOD PHOTOS (con captions del HTML alt) ----------
Write-Host ""
Write-Host "--- GALLERY ---"
$gallery = @(
  "alambre-meal=0a/265e6426f044329e79258235eddc50",
  "two-meals=96/b5f88462774cc6a20c6f849cd708db",
  "served-drinks=a3/42a25149bb425696b9a96e52d4dff3",
  "tostada-raspada=04/c3f756cbb34b39b784f6e0831642e0",
  "super-nachos=f0/bf338746a44d809f741d66121d0c5a",
  "siete-mares-soup=b2/5f8a59bc024e5093a28fb5e35b2dc0",
  "quesa-birria=bc/153f535dd74e18b8e035a66e916633",
  "molcajete-bowl=12/8625aae82a4e829d1d50df005f06a9",
  "chile-relleno=ed/259e0eefa347dc9be7c70d0ef73cb6",
  "birria-bowl=8b/41674e532d4991a75a693abbdf8d03",
  "burrito-served=82/7cadcbf47c456fa6decf8819d78a97",
  "taco-tuesday=ba/b5fe200b0b44b1bd00fb962d845681",
  "pollo-con-crema=12/73ecda43904fa58bd5f301ae74f141",
  "quesa-birria-taco-closeup=16/8e37dbb1ed4de7ac8746faa5bf5aa4",
  "quesa-birria-taco-served=c6/4e63b1a2f045d9a85c5053fa4a567c",
  "taco-salad-top=0b/343511ffb148529db3f84f314b4298",
  "chef-flames=9e/e6656aaa7541ccad7b410d900c74cd",
  "restaurant-building-garden=53/cbcef15c8d420d9cde8f00705923f5",
  "taco-salad-served=ca/fca9e87c12404991c3a42cca81b08f",
  "quesa-birria-taco-2=c8/8ffebc54d74f33bd3ab09089722a9e",
  "camarones-con-steak=91/c49cc9fd244862832bdad110b59fe8"
)

foreach ($entry in $gallery) {
    $p = $entry.Split("=", 2)
    Get-Asset "$spots/$($p[1])/full" "gallery" "$($p[0]).jpg"
}

# ---------- ADICIONALES SIN CAPTION (extraídos de HTML) ----------
Write-Host ""
Write-Host "--- GALLERY (sin caption) ---"
$extra = @(
  "01/4817e13d774d7ab13b1d97b9524b17",
  "01/9148a495904704a838d917e9adb7be",
  "1f/0f6b4637b6404b86ad7224f9d6c0db",
  "3b/bb8273608547279afaddb2603618c5",
  "3c/d5865959c3473c9404d4581df88350",
  "50/f293bd007a4b7291816e7298fa6671",
  "68/3b366845654c6c84c3f1e28b38346d",
  "73/7b1d14c6424b66819c4e9f933df320",
  "92/9333fe3e8143bab032281faa3a707a",
  "ae/22afbcdb674073abdc6e52d48ae18c",
  "b2/c2c4bd669d45d1bfcca20dd4693c99",
  "ce/357cfdef214188b00dc3b56bea52af",
  "e8/3bae7441304c2dabb013ebb1a32422"
)
$idx = 1
foreach ($id in $extra) {
    $name = "untitled-{0:D2}.jpg" -f $idx
    Get-Asset "$spots/$id/full" "gallery" $name
    $idx++
}

# ---------- PLACEHOLDERS / MISC ----------
Write-Host ""
Write-Host "--- PLACEHOLDERS ---"
Get-Asset "https://static.spotapps.co/web/placeholder.png" "placeholders" "spothopper-placeholder.png"

# ---------- RESUMEN ----------
$tc = (Get-ChildItem $root -Recurse -File).Count
$ts = [math]::Round((Get-ChildItem $root -Recurse -File | Measure-Object Length -Sum).Sum/1MB, 2)
Write-Host ""
Write-Host "== COMPLETADO: $tc archivos, $ts MB =="
