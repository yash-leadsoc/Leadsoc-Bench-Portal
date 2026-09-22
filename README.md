# LeadSoc TEDP — React Web App (Vite + TypeScript)

Full React port of the LeadSoc Talent Enablement & Deployment Platform frontend.
Same functionality as before, wired to the same FastAPI backend.

## Stack
- Vite + React 18 + TypeScript
- react-router-dom (routing), framer-motion (animations), recharts (charts)
- Plain-CSS design system (src/theme.css) — clean enterprise SaaS look

## Run

```bash
npm install
# point at your backend (default http://127.0.0.1:8000)
echo "VITE_API_BASE=http://127.0.0.1:8000" > .env
npm run dev        # http://localhost:5173
```

Backend must be running and reachable, with CORS allowing the web origin, and
`python-multipart` installed (for file uploads). The new backend routes used here:
`/dashboard/kpis` and `/files/upload` + `/files/{name}`.

## Build

```bash
npm run build      # outputs dist/  (static files — host anywhere)
npm run preview    # serve the production build locally
```

## What's inside
- **Auth**: login, forced password change, token persisted in localStorage.
- **Management (admin / BU head / TA)**: Dashboard (KPIs + bench-aging/skill bars,
  status & readiness donuts, BU distribution), Bench Employees (+ full detail drawer),
  Materials (upload/download), Training Plans (multi-assign, hours/days/weeks),
  Assessments (builder + multi-assign + results), Training Progress (daily logs),
  Interview Prep (materials + question-bank document upload), Interviews
  (panels/mocks/schedule/availability), Readiness, People, Reports (CSV + print/PDF),
  Administration (BUs, users, roles, integrations, readiness weights, audit),
  Knowledge Library, Notifications, Profile.
- **Employee**: My Dashboard (KPI strip + completion + AI summary), My Training
  (open material + log daily progress), My Assessments (start/re-attempt + result review),
  My Interview Prep (downloads), My Interviews, My Availability (tap-to-mark calendar),
  My Profile (single-source-of-truth master editor with live completion %, skills,
  certifications, resume upload), Knowledge Library, Notifications.

## Notes
- File upload/download uses the backend's generic `/files/*` routes; a pasted URL also works.
- Reports download as CSV (client + server export) and can be printed to PDF via the browser.
- Charts are recharts (bar + donut). Add more datasets to the KPI endpoint to extend them.
