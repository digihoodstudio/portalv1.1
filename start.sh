#!/bin/bash

echo ""
echo "===================================================="
echo "  Bhumi Didi Web - Startup Manager (Bash)"
echo "===================================================="
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js is installed."

# 2. Cleanup processes running on ports 3001 and 4000
echo "[1/5] Freeing ports 3001 and 4000..."
npx kill-port 3001 4000 2>/dev/null || true
echo "[OK] Ports cleared."

# 3. Check and install dependencies
echo "[2/5] Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Root dependencies missing. Installing..."
    npm install --legacy-peer-deps
fi
if [ ! -d "frontend/node_modules" ]; then
    echo "Frontend dependencies missing. Installing..."
    npm --workspace frontend install --legacy-peer-deps
fi
if [ ! -d "backend/node_modules" ]; then
    echo "Backend dependencies missing. Installing..."
    npm --workspace backend install --legacy-peer-deps
fi
echo "[OK] Dependencies ready."

# 4. Start Backend Server with Auto-Retry
echo "[3/5] Launching Backend Server on port 4000..."
backend_loop() {
    while true; do
        npm --workspace backend run dev
        echo "[CRASH] Backend exited unexpectedly. Restarting in 3 seconds..." >&2
        sleep 3
    done
}
backend_loop &
BACKEND_PID=$!

# 5. Wait for Backend Health Check
echo "[4/5] Waiting for Backend to be online..."
until curl -s http://localhost:4000/health | grep -q "ok"; do
    sleep 1
done
echo "[OK] Backend is online!"

# 6. Start Frontend Server
echo "[5/5] Launching Frontend Server on port 3001..."
npm --workspace frontend run dev &
FRONTEND_PID=$!

# 7. Open Launcher
echo ""
echo "===================================================="
echo "  SUCCESS: Starting Browser cockpit..."
echo "===================================================="
echo ""

if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
else
    start index.html 2>/dev/null || true
fi

echo "Both servers are running."
echo "Press Ctrl+C to stop both servers."
echo ""

# Handle clean shutdown on exit
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
