"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function markLogViewed(logId: number) {
  await prisma.employeeLog.update({
    where: { id: logId },
    data: { isNew: false },
  });
  revalidatePath("/");
}

export async function toggleLogTag(logId: number, tagId: number) {
  const log = await prisma.employeeLog.findUniqueOrThrow({
    where: { id: logId },
    include: { tags: true },
  });
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
