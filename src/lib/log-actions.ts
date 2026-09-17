"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { coordsForField } from "@/lib/fields";
import { formatTime, parseLocalDate } from "@/lib/date-utils";
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
}) {
  await requireUser();

  const employee = await prisma.employee.upsert({
    where: { name: input.employeeName },
    update: {},
    create: { name: input.employeeName },
  });

  const now = new Date();
  const { lat, lng } = coordsForField(input.field);
  const source = input.source ?? "voice";
  const extracted =
    source === "voice"
      ? extractLogFields(input.transcript)
      : { product: null, target: null, rate: null };

  await prisma.employeeLog.create({
    data: {
      employeeId: employee.id,
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
      lat,
      lng,
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
  await requireUser();
  await prisma.employeeLog.update({
    where: { id },
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
  await requireUser();
  await prisma.employeeLog.update({ where: { id }, data: { photoUrl } });
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
  await requireUser();

  const employee = await prisma.employee.upsert({
    where: { name: input.employeeName },
    update: {},
    create: { name: input.employeeName },
  });

  const { lat, lng } = coordsForField(input.field);

  await prisma.employeeLog.update({
    where: { id },
    data: {
      employeeId: employee.id,
      activity: input.activity,
      field: input.field,
      date: parseLocalDate(input.date),
      startTime: input.startTime,
      endTime: input.endTime,
      lat,
      lng,
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteLog(id: number) {
  await requireUser();
  await prisma.employeeLog.delete({ where: { id } });
  revalidatePath("/", "layout");
}
