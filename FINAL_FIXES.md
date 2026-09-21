# SecondLife final fixes

This build includes:
- Exact donor-entered weight parsing (`kg`, `kgs`, `kilograms`, `lb`, `lbs`, `pounds`) and quantity-aware `total_weight_kg`.
- Donor and receiver lifetime weight totals based on completed connections.
- `/donor/connections/:id` and `/receiver/connections/:id` routes, so Track Handover opens a real tracking page instead of the public-home fallback.
- Embedded Google Maps for the donor's current location and an Open Google Maps action.
- Continuous browser GPS sharing while Live Location is enabled; receiver tracking refreshes automatically.
- Location emails are throttled to the initial share / once per 15 minutes instead of one email per GPS tick.
- Landing page live donation list and public stats refresh every 5 seconds.
- Landing category cards have no fake hard-coded item counts.
- Public animated counters show real Active Donations, Active Donors, Receivers Supported, and Communities Active values.
- Literal `SL` brand tiles in auth/footer areas replaced with the supplied SecondLife logo image.
- Admin charts use real database history and refresh every 5 seconds; fake percentage text removed.

## SMTP

Sender: `Givesthingsasecondlife@gmail.com`. The Gmail App Password is intentionally not stored in this project. Set it in the VS Code PowerShell terminal:

```powershell
$env:EMAIL_HOST_USER="Givesthingsasecondlife@gmail.com"
$env:EMAIL_HOST_PASSWORD="YOUR_GMAIL_APP_PASSWORD"
$env:DEFAULT_FROM_EMAIL="Givesthingsasecondlife@gmail.com"
```

Then from the `secondlife_project` folder:

```powershell
python manage.py migrate
python manage.py runserver
```

Second terminal:

```powershell
npm install
npm run dev
```

## Mobile + landing + admin final pass

- Donor, Receiver, and Admin portal sidebars are desktop-only at `md` and become a slide-out mobile drawer with a hamburger button below `768px`.
- Portal content uses full available mobile width and prevents the desktop sidebar from squeezing the page.
- Landing Popular Donations keeps four slots: newest real available donations occupy slots first, and remaining slots are filled one-by-one by four Pakistan-based frontend fallback items.
- Landing fallback cards use the JPEG item assets from `public/images/donations/` and clicking a fallback card goes directly to registration.
- Real landing donations open their full public donation details first; an unauthenticated visitor is sent to registration when they choose to request.
- Static `/images/...` donation URLs are resolved to the frontend host so demo JPEGs do not point at Django's backend `/images/` path.
- Footer support email is `givesthingsasecondlife@gmail.com`.
- Default admin seed credentials are now `admin@secondlife.eco` / `Admin@12345`.
- Vercel/production API fallback is aligned with the configured `second-life-v6st.onrender.com` backend.
