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

export type DeleteEmployeeResult = { error?: "employeeHasLogs" | "employeeHasOneLog"; count?: number };

// Deliberately refuses to delete an employee with existing logs rather than
// guessing whether to cascade-delete their history or orphan it onto no
// one — that's a real decision a farm admin should make explicitly (e.g.
// by reassigning or deleting the logs first), not something to silently
// pick a default for.
export async function deleteEmployee(id: number): Promise<DeleteEmployeeResult> {
  await requireUser();
  const logCount = await prisma.employeeLog.count({ where: { employeeId: id } });
  if (logCount > 0) {
    return logCount === 1
      ? { error: "employeeHasOneLog" }
      : { error: "employeeHasLogs", count: logCount };
  }
  await prisma.employee.delete({ where: { id } });
  revalidatePath("/employees");
  return {};
}
