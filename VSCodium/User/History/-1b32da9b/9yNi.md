J# Dental Clinic Booking System

A **multi-tenant, white-label SaaS** booking platform for dental clinics: one
backend and one static frontend serve any number of clinics, each on its own
domain with its own name, logo, brand colors, photo gallery and fully isolated
data. Patients register, browse departments and doctors, and book an open time
slot in a few clicks; each clinic's staff manage their own doctors, schedules,
and appointments from an admin panel. Bilingual throughout (Turkish + Arabic).

```
backend/    FastAPI REST API (Python) — auth, scheduling logic, database
frontend/   Static HTML/CSS/JS site that talks to the API
```

The two are fully independent: the backend has no idea an HTML frontend
exists, it just serves JSON. That's deliberate — it means a future mobile
app can be built against the exact same API with zero backend changes.

## Run it in 5 minutes

**1. Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py            # creates admin login + sample departments/doctors
uvicorn app.main:app --reload
```
API now running at `http://localhost:8000` (interactive docs at `/docs`).

**2. Frontend** (in a second terminal)
```bash
cd frontend
python3 -m http.server 5500
```
Open `http://localhost:5500` in your browser. (VS Code's "Live Server"
extension works just as well — that's what the CORS defaults are tuned for.)

**3. Log in**
- Admin panel (`admin.html`): `admin@clinic.com` / `Admin123!` — change this password after logging in.
- Or register a normal patient account from the site itself and book an appointment end to end.

**4. (Optional) Add more clinics**
```bash
cd backend
python create_tenant.py --slug clinica --domain clinica.localhost \
    --name-tr "A Diş Kliniği" --name-ar "عيادة أ" \
    --admin-email admin@clinica.com --admin-password "ChangeMe123!" \
    --primary-color "#1D4ED8" --secondary-color "#F59E0B"
```
Then open `http://clinica.localhost:5500` — the same frontend now shows that
clinic's name, colors and data. (`*.localhost` resolves to 127.0.0.1 on most
systems; add an `/etc/hosts` entry if it doesn't on yours.) In production,
point each clinic's real domain at the same deployment instead.

Full details, architecture notes, and customization guide are in
`backend/README.md` and `frontend/README.md`.

## What's included

- **Multi-tenancy & white-labeling**: a single shared database with a
  `tenant_id` on every clinic-owned table; the frontend calls
  `GET /api/v1/tenant/config` on load (resolved from the request's domain) and
  injects that clinic's name, logo, hex brand colors (as CSS variables) and
  gallery — one static codebase, every clinic looks like its own site.
- **Patient side**: registration/login, browse departments → doctors, a
  4-step booking wizard with a live calendar of real availability, and an
  account page to view/cancel appointments.
- **Landing-page gallery**: a responsive, RTL-aware photo carousel (facility,
  equipment, staff) managed per clinic from the admin Settings tab; hidden
  automatically for clinics with no photos.
- **Availability engine**: each doctor has weekly working hours and optional
  time-off days; available slots are computed from those minus existing
  bookings minus anything already in the past. Double-booking is prevented
  at both the application layer (friendly error) and the database layer (a
  partial unique constraint), so it holds up even under a race condition.
- **Admin side**: dashboard stats, a searchable/filterable appointments table
  (who booked what, with which doctor — the "من حجز" requirement), full
  doctor/department CRUD with photo upload and a weekly-schedule editor, and
  a clinic-branding settings page (name, logo, contact info) so this project
  can be re-skinned into a different clinic without editing any code.
- **Bilingual (TR/AR)** throughout, including automatic RTL layout switching,
  with every user-facing string centralized in two JSON files.
- **External integrations**: an admin-managed API key system so a WhatsApp or
  Telegram bot (or an AI agent, or any other outside system) can check
  availability and book appointments on behalf of patients over plain HTTP —
  generate/revoke keys from the admin panel's Integrations tab. See
  `backend/README.md` for example requests.
- **Design**: a distinct "jade + coral" visual identity (see
  `frontend/assets/css/variables.css`) with a hand-drawn signature "smile"
  arc animation on the homepage, plus restrained hover/scroll/loading motion
  — not the same look as any reference site, but the same *kind* of clean,
  card-based, modern-light clinic feel.

## A few assumptions worth knowing about

- **Database**: SQLite by default (zero setup). Swappable to PostgreSQL by
  changing one line in `backend/.env` — see `backend/README.md`.
- **Images**: uploaded to a public Cloudflare R2 bucket when the `R2_*` values
  in `backend/.env` are set (the full public URL is stored in the database);
  without them, uploads fall back to local disk — dev works with zero cloud
  setup.
- **Auth**: JWT access tokens (7-day expiry by default), no refresh-token
  flow — simple on purpose for this scope.
- **No email/SMS reminders** are actually sent — the data model supports
  adding that later, but no notification service is wired up.
- Doctors are managed *by* the admin and don't have their own login.

None of these are hard limits — they're the reasonable defaults for a
single-clinic system of this size, and the README in each folder explains
exactly where to extend each one.
