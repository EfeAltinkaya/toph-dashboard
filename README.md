# Toph

**Live: https://toph-dashboard-eight.vercel.app**

A working build of Toph for the LavaLab Fall 2026 dev challenge: the marketing site plus the farm-compliance dashboard behind it. Real accounts, a real Postgres database, real microphone recording with live transcription, and every screen wired to queried data rather than a static mockup.

The problem it's built around: agriculture is one of the most heavily regulated industries in the US, audits arrive 5 to 10 times a year with little notice, and most farms still keep their records on paper. Toph captures the record where the work happens, by voice, in the worker's own language, and turns it into something an auditor can read.

## Try it

| | |
|---|---|
| Manager | `demo@bayranch.farm` / `TophDemo2026` → full dashboard |
| Worker | Sign up at `/signup`, choose Worker, join code `BAYRANCH` → single log screen |
| Language | The EN/ES toggle in the header of every screen, marketing and app |

A manager account can be created at `/signup` with no code. A worker account needs the farm's join code, so nobody can enroll themselves as staff.

Voice recording needs Chrome or Edge (Web Speech API). Everywhere else the recorder falls back to a transcript box, and the Type tab works in any browser.

## Stack, and why

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | One project serves the UI and the backend (Server Actions, Route Handlers), so there is no separate API server to deploy. TypeScript turns data-shape mistakes into compile errors. |
| Styling | **Tailwind CSS v4** | CSS-first config (`@theme inline`), so the seven-theme switcher is CSS custom properties rather than duplicated class sets. |
| ORM | **Prisma 7 with driver adapters** | Prisma 7 ships no bundled query engine: the driver is passed in explicitly (`@prisma/adapter-pg` + `pg`), which is what keeps it working in a serverless runtime. |
| Database | **Supabase Postgres** | Postgres in every environment, including local dev. Prisma's migration SQL is provider-specific, so keeping SQLite locally would mean two migration histories that drift, the classic "worked on my machine" bug. The app connects through the transaction pooler (port 6543) because serverless functions open far more connections than Postgres will hold; migrations use the session pooler (5432), which supports the advisory locks and DDL a transaction pooler does not. |
| Auth | **Custom session auth** (bcrypt + `jose`-signed httpOnly cookie + a `Session` DB row) | Follows the Next.js team's documented pattern (Data Access Layer plus proxy for optimistic redirects) instead of trusting a third-party library's Next 16 compatibility. Sessions are DB rows referenced by a signed cookie, never the raw id, so any session can be revoked server-side. |
| Rate limiting | **`LoginAttempt` rows, not memory** | Each serverless request may run on a different short-lived instance, so an in-memory counter would silently stop protecting anything the moment it deployed. |
| Voice input | **MediaRecorder + Web Speech API** | Real recording with live speech-to-text built into the browser: no API key, no per-minute billing, and the audio stays on the page until the log is saved. |
| Transcript parsing | **Deterministic parser** (`src/lib/extract.ts`) | Product, target, and rate are pulled out with rules, not an LLM, so the same sentence always yields the same record and the extraction is unit-testable. Handles spoken numbers in English and Spanish ("twenty-four ounces", "veinticuatro onzas"). |
| i18n | **Cookie-based, server-rendered** | The language cookie is read on the server, so the first HTML response is already in the right language and `<html lang>` matches. localStorage would have meant a flash of English and a hydration mismatch. `es` is typed as `Dictionary`, so a missing translation is a build error. |
| Map | **react-leaflet + Esri World Imagery** | A real pannable satellite map with no API key. |
| Motion | **`motion`** | Scroll-linked progress and reveals, with `useReducedMotion` respected throughout. |
| Hosting | **Vercel** | Built by the Next.js team; the build step runs `prisma migrate deploy` so the database schema and the code deploy together. |

## Data model

```
User 1---* Session          Farm (join code)
User 1---* Message          LoginAttempt
Employee 1---* EmployeeLog *---* Tag
BriefingRequest
```

- **User**: `role` is `manager` or `worker`. A manager gets the dashboard; a worker gets one screen for logging activity and nothing else, matching the real product's split and meaning a worker cannot see anyone else's data.
- **Farm**: the join code a worker signs up with.
- **EmployeeLog**: one logged activity: type, field, date, start/end time, a transcription-confidence score, the audio, the transcript, the language it was spoken in, an optional translation, `(lat, lng)` for the map, and the structured `product` / `target` / `rate` parsed out of the transcript. `source` records whether it was spoken or typed, because a typed entry is the worker's own words and a voice one is parsed.
- **Tag**: `Needs Review`, `Verified`, `Flagged`, `Follow-up`, many-to-many with logs. Tagged logs surface under Audit Manager.
- **BriefingRequest**: submissions from the public Request a Briefing form, a genuine write rather than a form that goes nowhere.

## What's implemented

**Marketing site** (`/`, `/product`, `/use-cases`, `/company`): a live hero demo where you speak into the page and watch a compliance record assemble itself, scroll-driven field illustrations, a scan grid over real aerial photography, and a briefing form that writes to the database.

**Worker screen** (`/log`): record by voice and watch it transcribe live, or use the Type tab. On save, the transcript is parsed into a structured record and checked against compliance rules.

**Dashboard** (manager): live stat cards and this-month table; Activity Logs; Map with every field plotted; Audit Manager for flagged logs; Reports by activity and field; Schedule by day; Employees with per-person log counts and average accuracy; Performance; a shared Messages board; Settings; Support.

Every log row expands to audio playback, the transcript, its translation, the parsed fields, the compliance checks, and the map location, and can be edited inline or deleted.

**Compliance checks** (`src/lib/compliance.ts`) return keys, not sentences, so the same check renders in English or Spanish. One seeded log is deliberately non-compliant (Regalia applied for aphids, which it isn't labeled for) because a demo where every record passes doesn't show the point.

**Tests**: 42 unit tests over the transcript parser, compliance rules, auth schemas, date handling, field data, and the translation dictionaries (`npm test`).

## Running locally

```bash
npm install
```

Create `.env.local` with a Postgres connection string, plus `SESSION_SECRET` in `.env`:

```
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://...:5432/postgres?sslmode=no-verify"
```

`DATABASE_URL` is the pooled connection the app uses; `DIRECT_URL` is the direct one migrations need. With a provider that has no separate pooler, set both to the same string. Then:

```bash
npx prisma migrate dev   # applies the schema
npm run seed             # 12 employees, 18 logs, farm "Bay Ranch" (join code BAYRANCH)
npm run dev
```

Seeding replaces the demo logs, so anything recorded by hand is cleared.

## Deploying

1. Push to GitHub and import the repo into Vercel.
2. Provision Postgres (this deployment uses the Supabase integration).
3. Set `DATABASE_URL`, `DIRECT_URL`, and `SESSION_SECRET` (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
4. Deploy. `npm run build` runs `prisma migrate deploy` first, so the schema is applied on every deploy; seed once from your machine.
