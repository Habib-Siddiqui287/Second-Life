# Second Life — local verification checklist

The project root contains both Django and React/Vite. Do not `cd backend` or `cd frontend`.

## 1. Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py check
python manage.py runserver 127.0.0.1:8000
```

## 2. Frontend (new terminal)

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` and `/media` to Django at `http://127.0.0.1:8000`.

## 3. Production-build check

```powershell
npm run build
```

## 4. Important tests for this pass

- Guest: home page, default donation images, `Sign in to view`.
- Donor: login, profile image, create donation, donation image, refresh, edit/delete.
- Receiver A/B: both see the same available donor donation.
- Receiver: browse, detail, correct image, search/filter, profile image, refresh/login persistence.
- Receiver settings: allow browser location and save latitude/longitude; donation cards can then show backend-calculated miles when pickup coordinates exist.
- Chatbot: greetings, platform questions, donor/receiver/donation/category counts, available donation names.
- Password reset: verify the email uses the configured `FRONTEND_URL`.
- Logout: dashboard should not be restorable through browser Back.

## 5. Email

Set these only on the backend: `BREVO_API_KEY`, `EMAIL_FROM_EMAIL`, `EMAIL_FROM_NAME`.

## 6. Production media

For persistent uploaded images on Render or another stateless service, configure the S3-compatible variables in `.env.example`. Without persistent object storage, server-local uploaded media can be lost when the service is replaced.
