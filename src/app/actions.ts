"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/session";

// Both actions take a log id from the client, so both check that the log
// belongs to the caller's farm before touching it. A server action is a
// public endpoint: the id in the argument is a request, not a permission.
export async function markLogViewed(logId: number) {
  const { farmId } = await requireManager();
  await prisma.employeeLog.updateMany({
    where: { id: logId, farmId },
    data: { isNew: false },
  });
  revalidatePath("/");
}

export async function toggleLogTag(logId: number, tagId: number) {
  const { farmId } = await requireManager();
  const log = await prisma.employeeLog.findFirst({
    where: { id: logId, farmId },
    include: { tags: true },
  });
  if (!log) return;
  const alreadyTagged = log.tags.some((tag) => tag.id === tagId);

  await prisma.employeeLog.update({
    where: { id: logId },
    data: {
      tags: alreadyTagged
        ? { disconnect: [{ id: tagId }] }
        : { connect: [{ id: tagId }] },
    },
  });
  revalidatePath("/");
}
