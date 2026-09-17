"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { coordsForField } from "@/lib/fields";
import { formatTime, parseLocalDate } from "@/lib/date-utils";

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
  accuracy: number;
}) {
  await requireUser();

  const employee = await prisma.employee.upsert({
    where: { name: input.employeeName },
    update: {},
    create: { name: input.employeeName },
  });

  const now = new Date();
  const { lat, lng } = coordsForField(input.field);

  await prisma.employeeLog.create({
    data: {
      employeeId: employee.id,
      activity: input.activity,
      field: input.field,
      date: now,
      startTime: formatTime(now),
      endTime: formatTime(now),
      isNew: false,
      accuracy: Math.round(input.accuracy),
      audioUrl: input.audioUrl,
      photoUrl: input.photoUrl || null,
      transcript: input.transcript || "(no transcript captured)",
      lat,
      lng,
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
