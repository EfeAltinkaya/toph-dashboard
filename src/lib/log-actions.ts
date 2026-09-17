"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { coordsForField } from "@/lib/fields";
import { farmDateAt, formatTime } from "@/lib/date-utils";
import { extractLogFields } from "@/lib/extract";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function createLog(input: {
  employeeName: string;
  activity: string;
  field: string;
  transcript: string;
  audioUrl: string;
  photoUrl?: string | null;
  language: string;
  accuracy: number;
  // Typed entries arrive with these already filled in; voice logs get them
  // parsed out of the transcript below. Anything passed explicitly wins,
  // so the worker's own words are never overwritten by the parser.
  source?: "voice" | "typed";
  product?: string | null;
  target?: string | null;
  rate?: string | null;
  notes?: string | null;
  method?: string | null;
  // A real GPS fix from the worker's device, when they allowed it. Absent
  // means the log falls back to the block's known coordinates, and the
  // record says which of the two it is rather than presenting both as
  // measured.
  location?: { lat: number; lng: number; accuracyM: number } | null;
}) {
  const { farmId } = await requireUser();

  // Employees are per farm, so the same name in two farms is two people.
  const employee = await prisma.employee.upsert({
    where: { farmId_name: { farmId, name: input.employeeName } },
    update: {},
    create: { name: input.employeeName, farmId },
  });

  const now = new Date();
  const block = coordsForField(input.field);
  const fix = input.location;
  const { lat, lng } = fix ? { lat: fix.lat, lng: fix.lng } : block;
  const source = input.source ?? "voice";
  const extracted =
    source === "voice"
      ? extractLogFields(input.transcript)
      : { product: null, target: null, rate: null };

  await prisma.employeeLog.create({
    data: {
      employeeId: employee.id,
      farmId,
      activity: input.activity,
      field: input.field,
      date: now,
      startTime: formatTime(now),
      endTime: formatTime(now),
      isNew: true,
      accuracy: Math.round(input.accuracy),
      audioUrl: input.audioUrl,
      photoUrl: input.photoUrl || null,
      transcript: input.transcript || "(no transcript captured)",
      language: input.language,
      source,
      product: input.product ?? extracted.product,
      target: input.target ?? extracted.target,
      rate: input.rate ?? extracted.rate,
      notes: input.notes ?? null,
      method: input.method ?? null,
      lat,
      lng,
      coordSource: fix ? "device" : "field",
      gpsAccuracyM: fix ? fix.accuracyM : null,
    },
  });

  revalidatePath("/", "layout");
}

// The "verify" step: a manager correcting what the parser pulled out (or
// filling in what it missed) without touching the transcript itself, so
// the original recording stays the source of truth.
export async function updateLogFields(
  id: number,
  fields: { product: string; target: string; rate: string; notes: string }
) {
  const { farmId } = await requireUser();
  await prisma.employeeLog.updateMany({
    where: { id, farmId },
    data: {
      product: fields.product.trim() || null,
      target: fields.target.trim() || null,
      rate: fields.rate.trim() || null,
      notes: fields.notes.trim() || null,
    },
  });
  revalidatePath("/", "layout");
}

export async function setLogPhoto(id: number, photoUrl: string | null) {
  const { farmId } = await requireUser();
  await prisma.employeeLog.updateMany({ where: { id, farmId }, data: { photoUrl } });
  revalidatePath("/", "layout");
}

export async function updateLog(
  id: number,
  input: {
    employeeName: string;
    activity: string;
    field: string;
    date: string;
    startTime: string;
    endTime: string;
  }
) {
  const { farmId } = await requireUser();

  const employee = await prisma.employee.upsert({
    where: { farmId_name: { farmId, name: input.employeeName } },
    update: {},
    create: { name: input.employeeName, farmId },
  });

  const { lat, lng } = coordsForField(input.field);

  // updateMany keeps the farm in the WHERE clause: editing by id alone
  // would let one farm's manager rewrite another farm's record.
  await prisma.employeeLog.updateMany({
    where: { id, farmId },
    data: {
      employeeId: employee.id,
      activity: input.activity,
      field: input.field,
      // The edited day and the edited start time are one moment, so the
      // timestamp keeps the time of day instead of collapsing to midnight.
      date: farmDateAt(input.date, input.startTime),
      startTime: input.startTime,
      endTime: input.endTime,
      lat,
      lng,
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteLog(id: number) {
  const { farmId } = await requireUser();
  await prisma.employeeLog.deleteMany({ where: { id, farmId } });
  revalidatePath("/", "layout");
}
