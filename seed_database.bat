@echo off
echo ========================================================
echo Seeding SecondLife Database with Demo Data
echo ========================================================
cd backend
python manage.py seed_data
pause
