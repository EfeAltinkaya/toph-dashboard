import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// .env.local first so it wins over .env, matching how Next.js itself
// resolves them. The local Postgres URL lives there; .env keeps the
// session secret.
dotenv.config({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct connection: they run DDL and advisory locks,
    // which a transaction-mode connection pooler (Supabase's port 6543,
    // pgbouncer) does not support. The app itself uses the pooled URL —
    // see src/lib/prisma.ts. With a provider that has no separate pooler,
    // DIRECT_URL is simply unset and this falls back to DATABASE_URL.
    // POSTGRES_URL_NON_POOLING is the Vercel/Supabase integration's name
    // for the direct connection.
    url:
      process.env["DIRECT_URL"] ||
      process.env["POSTGRES_URL_NON_POOLING"] ||
      process.env["DATABASE_URL"] ||
      process.env["POSTGRES_PRISMA_URL"],
  },
});
