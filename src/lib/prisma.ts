import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 has no bundled query engine — the database driver is passed in
// explicitly. `pg` over a connection pool is the standard choice for
// Postgres, and the connection string works as-is (it carries
// sslmode=require).
//
// POSTGRES_PRISMA_URL is what Vercel's Supabase integration names the
// pooled connection. Accepting it as a fallback means the deployment works
// with the variables the integration creates on its own, with no manual
// copying of secrets between dashboards.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
if (!connectionString) {
  throw new Error("No database URL: set DATABASE_URL (or POSTGRES_PRISMA_URL)");
}

// Next.js hot-reloads modules in dev, which would otherwise create a new
// PrismaClient (and a new pool) on every edit. Caching it on globalThis
// keeps a single instance across reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
