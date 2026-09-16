"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export type ProfileFormState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim();
  if (!name || !email) return { error: "Name and email are required." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== user.id) {
    return { error: "That email is already in use." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { name, email } });
  revalidatePath("/", "layout");
  return { success: true };
}
