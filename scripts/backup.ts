// Writes every table to a timestamped JSON file under backups/.
//
//   npx tsx scripts/backup.ts
//
// Supabase's free tier keeps no backups of its own, so this is the copy.
// The output contains password hashes and every farm's records, which is
// why backups/ is gitignored: a backup that ends up in a public repository
// is a breach, not a backup.
//
// Sessions are left out on purpose. They expire within a week, restoring
// one would only resurrect a login nobody asked for, and a stolen session
// token is worth more to an attacker than to anyone restoring data.
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config({ path: [".env.local", ".env"] });
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL env var is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const data = {
    takenAt: new Date().toISOString(),
    farms: await prisma.farm.findMany(),
    users: await prisma.user.findMany(),
    employees: await prisma.employee.findMany(),
    tags: await prisma.tag.findMany(),
    // Tag links travel with each log, since the join table is implicit.
    logs: await prisma.employeeLog.findMany({ include: { tags: { select: { id: true } } } }),
    messages: await prisma.message.findMany(),
    briefingRequests: await prisma.briefingRequest.findMany(),
  };

  const dir = path.join(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `toph-${data.takenAt.replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  console.log(`Backed up to ${path.relative(process.cwd(), file)}`);
  for (const [name, rows] of Object.entries(data)) {
    if (Array.isArray(rows)) console.log(`  ${name}: ${rows.length}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
