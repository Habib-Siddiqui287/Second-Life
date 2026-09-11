@echo off
title SecondLife Live Public Server Launcher
echo ======================================================================
echo          SECONDLIFE - "Give Things a Second Life"
echo             LIVE PUBLIC DEPLOYMENT LAUNCHER
echo ======================================================================
echo.
echo 1. Starting Backend Server on 127.0.0.1:8000...
start "SecondLife Backend" cmd /k "cd backend && python manage.py migrate && python manage.py runserver 127.0.0.1:8000"

echo 2. Starting Frontend Dev Server on 0.0.0.0:5173...
start "SecondLife Frontend" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0"

echo.
echo Waiting 5 seconds for local servers to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 3. Launching Public Tunnel...
echo.
echo ======================================================================
echo Note: If asked for a "Tunnel Password / Endpoint IP" in your browser:
echo Check your public IP or visit: https://loca.lt/mytunnelpassword
echo ======================================================================
echo.

node tunnel_service.js
pause
