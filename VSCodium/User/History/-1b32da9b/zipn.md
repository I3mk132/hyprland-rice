# Dental Clinic Booking System

A complete, ready-to-customize booking platform for a dental clinic: patients
register, browse departments and doctors, and book an open time slot in a
few clicks; staff manage doctors, schedules, and appointments from an admin
panel. Built to work as a **template** — swap in a real clinic's name, logo,
departments, and doctors without touching code — and in Turkish + Arabic.

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
python3 -m venv .venv && source venv/bin/activate   # Windows: venv\Scripts\activate
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

Full details, architecture notes, and customization guide are in
`backend/README.md` and `frontend/README.md`.

## What's included

- **Patient side**: registration/login, browse departments → doctors, a
  4-step booking wizard with a live calendar of real availability, and an
  account page to view/cancel appointments.
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
- **Design**: a distinct "jade + coral" visual identity (see
  `frontend/assets/css/variables.css`) with a hand-drawn signature "smile"
  arc animation on the homepage, plus restrained hover/scroll/loading motion
  — not the same look as any reference site, but the same *kind* of clean,
  card-based, modern-light clinic feel.

## A few assumptions worth knowing about

- **Database**: SQLite by default (zero setup). Swappable to PostgreSQL by
  changing one line in `backend/.env` — see `backend/README.md`.
- **Auth**: JWT access tokens (7-day expiry by default), no refresh-token
  flow — simple on purpose for this scope.
- **No email/SMS reminders** are actually sent — the data model supports
  adding that later, but no notification service is wired up.
- Doctors are managed *by* the admin and don't have their own login.

None of these are hard limits — they're the reasonable defaults for a
single-clinic system of this size, and the README in each folder explains
exactly where to extend each one.
