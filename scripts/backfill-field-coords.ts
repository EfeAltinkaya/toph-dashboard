// One-off data migration: updates every existing EmployeeLog's lat/lng to
// match the current FIELD_COORDS. Needed once because the original
// coordinates for "farmland" turned out to land inside a town, and re-seeding
// would have thrown away real accounts/data created since then.
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { FIELD_COORDS } from "../src/lib/fields";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const [field, { lat, lng }] of Object.entries(FIELD_COORDS)) {
    const { count } = await prisma.employeeLog.updateMany({
      where: { field },
      data: { lat, lng },
    });
    console.log(`${field}: updated ${count} logs`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
