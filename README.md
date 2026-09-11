# SecondLife - "Give Things a Second Life"
> A Real-World Full-Stack Circular Economy Donation & Resource-Sharing Platform

SecondLife is a complete full-stack web application connecting **Donors** (individuals and organizations) with **Receivers** (individuals, verified charities, community shelters, and schools) to give pre-loved items a meaningful second life, divert waste from landfills, and reduce carbon emissions.

---

## 🌟 Core Architecture & Technology Stack

### Backend
- **Framework**: Python 3.11+ / Django 5.x & Django REST Framework (DRF)
- **Authentication**: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
- **Database**: PostgreSQL with automatic fallback to SQLite (`db.sqlite3`) for zero-setup local running
- **Modular Apps**:
  - `accounts`: Custom User model, Profile, registration wizards, role management (`DONOR`, `RECEIVER`, `ADMIN`), auth endpoints.
  - `organizations`: Verified NGO/Charity management, registration certificates, audit logging.
  - `donations`: Categories, Donations (with condition tags, photos, drop-off/pickup options), item saves.
  - `item_requests`: Donation requests, urgency levels, reason statements, status transitions.
  - `connections`: Handover connections, unique tracking codes, courier info, delivery milestones.
  - `notifications`: Real-time user event notifications and mark-as-read tracking.
  - `dashboard`: Statistics & aggregations for Public, Donor, Receiver, and Admin portals; audit logging; contact inquiries; system platform settings.
  - `chatbot`: Embedded Q&A assistant for user guidance, eco tips, and navigation support.
- **Service Layer**:
  - `matching_service.py`: Rule-based compatibility scoring (category, location, tags, urgency).
  - `connection_service.py`: Atomic request approvals and delivery tracking generation.
  - `verification_service.py`: Organization review workflows and status logging.

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS with custom theme:
  - SecondLife Green: `#15803D` (primary), `#0F5D28` (dark), `#22C55E` (light)
  - Surface & Background: `#F0F7FB` (cool slate background), `#FFFFFF` (clean cards)
  - Typography: Plus Jakarta Sans
  - Rounded Design: `rounded-3xl` cards and `shadow-soft` aesthetics
- **Icons**: Lucide React
- **Data Visualizations**: Recharts (Monthly Trends, User Growth, Category Distributions)
- **Animations & Effects**: Framer Motion, Canvas Confetti
- **Asset Compliance**: **Strict ZERO photographs of real people rule**. All profile avatars use initials / SVG badges; eco illustrations and item graphics only.

---

## 🚀 Quick Start Guide

### 1. Start the Backend
Double-click `run_backend.bat` or run in terminal:
```bash
cd backend
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```
- API Base: `http://127.0.0.1:8000/api/`
- Django Admin: `http://127.0.0.1:8000/django-admin/`

### 2. Start the Frontend
Double-click `run_frontend.bat` or run in terminal:
```bash
cd frontend
npm run dev
```
- Frontend Web App: `http://localhost:5173/`

### 3. (Optional) Re-seed Demo Data
Double-click `seed_database.bat` or run:
```bash
cd backend
python manage.py seed_data
```

---

## 👥 Demo User Accounts (All Password: `password123`)

| Role | Email | Name | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@secondlife.eco` | Platform Admin | Full system oversight, verification queue, metrics, inquiries |
| **Donor** | `mamoon@secondlife.eco` | Mamoon Ashraf | Individual donor with active listings, requests, and impact stats |
| **Donor** | `greenfuture@secondlife.eco` | Green Future Org | Verified organization donor |
| **Receiver** | `alex.rivera@secondlife.eco` | Alex Rivera | Individual receiver with pending requests & delivery trackings |
| **Receiver** | `hoperefuge@secondlife.eco` | Hope Community Shelter | Verified charity receiver |
| **Pending Org** | `brightminds@secondlife.eco` | Bright Minds Foundation | Awaiting admin verification in audit queue |

---

## 📋 Comprehensive Feature Map

### 🌐 Public Portal
- **Home**: Hero banner with circular economy imagery, dynamic platform impact counter, recent donations carousel, categories grid, how-it-works workflow, user testimonials, call-to-action.
- **Browse & Search**: Full filterable donation catalog (category, condition, location, availability).
- **Donation Detail**: High-res image showcase, specifications, donor badge, pickup details, second-life journey.
- **How It Works**: 5-step circular lifecycle (Donate → Match → Connect → Deliver → Second Life).
- **Categories**: Visual category explorer with active counts and direct filtering links.
- **About**: Mission statement, circular economy philosophy, environmental impact statistics.
- **Contact & Support**: Public contact form with immediate notification and admin inbox integration.
- **AI Chatbot**: Embedded assistant answering platform FAQs, donation guidelines, and eco tips.

### 🎁 Donor Portal
- **Donor Dashboard**: Overview cards (Active Donations, Matched Items, Completed Handovers, People Helped, CO2 Diverted), recent listings, pending requests.
- **Create Donation Wizard**: 4-step wizard (Basic Info, Condition & Dimensions, Media Upload, Pickup/Dropoff Logistics) with live preview and celebratory confetti.
- **My Donations**: Tabbed management (All, Available, Matched, Completed) with search and status actions.
- **Pickup Requests**: Review incoming receiver requests, view receiver profiles, approve or decline with custom messages.
- **Scheduled Handovers**: Interactive timeline for active deliveries with status progression and tracking codes.
- **Donor Impact**: Environmental certificates, CO2 diversion milestones, trees saved equivalent, shareable badges.
- **Notifications & Settings**: Account settings, profile details, notification preferences.

### 🤲 Receiver Portal
- **Receiver Dashboard**: Active requests, items received, ready for pickup alerts, personalized recommendations.
- **Browse Donations**: Live search, category badges, condition tags, location filters, save item bookmarks.
- **Request Item Flow**: Submit request with intended purpose statement, urgency level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and delivery preference.
- **My Requests**: Status tracking (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`).
- **Pickups & Deliveries**: Step-by-step progress tracker (`SCHEDULED` → `IN_TRANSIT` → `DELIVERED` → `COMPLETED`).
- **Saved Items**: Bookmark and manage pre-loved items of interest.
- **Receiver Impact**: Community circular metrics, certificate downloads, savings summaries.

### 🛡️ Admin Portal
- **Overview Dashboard**: High-level platform KPIs, Recharts graphs (6-month donations over time, user growth, category distribution), real-time activity log.
- **Verification Queue**: Audit queue for reviewing organization certificates, tax IDs, with one-click Approve / Reject and audit notes.
- **User Management**: Filterable tables of Donors and Receivers with account suspension/activation controls.
- **Organization Directory**: Directory of non-profits, registration numbers, verification badges, contact links.
- **Donations Oversight**: Oversight of all platform listings with moderation controls.
- **Requests & Connections**: Full audit trail of connections and deliveries.
- **Reports & Analytics**: Time-filtered impact statistics (30d, 90d, 1y, all-time) with CO2 and category breakdowns.
- **Contact Inquiries**: Review and resolve incoming public contact submissions, email replies, and admin notes.
- **Platform Settings**: Algorithmic matching threshold slider (40%-95%), mandatory verification toggles, max request limits, maintenance mode, environmental formula coefficients.

---

## 🧪 Automated Testing
Run the backend test suite:
```bash
cd backend
python manage.py test
```
Result:
```text
Ran 7 tests in 7.108s - OK
```

Run the frontend production build:
```bash
cd frontend
npm run build
```
Result:
```text
✓ built in 6.58s - 0 errors
```
