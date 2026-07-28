# Download Bangladesh Protomaps PMTiles for offline map
# Run from project root: powershell -File scripts/download-tiles.ps1

$TilesDir = "client\public\tiles"
$Output = "$TilesDir\bangladesh.pmtiles"

Write-Host "=== Mukto Mesh — Download Bangladesh Map Tiles ===" -ForegroundColor Cyan
Write-Host ""

# Check if tiles already exist
if (Test-Path $Output) {
    $Size = (Get-Item $Output).Length / 1MB
    Write-Host "✅ Tiles already exist: $Output ($([math]::Round($Size, 1)) MB)" -ForegroundColor Green
    Write-Host "   Delete it first to re-download."
    exit 0
}

# Create tiles directory
New-Item -ItemType Directory -Force -Path $TilesDir | Out-Null

# Download pmtiles CLI
$TmpDir = Join-Path $env:TEMP "pmtiles-download"
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

Write-Host "📦 Downloading pmtiles CLI..." -ForegroundColor Yellow

$ZipUrl = "https://github.com/protomaps/go-pmtiles/releases/download/v1.31.2/go-pmtiles_1.31.2_Windows_x86_64.zip"
$ZipPath = Join-Path $TmpDir "pmtiles.zip"

try {
    Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -ErrorAction Stop
    Expand-Archive -Path $ZipPath -DestinationPath $TmpDir -Force
    $PmtilesCli = Join-Path $TmpDir "pmtiles.exe"
    
    # Source URLs (tested: source.coop is the most stable CDN for OSM planet)
    $SourceUrls = @(
        "https://data.source.coop/protomaps/openstreetmap/planet/planet.pmtiles",
        ("https://build.protomaps.com/" + (Get-Date -Format "yyyyMMdd") + ".pmtiles")
    )
    
    Write-Host "🗺️  Extracting Bangladesh tiles (bbox: 88,20.5,93,26.8)..." -ForegroundColor Yellow
    Write-Host "   (This may take 5-10 minutes — downloading ~200-400 MB)"
    
    $Success = $false
    foreach ($SourceUrl in $SourceUrls) {
        Write-Host "   Trying: $SourceUrl"            & $PmtilesCli extract $SourceUrl $Output --bbox=88,20.5,93,26.8 2>&1
        if ($LASTEXITCODE -eq 0 -and (Test-Path $Output) -and ((Get-Item $Output).Length -gt 1MB)) {
            $Success = $true
            break
        }
        Write-Host "   ⚠ Failed, trying next source..." -ForegroundColor Yellow
    }
    
    if (-not $Success) {
        Write-Host "❌ All download sources failed." -ForegroundColor Red
        Write-Host "   Try downloading tiles manually:" -ForegroundColor Yellow
        Write-Host "   1. Go to https://maps.protomaps.com" -ForegroundColor Yellow
        Write-Host "   2. Select Bangladesh region" -ForegroundColor Yellow
        Write-Host "   3. Place bangladesh.pmtiles in client/public/tiles/" -ForegroundColor Yellow
        exit 1
    }
    
    $Size = (Get-Item $Output).Length / 1MB
    Write-Host ""
    Write-Host "✅ Success! Tiles saved to: $Output ($([math]::Round($Size, 1)) MB)" -ForegroundColor Green
    Write-Host "   Start the server and the map will work offline."
}
catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    Write-Host "   Try downloading the pmtiles CLI manually from:" -ForegroundColor Yellow
    Write-Host "   https://github.com/protomaps/go-pmtiles/releases"
    exit 1
}
finally {
    # Cleanup temp files
    Remove-Item -Path $TmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
