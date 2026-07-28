@echo off
title Mukto Mesh
echo ============================================
echo   Mukto Mesh — one-click start
echo ============================================
echo.

REM Install root dependencies
echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install root deps!
    pause
    exit /b 1
)

cd server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install server deps!
    pause
    exit /b 1
)
cd ..

cd client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install client deps!
    pause
    exit /b 1
)
cd ..

REM Download offline map tiles if missing
set TILES_FILE=client\public\tiles\bangladesh.pmtiles
if not exist "%TILES_FILE%" (
    echo [2/4] Map tiles not found — downloading (540 MB)...
    echo  This may take a few minutes.
    if exist "scripts\download-tiles.ps1" (
        powershell -ExecutionPolicy Bypass -File "scripts\download-tiles.ps1"
    ) else if exist "scripts\download-tiles.sh" (
        echo  Download script not available on Windows. Run manually:
        echo  wget https://data.source.coop/protomaps/openstreetmap/planet/planet.pmtiles
        echo  -o client/public/tiles/bangladesh.pmtiles
    )
    if %errorlevel% neq 0 (
        echo.
        echo  ⚠ Warning: Tile download failed. The map will show a blank background
        echo    but all other features (chat, posts, check-in, etc.) will work fine.
        echo.
    ) else (
        echo  ✅ Map tiles downloaded successfully.
    )
) else (
    echo [2/4] Map tiles found — skipping download.
)

echo.
echo [3/4] Preparing environment...
echo.

REM Start both server + client in dev mode
echo [4/4] Launching servers...
echo.
echo  Server : http://localhost:3000
echo  Client : http://localhost:5173
echo.
echo  Share http://[YOUR-LAN-IP]:3000 on the same WiFi
echo  Press Ctrl+C to stop both.
echo ============================================

call npm run dev
