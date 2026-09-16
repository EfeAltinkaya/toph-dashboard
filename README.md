# Toph — Dashboard

An implementation of the Toph farm-activity dashboard from the LavaLab Fall 2026 dev challenge Figma. Full-stack: the UI is backed by a real database, so logging in, expanding a record, tagging it, or refreshing the page all reflect genuine persisted state — not mock/local data.

## Stack, and why

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | One project serves both the UI and the backend (Route Handlers / Server Actions under `src/app`), so there's no separate API server to stand up and deploy. TypeScript catches data-shape mistakes (e.g. passing the wrong field name between the DB layer and the UI) at compile time instead of at runtime. |
| Styling | **Tailwind CSS v4** | Utility classes make it fast to match exact spacing/sizing from the Figma without hand-writing a separate CSS file per component. |
| Icons | **lucide-react** | A consistent outline icon set close to the Figma's icon style, instead of hand-authoring dozens of one-off SVGs under time pressure. |
| ORM | **Prisma 7** | Defines the data shape once (`prisma/schema.prisma`) and generates type-safe queries from it, so a typo in a field name is a compile error, not a production bug. Prisma 7 made database drivers explicit ("driver adapters") rather than bundling a Rust query engine — see below. |
| Database (dev) | **SQLite via `@prisma/adapter-better-sqlite3`** | Zero setup, fast local iteration, no account/service needed to start building. |
| Database (prod) | **Postgres** (Neon/Vercel Postgres) | SQLite is a single file on disk. Vercel's serverless functions don't have a persistent, shared filesystem — every invocation can run on a different machine, and any writes to a local file would vanish or fail to be seen by the next request. A real network-accessible database is required for the "refresh the page, the data is still there" requirement once this is actually deployed. Using the same ORM (Prisma) for both means swapping the datasource is a config change, not a rewrite. |
| Mutations | **React Server Actions** (`"use server"` functions in `src/app/actions.ts`) | Next's idiomatic way to mutate server data from a client component without hand-rolling a REST endpoint + `fetch` call for every small interaction (marking a log read, toggling a tag). |
| Hosting | **Vercel** | Built by the Next.js team; deploys this exact stack from a GitHub repo with no extra config. |

## Data model

```
Employee 1---* EmployeeLog *---* Tag
```

- **Employee**: a farm worker (`name`).
- **EmployeeLog**: one voice-logged activity — activity type, field, date, start/end time, a `isNew`/read flag, a transcription-confidence `accuracy` score, the audio URL, the transcript text, and an `(mapX, mapY)` position for the field-map pin.
- **Tag**: a reusable label (`Needs Review`, `Verified`, `Flagged`, `Follow-up`) that can be attached to any number of logs (many-to-many).

Employees and tags are modeled as their own tables rather than plain strings on the log — normal relational design, and it's what lets "Active Workers" be a real `COUNT(DISTINCT employee)` query instead of a guess.

## What's implemented vs. scoped out

Implemented, and wired to the database:
- Default dashboard view: stat cards (Today's Recordings / Active Workers / Response Accuracy — all computed live from the DB, not hardcoded), employee log table.
- Expandable row (Expanded Entry view): waveform + working audio playback, transcript summary, field map with a location pin, and an expandable full map view.
- **Add Tag**: persists a real many-to-many relation; tags survive a refresh.
- **Read/unread state**: expanding a "new" log marks it read in the database — the sidebar badge and the "N New" stat both update, and stay updated after a hard refresh.
- Search, a date-range filter (All Time / This Week / This Month), an activity-type filter, and sort-by-date — all operating on real query results.

Deliberately out of scope, and why:
- **The other sidebar sections** (Activity Logs, Map, Audit Manager, Reports, Schedule, Employees, Performance, Messages, Settings, Support) are rendered as static nav items. The brief only asked for the Dashboard page, and the Figma doesn't specify designs for the others — building ten placeholder pages wouldn't demonstrate anything beyond what the Dashboard already does.
- **Authentication**: no login flow is in the Figma, so none was built. The "Bays Ranch / Admin" header is static, matching the design. (NextAuth/Auth.js would be the natural next step if this went further.)
- **The field map image**: rather than hotlink a stock aerial photo or wire in a real maps API (which needs an API key), the map is a small generated SVG "patchwork field" illustration with a pin positioned per-field. It keeps the deployed demo dependency- and API-key-free while preserving the map-with-a-pin interaction from the Figma.
- **Audio recordings**: there's obviously no real farm audio available. All logs point at one generated placeholder tone (`public/audio/sample-log.wav`, built by `scripts/generate-demo-audio.mjs`) so the Play/Pause control is fully functional rather than a fake button.

## Running locally

```bash
npm install
npx prisma migrate dev   # creates dev.db and applies the schema
npm run seed             # seeds sample employees/logs
npm run dev
```

## Deploying

1. Push to GitHub.
2. Create a free Postgres database (e.g. via Neon, or Vercel's own Postgres integration).
3. Import the repo into Vercel; set `DATABASE_URL` to the Postgres connection string.
4. `npx prisma migrate deploy` against that database (Vercel can run this as part of the build, or it can be run once manually), then seed it.
