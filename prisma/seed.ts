import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const ACTIVITIES = [
  "Spraying",
  "Harvesting",
  "Planting",
  "Irrigation",
  "Scouting",
  "Pruning",
  "Soil work",
  "Equipment maintenance",
] as const;

const FIELDS: Record<string, { x: number; y: number }> = {
  "Field A": { x: 24, y: 32 },
  "Field B": { x: 66, y: 24 },
  "Field C": { x: 30, y: 72 },
  "Field D": { x: 72, y: 66 },
};

const TAG_NAMES = ["Needs Review", "Verified", "Flagged", "Follow-up"];

const EMPLOYEES = [
  "Isaac Wang",
  "Maya Patel",
  "Liam Johnson",
  "Sophia Lee",
  "Noah Kim",
  "Ava Martinez",
  "Ethan Brooks",
  "Zoe Nguyen",
  "Owen Carter",
  "Mia Rodriguez",
  "Lucas Bennett",
  "Chloe Thompson",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatTime(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${pad(minute)} ${period}`;
}

function buildTranscript(activity: string, field: string, isoTimestamp: string) {
  return (
    `Offline guided voice log created at ${isoTimestamp}. ` +
    `Question (activity_type): What type of activity was this — spraying, fertilizing, planting, irrigating, harvesting, scouting, pruning, soil work, or equipment maintenance? ` +
    `Answer: ${activity.toLowerCase()}. ` +
    `Question (field_block): Where were you working (field, block, or area)? ` +
    `Answer: ${field}. ` +
    `Question (product_used): Did you apply any product, and if so what and how much? ` +
    `Answer: yes, standard rate per label, no incidents. ` +
    `Question (notes): Anything else to report? ` +
    `Answer: no, nothing else to report.`
  );
}

async function main() {
  await prisma.employeeLog.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.employee.deleteMany();

  const tags = await Promise.all(
    TAG_NAMES.map((name) => prisma.tag.create({ data: { name } }))
  );

  const employees = await Promise.all(
    EMPLOYEES.map((name) => prisma.employee.create({ data: { name } }))
  );

  const fieldNames = Object.keys(FIELDS);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let logIndex = 0;
  for (const employee of employees) {
    const numLogs = 1 + (logIndex % 3); // 1-3 logs per employee
    for (let i = 0; i < numLogs; i++) {
      // Spread logs across the last several days so "Today" and "This Month"
      // stats reflect real, queryable data instead of hardcoded numbers.
      const daysAgo = logIndex < 5 ? 0 : logIndex % 9;
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      const activity = ACTIVITIES[logIndex % ACTIVITIES.length];
      const field = fieldNames[logIndex % fieldNames.length];
      const startHour = 6 + (logIndex % 8);
      const durationHours = 2 + (logIndex % 3);
      const startTime = formatTime(startHour, 0);
      const endTime = formatTime(startHour + durationHours, (logIndex % 2) * 30);
      const accuracy = 84 + ((logIndex * 7) % 15); // 84-98

      const log = await prisma.employeeLog.create({
        data: {
          employeeId: employee.id,
          activity,
          field,
          date,
          startTime,
          endTime,
          isNew: logIndex < 2,
          accuracy,
          audioUrl: "/audio/sample-log.wav",
          transcript: buildTranscript(activity, field, date.toISOString()),
          mapX: FIELDS[field].x,
          mapY: FIELDS[field].y,
          tags:
            logIndex % 4 === 0
              ? { connect: [{ id: tags[logIndex % tags.length].id }] }
              : undefined,
        },
      });
      logIndex++;
      void log;
    }
  }

  console.log(`Seeded ${employees.length} employees and ${logIndex} logs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
