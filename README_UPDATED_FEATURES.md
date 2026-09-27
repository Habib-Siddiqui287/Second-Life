# Second Life - Updated Project

## Run
Backend:
1. Activate your Python virtual environment.
2. `pip install -r requirements.txt`
3. `python manage.py migrate`
4. `python manage.py runserver`

Frontend (second terminal):
1. `npm install`
2. `npm run dev`

## Email
Transactional email uses the same Gmail sender configured for Second Life:
`Givesthingsasecondlife@gmail.com`

Set these environment variables before starting Django:
- `EMAIL_HOST_USER=Givesthingsasecondlife@gmail.com`
- `EMAIL_HOST_PASSWORD=<Gmail App Password>`
- `DEFAULT_FROM_EMAIL=Givesthingsasecondlife@gmail.com`
- `FRONTEND_URL=http://localhost:5173`

`.env.example` is included. The Gmail password must be an App Password; do not commit it to source control.

## Local development admin
Email: `admin@secondlife.eco`
Password: `Admin@12345`

Change this password before production deployment.

## Included changes
- Real database/API donation data; no synthetic receiver donation cards.
- Donor donation edit/delete controls and pickup date/time editing.
- Weight conversion to kilograms (for example 3.4 lb = 1.542 kg).
- Donor pickup live-location capture using browser geolocation and Google Maps links.
- Donor/receiver connection location sharing with automatic refresh.
- Post-completion feedback for both donor and receiver with email notification.
- Donor/receiver live dashboard data refresh.
- Chatbot only on donor and receiver dashboard routes.
- Login demo accounts removed.
- Organization registration website field removed.
- Landing-page cookie consent only.
- Admin dashboard metrics are database-backed rather than synthetic sample values.
- Profile images are returned as absolute media URLs.
