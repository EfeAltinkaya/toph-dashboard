import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { FIELD_COORDS, FIELD_NAMES } from "../src/lib/fields";
import { ACTIVITIES } from "../src/lib/constants";
import { extractLogFields } from "../src/lib/extract";
import { farmDayOffset, formatTime, startOfFarmDay } from "../src/lib/date-utils";

// Run directly with tsx, so the env files have to be loaded by hand.
dotenv.config({ path: [".env.local", ".env"] });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL env var is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

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

// What a worker actually said they applied. Spoken rates are deliberately
// a mix of spelled-out and numeric so the seeded data exercises both paths
// through the transcript parser (src/lib/extract.ts) rather than only the
// easy one.
type Application = {
  product: string;
  target: string | null;
  targetEs: string | null;
  amount: string;
  amountEs: string;
  unit: string;
  unitEs: string;
  /** How it was put out. The state's use report is rejected without it. */
  method: string;
};

const SPRAY_PLANS: Application[] = [
  {
    product: "Serenade ASO",
    target: "powdery mildew",
    targetEs: "oidio",
    amount: "twenty-four",
    amountEs: "veinticuatro",
    unit: "ounces",
    unitEs: "onzas",
    method: "Ground rig",
  },
  {
    product: "M-Pede",
    target: "aphids",
    targetEs: "pulgones",
    amount: "2",
    amountEs: "2",
    unit: "gallons",
    unitEs: "galones",
    method: "Airblast",
  },
  // Deliberately non-compliant: Regalia isn't labeled for aphids, so this
  // one fails a compliance check and shows up as something to follow up
  // on. A demo where every record is perfect doesn't show the point.
  {
    product: "Regalia",
    target: "aphids",
    targetEs: "pulgones",
    amount: "one",
    amountEs: "uno",
    unit: "quarts",
    unitEs: "litros",
    method: "Ground rig",
  },
  {
    product: "Entrust SC",
    target: "thrips",
    targetEs: "trips",
    amount: "six",
    amountEs: "seis",
    unit: "ounces",
    unitEs: "onzas",
    method: "Backpack",
  },
];

const SOIL_PLAN: Application = {
  product: "CAN-17",
  target: null,
  targetEs: null,
  amount: "twelve",
  amountEs: "doce",
  unit: "gallons",
  unitEs: "galones",
  method: "Chemigation",
};

function applicationFor(activity: string, index: number): Application | null {
  // Activity is picked by `index % ACTIVITIES.length`, so every spraying
  // log shares the same remainder — rotating on the cycle number instead
  // is what actually varies the product from one spray log to the next.
  const cycle = Math.floor(index / ACTIVITIES.length);
  if (activity === "Spraying") return SPRAY_PLANS[cycle % SPRAY_PLANS.length];
  if (activity === "Soil work") return SOIL_PLAN;
  return null;
}

function buildTranscript(
  activity: string,
  field: string,
  isoTimestamp: string,
  application: Application | null
) {
  const productAnswer = application
    ? `yes, ${application.product} at ${application.amount} ${application.unit} per acre` +
      `${application.target ? ` for ${application.target}` : ""}, no incidents. `
    : `no, no product applied on this pass. `;

  return (
    `Offline guided voice log created at ${isoTimestamp}. ` +
    `Question (activity_type): What type of activity was this — spraying, fertilizing, planting, irrigating, harvesting, scouting, pruning, soil work, or equipment maintenance? ` +
    `Answer: ${activity.toLowerCase()}. ` +
    `Question (field_block): Where were you working (field, block, or area)? ` +
    `Answer: ${field}. ` +
    `Question (product_used): Did you apply any product, and if so what and how much? ` +
    `Answer: ${productAnswer}` +
    `Question (notes): Anything else to report? ` +
    `Answer: no, nothing else to report.`
  );
}

const ACTIVITY_ES: Record<string, string> = {
  Spraying: "rociando",
  Harvesting: "cosechando",
  Planting: "sembrando",
  Irrigation: "riego",
  Scouting: "inspeccionando",
  Pruning: "podando",
  "Soil work": "trabajo de suelo",
  "Equipment maintenance": "mantenimiento de equipo",
};

// A handful of seeded logs are recorded as if a Spanish-speaking worker
// used the app, so the Translate feature has something real to demo out
// of the box instead of only working after a fresh recording.
function buildTranscriptEs(
  activity: string,
  field: string,
  isoTimestamp: string,
  application: Application | null
) {
  const actividad = ACTIVITY_ES[activity] ?? activity.toLowerCase();
  // The product answer is the whole reason the Spanish transcripts matter:
  // the parser has to get the same structured record out of "veinticuatro
  // onzas por acre" as it does out of "twenty-four ounces per acre".
  const productoRespuesta = application
    ? `sí, aplicamos ${application.product} a ${application.amountEs} ${application.unitEs} por acre` +
      `${application.targetEs ? ` contra ${application.targetEs}` : ""}, sin incidentes. `
    : `no, no aplicamos ningún producto en esta pasada. `;

  return (
    `Registro de voz guiado sin conexión creado a las ${isoTimestamp}. ` +
    `Pregunta (tipo_actividad): ¿Qué tipo de actividad fue esta? ` +
    `Respuesta: estuve ${actividad} en ${field} esta mañana. ` +
    `Pregunta (bloque_campo): ¿Dónde estaba trabajando? ` +
    `Respuesta: en ${field}, todo salió bien y terminé sin problemas. ` +
    `Pregunta (producto_usado): ¿Aplicó algún producto, y si es así cuál y cuánto? ` +
    `Respuesta: ${productoRespuesta}` +
    `Pregunta (notas): ¿Algo más que reportar? ` +
    `Respuesta: no, todo normal, nos vemos mañana.`
  );
}

