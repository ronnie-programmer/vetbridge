# VetBridge

VetBridge helps transitioning service members and veterans track VA benefit claims from
research through decision, and keep the appointments attached to each claim in one place.
The paperwork for separation arrives as a stack of disconnected forms and phone numbers —
this turns it into a status board you actually own.

Built as my Code Platoon capstone. I am separating from the Air Force in October 2026, and
this is the tool I wanted when I started my own claims.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Django 6.1, Django REST Framework 3.18 |
| Auth | Simple JWT 5.5 (access + refresh, blacklist on logout) |
| Database | PostgreSQL 17 |
| Frontend | React 19, Vite, React Router, Axios |
| Infra | Docker Compose, Gunicorn, Nginx |
| CI | GitHub Actions — backend tests + frontend build |

## Features

- **Claim tracking** — create a benefit claim, move it through five states
  (`researching` → `applied` → `in_review` → `approved` / `denied`), attach notes and an
  application date.
- **Appointments per claim** — schedule C&P exams and VSO meetings against a specific
  claim, with facility name and address.
- **VA facility lookup** — search for nearby VA facilities and copy the name and address
  straight onto an appointment.
- **Federal holiday check** — the API exposes US federal holidays so you don't schedule an
  appointment on a day the VA is closed.
- **Email-confirmed registration** — accounts are created inactive and a UUID token is
  emailed; unconfirmed users cannot log in.
- **Per-user data isolation** — every claim and appointment query is scoped to the
  requesting user. You cannot read, modify, or delete another user's records, and you
  cannot attach an appointment to a claim you don't own.

## Tests

The backend has a 12-test suite covering the authorization boundaries, run on every push
and pull request by GitHub Actions against a real PostgreSQL 17 service container.

```bash
cd backend && python manage.py test
```

The suite is deliberately weighted toward things that should fail. Alongside the happy
paths it asserts that:

- anonymous requests to `/api/claims/` are rejected with 401
- a user listing claims cannot see another user's claims
- a user deleting another user's claim gets 404, and the record still exists afterward
- attaching an appointment to someone else's claim is rejected with 400
- registering with an already-used email is rejected
- an unconfirmed user cannot log in
- an invalid confirmation token returns 404

## Local setup

Requires Python 3.12+, Node 22+, and PostgreSQL 17.

```bash
git clone https://github.com/ronnie-programmer/vetbridge.git
cd vetbridge
cp .env.example .env          # fill in POSTGRES_* and DJANGO_SECRET_KEY
```

**Backend** — API on `:8000`

```bash
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
venv/bin/python manage.py migrate
venv/bin/python manage.py runserver
```

**Frontend** — site on `:5173`

```bash
cd frontend
npm install
npm run dev
```

Email is written to the backend console rather than sent. After registering, copy the
confirmation link out of that terminal to activate the account.

### Docker

```bash
docker compose up --build
```

Brings up PostgreSQL, Gunicorn, and the built frontend behind Nginx.

## Architecture

Two Django apps behind a single DRF router, with a React SPA talking to it over JWT.

```
accounts/     registration, email confirmation, login, refresh, logout
tracker/      claims, appointments, federal holidays
```

### Schema

```
User (django.contrib.auth)
 ├── ConfirmationToken  (1:1)   uuid token, deleted once redeemed
 └── Claim              (1:N)   benefit_name, status, date_applied, notes, created_at
      └── Appointment   (1:N)   title, scheduled_for, facility_name, facility_address, notes
```

Ownership lives only on `Claim`. `Appointment` reaches the user through its claim, so
permission checks traverse the foreign key rather than duplicating a `user` column — one
place to get authorization right instead of two.

### API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register/` | Create inactive account, email a confirmation token |
| POST | `/api/auth/confirm/{uuid}/` | Activate the account |
| POST | `/api/auth/login/` | Obtain access + refresh tokens |
| POST | `/api/auth/refresh/` | Refresh an access token |
| POST | `/api/auth/logout/` | Blacklist a refresh token |
| GET, POST | `/api/claims/` | List or create your claims |
| GET, PATCH, DELETE | `/api/claims/{id}/` | Retrieve, update, or delete one claim |
| GET, POST | `/api/appointments/` | List or create appointments |
| GET, PATCH, DELETE | `/api/appointments/{id}/` | Retrieve, update, or delete one appointment |
| GET | `/api/holidays/?year=YYYY` | US federal holidays for scheduling |

Claims are returned with their appointments nested.

## Known limitations

- **No deployment.** This runs locally or under Docker Compose; there is no hosted
  instance.
- **No frontend tests.** Coverage is backend-only. Component tests are the next thing I
  want to add.
- **Facility search is client-side.** It calls OpenStreetMap's Nominatim directly from the
  browser and filters by name, so results are approximate rather than an authoritative VA
  facility list. Moving this to the backend and switching to the official VA Facilities API
  would fix both the accuracy and the rate limiting.
- **Holiday data is a third-party proxy.** `/api/holidays/` forwards to `date.nager.at`
  with no caching, so it makes a network call per request and returns 502 when that service
  is unreachable.
- **Email is console-only.** No SMTP is configured, so confirmation links have to be read
  out of the server log.
- **Status transitions are unconstrained.** Any status can move to any other status; there
  is no state machine preventing a denied claim from going back to researching.
