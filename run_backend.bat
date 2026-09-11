@echo off
echo ========================================================
echo Starting SecondLife Backend (Django REST Framework)
echo API will be accessible at: http://127.0.0.1:8000/api/
echo Django Admin accessible at: http://127.0.0.1:8000/django-admin/
echo ========================================================
cd backend
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
pause
