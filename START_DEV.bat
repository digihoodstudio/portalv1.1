@echo off
setlocal enabledelayedexpansion
title Bhumi Didi Web - Dev Server Manager

echo.
echo ===================================================
echo   Bhumi Didi Web - One-Click Dev Launcher
echo ===================================================
echo.

:: ─── 1. Check Node.js ───────────────────────────────
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js %NODE_VER% detected.

:: ─── 2. Fix PowerShell Execution Policy ─────────────
echo [1/5] Fixing PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force" >nul 2>&1
echo [OK] PowerShell execution policy set to RemoteSigned.

:: ─── 3. Free Ports 3001 and 4000 ────────────────────
echo [2/5] Freeing ports 3001 and 4000...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3001 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":4000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Ports cleared.

:: ─── 4. Install missing dependencies ────────────────
echo [3/5] Checking dependencies...
if not exist "node_modules\concurrently" (
    echo Installing root dependencies...
    call npm install --legacy-peer-deps
)
if not exist "frontend\node_modules\next" (
    echo Installing frontend dependencies...
    call npm --workspace frontend install --legacy-peer-deps
)
if not exist "backend\node_modules\express" (
    echo Installing backend dependencies...
    call npm --workspace backend install --legacy-peer-deps
)
if not exist "node_modules\ts-node-dev" (
    echo Installing ts-node-dev globally in root...
    call npm install ts-node-dev --save-dev --legacy-peer-deps
)
echo [OK] All dependencies ready.

:: ─── 5. Launch Backend Server (Port 4000) ───────────
echo [4/5] Launching Backend API Server on port 4000...
start "Backend API - Port 4000" cmd /k "title Backend API Port 4000 && color 0A && echo. && echo  [BACKEND] Starting API server on port 4000... && echo. && npm run dev:server && echo. && echo [STOPPED] Backend server stopped. Press any key. && pause"

:: ─── 6. Wait for backend to be ready ────────────────
echo Waiting for backend to start...
:waitloop
timeout /t 2 /nobreak >nul
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:4000/health' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% neq 0 goto waitloop
echo [OK] Backend is online at http://localhost:4000

:: ─── 7. Launch Frontend (Port 3001) ─────────────────
echo [5/5] Launching Frontend on port 3001...
start "Frontend App - Port 3001" cmd /k "title Frontend App Port 3001 && color 09 && echo. && echo  [FRONTEND] Starting Next.js app on port 3001... && echo. && npm run dev:app && echo. && echo [STOPPED] Frontend server stopped. Press any key. && pause"

:: ─── 8. Wait briefly then open browser ──────────────
echo.
echo Waiting for frontend to compile (this takes ~20 seconds first time)...
timeout /t 8 /nobreak >nul

echo.
echo ===================================================
echo   SUCCESS! Both servers are running.
echo   Frontend:  http://localhost:3001
echo   Backend:   http://localhost:4000
echo   Health:    http://localhost:4000/health
echo ===================================================
echo.
echo Opening application in your browser...
start "" "http://localhost:3001"

echo.
echo Both server windows are open in separate terminals.
echo Close those windows to stop the servers.
echo.
pause
