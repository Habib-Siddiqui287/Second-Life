@echo off
echo ========================================================
echo Starting SecondLife local backend + frontend
echo ========================================================
cd /d "%~dp0"
start "SecondLife Backend" cmd /k "python manage.py migrate && python manage.py runserver 127.0.0.1:8000"
timeout /t 3 /nobreak >nul
start "SecondLife Frontend" cmd /k "npm run dev -- --host 0.0.0.0"
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
