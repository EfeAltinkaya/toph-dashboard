# Toph

Farmworkers log what they did by voice, in English or Spanish, from their phone in the field. Toph turns those logs into the compliance records a farm has to show an auditor and file with the county.

**Live app:** https://toph-dashboard-eight.vercel.app

| To try it as | Do this |
|---|---|
| A manager | Log in with `demo@bayranch.farm` / `TophDemo2026` |
| A field worker | Sign up at `/signup`, choose **Worker**, enter the join code `BAYRANCH` |

Log something as a worker on your phone, and it appears on the manager's dashboard within a few seconds.

---

## The problem

- **Farms are audited often, with little notice.** Toph's own pitch puts it at 5 to 10 audits a year, and most farms still keep records in paper notebooks. Before an audit, someone rebuilds months of records by hand.
- **The paperwork is legally required and strict.** In California, every pesticide application has to be reported to the county every month. A report missing the operator ID, site ID, acreage, EPA registration number, application method, or start time is rejected. Farms must keep each report for two years. ([California DPR](https://www.cdpr.ca.gov/pesticide-use-in-california/pesticide-use-reporting/))
- **The people doing the work are often not the people writing it down.** 62% of US farmworkers are most comfortable speaking Spanish, and 29% can't speak English at all ([NAWS, via NCFH](https://www.ncfh.org/wp-content/uploads/2025/04/facts_about_farmworkers_fact_sheet_1.10.23-1.pdf)). In California it's 80% ([NAWS California report](https://www.dol.gov/sites/dolgov/files/ETA/naws/pdfs/NAWS%20Research%20Report%2015.pdf)). An English-only form means the record gets written later, by someone who wasn't there.

**The result:** records are written late, from memory, with gaps that only surface when an inspector finds them.

---

## What each feature improves

Every feature exists to fix one part of that problem.

| Feature | What it improves | Why it matters |
|---|---|---|
| **Voice logging** | The record is made at the moment of work, not rebuilt weeks later | Memory is the weakest link in a paper system |
| **English and Spanish, on every screen** | A worker who doesn't read English can still file their own record | 62% of US farmworkers, and 80% in California, are most comfortable in Spanish |
| **Automatic field extraction** | Product, rate, and pest are pulled out of what the worker said, with no typing | Typing on a phone in a field is slow, so fields get skipped |
| **Label check** | Flags a product used on a pest its label doesn't cover, the same day | Using a pesticide inconsistent with its label is illegal under federal law (FIFRA) |
| **Use Report tab** | The monthly county report assembles itself from the logs, ready to export or print | A missing required field gets the report rejected |
| **Audit checklist** | Scores the records 0 or 1 on each audit question and names the exact record that fails | The farm finds its gaps before the inspector does |
| **GPS location** | Shows where the work actually happened, and says whether it was measured or assumed | "Where was this applied?" is a question an auditor asks |
| **Re-entry interval (REI)** | Shows how long workers must stay out of a sprayed field | Required by the EPA's Worker Protection Standard |
| **Separate farms and roles** | Each farm only sees its own data; workers can log but can't edit or delete | A compliance record is only worth something if it can't be quietly changed |

**The demo data scores 7 of 12 on purpose.** Every failure is real and points at a specific record, including an off-label application (Regalia sprayed for aphids) and a spray logged with no product at all. A checklist that always passes proves nothing.

---

## A 5-minute walkthrough

1. **Home page.** Click an example in the live demo, or press the mic and say *"sprayed M-Pede at two gallons per acre for aphids in field B."* Watch the record fill in.
2. **Log in as the manager.** The dashboard shows today's logs.
3. **Use Report** (sidebar, under Compliance). See the county report and the audit checklist. Try **Export CSV** and **Print / PDF**.
4. **Activity Logs.** Click **View** on a log to see the audio, transcript, parsed fields, compliance checks, and map.
5. **Switch to Español** using the toggle at the bottom of the sidebar. The whole app changes language.
6. **Sign up as a worker** on your phone with code `BAYRANCH`, tap **Attach my location**, and log something. It shows up on the manager's dashboard.

---

## How it's built, and why

| Part | Choice | Why this over the alternatives |
|---|---|---|
| App framework | **Next.js 16 + TypeScript** | One project runs both the pages and the server code, so there's no separate backend to host. TypeScript catches mistakes before the app runs. |
| Styling | **Tailwind CSS** | Fast to match the Figma's exact spacing. Themes are a few color variables instead of duplicated styles. |
| Database | **Postgres on Supabase** | Real, hosted, and free. The same database runs locally and in production, so nothing "works on my machine" and breaks when deployed. |
| Database access | **Prisma** | Every query is type-checked against the schema, so a typo in a field name fails at build time, not in front of a user. |
| Login | **Custom sessions** (hashed passwords, signed cookie, session stored in the database) | Follows the Next.js team's own recommended pattern. Any session can be revoked from the server. |
| Voice | **Browser's built-in recording and speech-to-text** | No API key and no per-minute cost. |
| Extracting fields | **Rules, not an AI model** | The same sentence always gives the same record, and it can be unit tested. For compliance, predictable beats clever. A production version would add a model. |
| Language | **Chosen on the server, stored in a cookie** | The page arrives already in the right language, with no flash of English. A missing Spanish translation is a build error. |
| Time | **Always the farm's local time** | The server runs in UTC, which once stamped a 1:47 PM log as 8:47 PM. A record should read the same to the farm, a remote manager, and an auditor next year. |
| Hosting | **Vercel** | Built by the Next.js team. Every push to GitHub redeploys automatically, and database changes deploy with the code. |

---

## Security

- **Each farm is fully separate.** Every query is filtered by the logged-in user's farm, taken from their session, never from anything the browser sends. Verified by checking all 11 dashboard pages from a second farm's account: none of the first farm's data appears.
- **Roles are enforced on the server, not just hidden in the UI.** Only managers can edit or delete records. A worker can only file logs under their own name.
- **The database's public API is locked.** Supabase exposes tables through a public API unless row level security is on. It is now on for every table.
- **Passwords are hashed** (bcrypt), and **failed logins are rate limited**, tracked in the database so the limit holds across servers.
- **Backups:** `npx tsx scripts/backup.ts` saves every table to a local file. Backups never go to GitHub, because they contain password hashes.

---

## How the data is organized

```
Farm ── Users (managers and workers)
     ── Employees ── Logs ── Tags
     ── Messages
```

A **farm** is the top level. A manager creates one when signing up and gets a join code; workers use that code to join. Everything else belongs to exactly one farm.

---

## Run it locally

```bash
npm install
```

Create `.env.local` with your Postgres connection strings, and `.env` with `SESSION_SECRET`:

```
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://...:5432/postgres?sslmode=no-verify"
```

Then:

```bash
npx prisma migrate dev   # creates the tables
npm run seed             # demo farm "Bay Ranch", 12 employees, 18 logs
npm run dev              # http://localhost:3000
```

`npm test` runs 73 unit tests covering the voice parser, compliance rules, the Use Report, farm-local time (including daylight saving), login rules, and the translations.

---

## Sources

- California Department of Pesticide Regulation, [Pesticide Use Reporting](https://www.cdpr.ca.gov/pesticide-use-in-california/pesticide-use-reporting/)
- National Center for Farmworker Health, [Facts About Farmworkers](https://www.ncfh.org/wp-content/uploads/2025/04/facts_about_farmworkers_fact_sheet_1.10.23-1.pdf) (National Agricultural Workers Survey data)
- U.S. Department of Labor, [California Findings from the National Agricultural Workers Survey](https://www.dol.gov/sites/dolgov/files/ETA/naws/pdfs/NAWS%20Research%20Report%2015.pdf)
- U.S. EPA, [Worker Protection Standard](https://www.epa.gov/pesticide-worker-safety/agricultural-worker-protection-standard-wps)

The farm, its operator ID, and its field data are demo values. Product label details are illustrative and not a substitute for the actual label.
