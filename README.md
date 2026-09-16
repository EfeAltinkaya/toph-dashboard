# Toph — Dashboard

An implementation of the Toph farm-activity dashboard from the LavaLab Fall 2026 dev challenge Figma. Full-stack: real accounts, a real database, real voice recording with live transcription, and every sidebar tab wired to genuine data — not a static mockup.

## Stack, and why

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | One project serves both the UI and the backend (Server Actions, Route Handlers), so there's no separate API server to stand up and deploy. TypeScript catches data-shape mistakes at compile time instead of at runtime. |
| Styling | **Tailwind CSS v4** | Utility classes make it fast to match exact spacing/sizing from the Figma. |
| Icons | **lucide-react** | A consistent outline icon set close to the Figma's icon style. |
| ORM | **Prisma 7** | Type-safe queries generated from one schema file; a typo in a field name is a compile error, not a production bug. |
| Database (dev) | **SQLite via `@prisma/adapter-better-sqlite3`** | Zero setup, fast local iteration. |
| Database (prod) | **Postgres** (Neon/Vercel Postgres) | Vercel's serverless functions have no persistent shared filesystem, so a SQLite file wouldn't survive between requests. Same ORM either way, so switching is a config change, not a rewrite. |
| Auth | **Custom session auth** (bcrypt + `jose`/JWT-signed httpOnly cookie + a `Session` DB row) | Next.js 16 is too new to trust a third-party auth library's compatibility yet, so this follows the Next.js team's own documented pattern (Data Access Layer + Proxy for optimistic redirects) instead of pulling one in. Every account has full access; there's no per-user data partitioning since the brief asks for real login, not multi-tenant permissions. |
| Voice input | **MediaRecorder + Web Speech API** | Real microphone recording, with live speech-to-text built into Chrome/Edge, no external API key or per-minute billing. Falls back to a manual transcript box in browsers without it (Firefox/Safari). |
| Map | **react-leaflet + Esri World Imagery tiles** | A real, pannable/zoomable satellite map with no API key, instead of the earlier generated placeholder graphic. |
| Mutations | **React Server Actions** | Mutate server data directly from a client component without hand-rolling REST endpoints for every interaction. |
| Hosting | **Vercel** | Built by the Next.js team; deploys this stack from a GitHub repo with no extra config. |

## Data model

```
User 1---* Session
User 1---* Message
Employee 1---* EmployeeLog *---* Tag
```

- **User / Session**: real accounts. Passwords are bcrypt-hashed; sessions are DB rows referenced by an opaque, signed cookie (never the raw session id), so a session can be revoked server-side at any time.
- **Employee**: a farm worker.
- **EmployeeLog**: one voice-logged activity — activity type, field, date, start/end time, a transcription-confidence `accuracy` score, the audio (stored as a data URL), the transcript, and real `(lat, lng)` coordinates for the map.
- **Tag**: a reusable label (`Needs Review`, `Verified`, `Flagged`, `Follow-up`), many-to-many with logs. `Needs Review`/`Flagged` logs surface under Audit Manager.
- **Message**: a shared team notice board, any account can post.

## What's implemented

Every sidebar tab is a real page backed by the database:

- **Dashboard**: live stat cards, this-month log table.
- **Activity Logs**: the full log history, same table minus the stat cards.
- **Map**: every field plotted on a real satellite map, with a popup showing how much activity each has.
- **Audit Manager**: logs tagged `Needs Review` or `Flagged`.
- **Reports**: totals, broken down by activity type and by field.
- **Schedule**: activity grouped by day.
- **Employees**: add/rename employees; each row shows their log count, average transcription accuracy, and last-active date.
- **Performance**: a ranked bar view of the same data.
- **Messages**: a shared team board any logged-in account can post to.
- **Settings**: edit your own name/email.
- **Support**: FAQ.

On every log row: **View** (expand — audio playback, transcript, tags, map), **Edit** (inline, all fields), **Delete**. **New Log** opens a real recorder: pick an employee/activity/field, record from your mic, watch it transcribe live, then save — creating a genuine database row with playable audio and a real transcript, not the placeholder tone from the first version of this project.

## Running locally

```bash
npm install
npx prisma migrate dev   # creates dev.db and applies the schema
npm run seed             # seeds sample employees/logs
npm run dev
```

You'll land on `/login` — sign up for an account first (every account has full access).

## Deploying

1. Push to GitHub.
2. Create a free Postgres database (e.g. via Neon, or Vercel's own Postgres integration).
3. Import the repo into Vercel; set `DATABASE_URL` to the Postgres connection string and `SESSION_SECRET` to a random 32-byte value (`openssl rand -base64 32`).
4. Run `npx prisma migrate deploy` against that database once (Vercel can also run this as part of the build), then seed it.