async function main() {
  // Only the demo farm is reseeded. Any other farm created through the
  // app (a manager signing up for their own) is left alone, so running the
  // seed can never wipe another farm’s data.
  const demoFarm = await prisma.farm.findUnique({ where: { joinCode: "BAYRANCH" } });
  if (demoFarm) {
    await prisma.employeeLog.deleteMany({ where: { farmId: demoFarm.id } });
    await prisma.employee.deleteMany({ where: { farmId: demoFarm.id } });
  }


  // The farm a worker joins with a code. Upserted rather than recreated so
  // re-seeding demo logs never invalidates a code already handed out.
  const farm = await prisma.farm.upsert({
    where: { joinCode: "BAYRANCH" },
    update: {},
    create: { name: "Bay Ranch", joinCode: "BAYRANCH" },
  });

  // Tags are shared reference labels, upserted rather than recreated: a
  // delete would disconnect them from another farm’s tagged logs.
  const tags = await Promise.all(
    TAG_NAMES.map((name) =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const employees = await Promise.all(
    EMPLOYEES.map((name) => prisma.employee.create({ data: { name, farmId: farm.id } }))
  );

  const fieldNames = FIELD_NAMES;
  // Farm-local midnight, not the seeding machine's: the times on a
  // compliance record are the farm's wall clock, and the seed has to
  // produce the same data whether it runs from California or from a
  // laptop in another timezone.
  const today = startOfFarmDay(new Date());

  let logIndex = 0;
  for (const employee of employees) {
    const numLogs = 1 + (logIndex % 3); // 1-3 logs per employee
    for (let i = 0; i < numLogs; i++) {
      // Spread logs across the last several days so "Today" and "This Month"
      // stats reflect real, queryable data instead of hardcoded numbers.
      const daysAgo = logIndex < 5 ? 0 : logIndex % 9;
      const activity = ACTIVITIES[logIndex % ACTIVITIES.length];
      const field = fieldNames[logIndex % fieldNames.length];
      const startHour = 6 + (logIndex % 8);
      const durationHours = 2 + (logIndex % 3);
      // The timestamp and the displayed start time are the same moment,
      // derived once, so a log can never read 6 AM while counting toward
      // the previous day.
      const date = new Date(farmDayOffset(today, -daysAgo).getTime() + startHour * 3600000);
      const startTime = formatTime(date);
      const endTime = formatTime(
        new Date(date.getTime() + durationHours * 3600000 + (logIndex % 2) * 1800000)
      );
      const accuracy = 84 + ((logIndex * 7) % 15); // 84-98
      const isSpanish = logIndex % 5 === 0;
      const application = applicationFor(activity, logIndex);
      const transcript = isSpanish
        ? buildTranscriptEs(activity, field, date.toISOString(), application)
        : buildTranscript(activity, field, date.toISOString(), application);
      // Seeded logs get their structured fields from the same parser the
      // live app uses, so the demo data can't drift from real behaviour.
      const extracted = extractLogFields(transcript);

      const log = await prisma.employeeLog.create({
        data: {
          employeeId: employee.id,
          farmId: farm.id,
          activity,
          field,
          date,
          startTime,
          endTime,
          isNew: logIndex < 2,
          accuracy,
          audioUrl: "/audio/sample-log.wav",
          transcript,
          language: isSpanish ? "es-ES" : "en-US",
          source: "voice",
          product: extracted.product,
          target: extracted.target,
          rate: extracted.rate,
          method: application ? application.method : null,
          // Most logs carry a real GPS fix from the worker's phone, a few
          // fall back to the block's coordinates (no signal, or location
          // declined). The audit checklist is only interesting if the demo
          // data contains something for it to catch.
          ...(logIndex % 5 === 3
            ? {
                lat: FIELD_COORDS[field].lat,
                lng: FIELD_COORDS[field].lng,
                coordSource: "field",
              }
            : {
                // A few hundred feet off the block's centre, which is what
                // a phone in a field actually reports.
                lat: FIELD_COORDS[field].lat + ((logIndex % 7) - 3) * 0.0003,
                lng: FIELD_COORDS[field].lng + ((logIndex % 5) - 2) * 0.0004,
                coordSource: "device",
                gpsAccuracyM: 5 + (logIndex % 9),
              }),
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

  console.log(
    `Seeded ${employees.length} employees, ${logIndex} logs, and farm "${farm.name}" (join code: ${farm.joinCode}).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
