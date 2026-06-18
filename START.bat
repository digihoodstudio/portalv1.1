@echo off
setlocal enabledelayedexpansion
title Bhumi Didi Web - Auto Start
color 0A

echo.
echo ============================================
echo   Bhumi Didi Web - One-Click Auto Launch
echo ============================================
echo.

:: ─── Check Node.js ───────────────────────────
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js %NODE_VER% detected

:: ─── Check if XAMPP MySQL is running ─────────
echo [INFO] Checking if XAMPP MySQL (port 3306) is running...
powershell -Command "try { $tcp = New-Object System.Net.Sockets.TcpClient; $tcp.Connect('127.0.0.1', 3306); $tcp.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] MySQL on port 3306 is NOT running.
    echo Please start XAMPP and ensure MySQL is running, then press any key...
    pause
) else (
    echo [OK] MySQL is running on port 3306
)

:: ─── Create database if it doesn't exist ─────
echo [INFO] Ensuring database 'bhumi_didi_web' exists...
powershell -Command "try { $c = New-Object MySql.Data.MySqlClient.MySqlConnection } catch { }" >nul 2>&1
mysql -u root -e "CREATE DATABASE IF NOT EXISTS bhumi_didi_web;" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Database ready
) else (
    echo [INFO] Could not auto-create DB - it may already exist or mysql CLI not in PATH
    echo [INFO] Make sure database 'bhumi_didi_web' exists in phpMyAdmin
)

:: ─── Free Port 3001 ──────────────────────────
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3001 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
:: ─── Free Port 4000 ──────────────────────────
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":4000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Ports 3001 and 4000 cleared

:: ─── Install deps if missing ─────────────────
if not exist "node_modules\concurrently" (
    echo [INFO] Installing root dependencies...
    call npm install --legacy-peer-deps
)
if not exist "frontend\node_modules\next" (
    echo [INFO] Installing frontend dependencies...
    call npm --workspace frontend install --legacy-peer-deps
)
if not exist "backend\node_modules\express" (
    echo [INFO] Installing backend dependencies...
    call npm --workspace backend install --legacy-peer-deps
)
echo [OK] All dependencies ready

:: ─── Run Prisma migrations ───────────────────
echo [INFO] Running database migrations...
cd backend
call npx prisma migrate deploy >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call npx prisma db push --accept-data-loss >nul 2>&1
    echo [INFO] Database schema pushed
) else (
    echo [OK] Database migrations applied
)
cd ..

:: ─── Start Backend Server ────────────────────
echo [1/2] Starting Backend API server on port 4000...
start "Backend API" cmd /k "title Backend API | Port 4000 && color 0B && cd /d "%~dp0" && npm run dev:server"

:: ─── Wait for backend to be ready ────────────
echo [INFO] Waiting for backend API to start...
:wait_backend
timeout /t 2 /nobreak >nul
powershell -Command "try { Invoke-WebRequest -Uri 'http://127.0.0.1:4000/health' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% neq 0 goto wait_backend
echo [OK] Backend is online at http://localhost:4000

:: ─── Start Frontend Server ───────────────────
echo [2/2] Starting Frontend on port 3001...
start "Frontend App" cmd /k "title Frontend App | Port 3001 && color 09 && cd /d "%~dp0" && npm run dev:app"

:: ─── Wait for frontend to be ready ──────────
echo [INFO] Waiting for frontend to compile (this may take ~20 seconds)...
:wait_frontend
timeout /t 3 /nobreak >nul
powershell -Command "try { Invoke-WebRequest -Uri 'http://127.0.0.1:3001' -UseBasicParsing -TimeoutSec 3 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% neq 0 goto wait_frontend

:: ─── Open Browser ────────────────────────────
echo.
echo ============================================
echo   SUCCESS! All servers are ONLINE.
echo   Frontend : http://localhost:3001
echo   Backend  : http://localhost:4000
echo   Health   : http://localhost:4000/health
echo ============================================
echo.
echo Opening app in your browser...
start "" "http://localhost:3001"
echo.
echo [NOTE] Both servers are running in their own windows.
echo [NOTE] Close those windows to stop the servers.
echo.
timeout /t 5 /nobreak >nul
exit
