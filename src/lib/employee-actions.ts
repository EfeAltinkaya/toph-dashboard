"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function addEmployee(name: string) {
  await requireUser();
  const trimmed = name.trim();
  if (!trimmed) return;
  await prisma.employee.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });
  revalidatePath("/employees");
}

export async function renameEmployee(id: number, name: string) {
  await requireUser();
  const trimmed = name.trim();
  if (!trimmed) return;
  await prisma.employee.update({ where: { id }, data: { name: trimmed } });
  revalidatePath("/", "layout");
}
