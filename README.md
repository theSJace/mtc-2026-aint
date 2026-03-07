# Skim Pintar — Masjid Ar-Raudhah Digital Onboarding
**Mosque Tech Challenge 2026 · Team Ar-Raudhah Innovators**

---

## Architecture

```
mtc-2026-aint/
├── frontend/          ← React + Vite + TypeScript + Tailwind v4
├── backend/           ← Python FastAPI
└── convex/            ← Convex DB schema + mutations + queries
```

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4 |
| Backend | Python FastAPI, Pydantic v2, PyJWT, bcrypt |
| Database | Convex DB (schema + mutations + queries provided) |
| Auth | JWT Bearer tokens, SingPass/MyInfo mock integration |
| i18n | English + Bahasa Melayu (built-in, no extra library) |

---

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env        # Edit JWT_SECRET and MOSQUE_PAYNOW_UEN
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Convex (Database)

```bash
# From project root
npm install
npx convex dev              # Deploys schema + functions, generates types
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8000
npm install
npm run dev                 # http://localhost:5173
```

---

## User Flow

```
/ (Landing)
 └─► /sign-in    ← email+password  OR  SingPass QR
      ├── existing user → /dashboard
      └── new user ──► /sign-up  (SingPass pre-fill + dependants)
                         └──► /select-tier   (Pintar $5 / Pintar Plus $20)
                               └──► /payment-setup  (PayNow QR or GIRO)
                                     └──► /dashboard  (full member)
```

---

## Features Implemented

### ✅ FastAPI Backend (`/backend`)
- `POST /api/auth/register` — NRIC + email uniqueness check, bcrypt password, JWT
- `POST /api/auth/login` — email/password auth
- `GET  /api/auth/me` — JWT-protected profile
- `GET/POST/PUT/DELETE /api/dependents` — full CRUD with duplicate NRIC detection
- `POST /api/membership/select-tier` — Pintar / Pintar Plus
- `POST /api/payments/paynow` — generates PayNow QR payload + reference
- `POST /api/payments/giro` — GIRO mandate submission
- `POST /api/payments/:id/confirm` — payment confirmation
- `GET  /api/payments` — payment history

### ✅ Convex DB (`/convex`)
- Full schema: `users`, `dependents`, `payments` tables with indexes
- `users.ts` — queries + mutations (create, getByNric, getByEmail, updateMembership)
- `dependents.ts` — queries + mutations (list, add, update, remove, getByNric)
- `payments.ts` — queries + mutations (createPayNow, createGiro, markCompleted)

### ✅ User Dashboard (`/dashboard`)
- **Overview tab** — membership card, quick stats, quick actions
- **Family tab** — add/edit/remove dependants with inline modal
- **Payments tab** — full payment history table
- **Profile tab** — personal details + language preference

### ✅ Smart Dependent Management
- Duplicate NRIC detection at registration (server + frontend error messages)
- Add/edit/remove dependants post-registration from Dashboard
- Per-dependant address (same or different from primary)
- Optional NRIC capture for dependants
- Relationship types: Spouse, Parents, In-laws, Children, Sibling

### ✅ Seamless Payment Handoff
- **PayNow**: live QR code generated from PayNow spec payload (UEN + reference + amount)
- **GIRO**: e-mandate form → mandate reference + 3–5 day processing message
- Tier amounts hardcoded: Pintar = $5/month, Pintar Plus = $20/month
- Payment confirmation flow with success screen
- Payment history in Dashboard

### ✅ Multi-Language (English + Bahasa Melayu)
- All UI text in `src/lib/i18n.ts` (zero runtime dependency)
- `LanguageProvider` + `useLanguage()` hook for global state
- `LanguageToggle` component in Navbar + Dashboard Profile tab
- Language persisted to `localStorage` + synced to backend
- Full translations for: navigation, sign-in, sign-up, tier selection, payment, dashboard

---

## Environment Variables

### Backend `.env`
```
JWT_SECRET=change-this-to-a-long-random-secret
MOSQUE_PAYNOW_UEN=T08CC4132K
CONVEX_URL=https://your-deployment.convex.cloud
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:8000
```

---

## Production Notes
- Replace in-memory `_users`, `_dependents`, `_payments` dicts in `backend/main.py` with Convex HTTP calls using the provided Convex functions
- Replace SingPass mock in `frontend/src/lib/singpass.ts` with real MyInfo/SingPass NDI integration
- Replace PayNow QR generation with certified PayNow SDK from your bank/payment provider
- Add email verification flow (backend `/api/auth/verify-email` endpoint stub ready)
- Add HTTPS + proper CORS origins for production deployment

---

## Team
**Masjid Ar-Raudhah · Skim Pintar Digital Onboarding**  
Mosque Tech Challenge 2026
