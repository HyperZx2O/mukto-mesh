@echo off
title Mukto Mesh
cd /d "%~dp0"

echo ============================================
echo   Mukto Mesh - one-click start
echo ============================================
echo.

REM Ensure root .env exists
if not exist ".env" (
    echo [PRE] Creating .env from server/.env ...
    copy server\.env .env >nul
)

REM Install all dependencies
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

echo.
echo  Map uses OpenFreeMap (online vector tiles). No download needed.
echo [3/4] Preparing environment...
if not exist ".env" (
    copy server\.env .env >nul
    echo .env created.
) else (
    echo .env found.
)

REM Start both server and client concurrently
echo [4/4] Launching servers...
echo.
echo  Open http://localhost:5173 in your browser
echo  Admin password: admin
echo.
echo  Press Ctrl+C to stop both.
echo ============================================

call npm run dev
