@echo off
echo ========================================================
echo Starting SecondLife Backend (Django REST Framework)
echo API: http://127.0.0.1:8000/api/
echo Django Admin: http://127.0.0.1:8000/django-admin/
echo ========================================================
cd /d "%~dp0"
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
pause
