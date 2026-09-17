// One-off data migration: creates the single Farm row that gates worker
// signup, without re-running the whole seed script (which uses `.create`,
// not `.upsert`, and would blow up on the unique Employee names that
// already exist).
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const farm = await prisma.farm.upsert({
    where: { joinCode: "BAYRANCH" },
    update: {},
    create: { name: "Bay Ranch", joinCode: "BAYRANCH" },
  });
  console.log(`Farm ready: ${farm.name} (join code: ${farm.joinCode})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
