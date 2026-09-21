@echo off
echo ========================================================
echo Seeding SecondLife demo data
echo ========================================================
cd /d "%~dp0"
python manage.py seed_data
pause
