"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function postMessage(body: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const trimmed = body.trim();
  if (!trimmed) return;

  await prisma.message.create({
    data: { authorId: user.id, body: trimmed },
  });
  revalidatePath("/messages");
}
