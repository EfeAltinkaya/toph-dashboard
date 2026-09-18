-- Close Supabase's auto-generated REST API over these tables.
--
-- Supabase publishes every table in the public schema through PostgREST,
-- reachable by anyone holding the project's anon key, and the only thing
-- standing between that API and the rows is row level security. Prisma
-- creates tables with it off, which left User (password hashes), Session
-- and every farm's records readable and writable from outside the app.
--
-- Enabling RLS with no policies denies the anon and authenticated roles
-- entirely. The app is unaffected: it connects as the tables' owner, and
-- an owner bypasses RLS unless it is forced. Nothing in this app talks to
-- the REST API, so there is nothing a policy would need to allow.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Farm" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LoginAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployeeLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_EmployeeLogToTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BriefingRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
