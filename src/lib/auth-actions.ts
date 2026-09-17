"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, getCurrentUser } from "@/lib/session";
import { isRateLimited, recordLoginAttempt } from "@/lib/rate-limit";
import { SignupSchema, LoginSchema, ChangePasswordSchema } from "@/lib/auth-schemas";

export type AuthFormState = { error?: string } | undefined;

/**
 * A farm's join code, derived from its name: "Bay Ranch" -> "BAYRANCH12".
 * Readable enough to say out loud across a field, which matters more than
 * being short, and suffixed with digits so two farms with the same name
 * don't collide. Collisions are retried rather than assumed away.
 */
async function createFarm(name: string) {
  const stem =
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8) || "FARM";

  for (let attempt = 0; attempt < 10; attempt++) {
    const joinCode = `${stem}${Math.floor(10 + Math.random() * 90)}`;
    const existing = await prisma.farm.findUnique({ where: { joinCode } });
    if (!existing) return prisma.farm.create({ data: { name, joinCode } });
  }
  // Ten taken codes for one name is either a very popular name or a bug;
  // falling back to something guaranteed unique beats failing the signup.
  return prisma.farm.create({
    data: { name, joinCode: `${stem}${Date.now().toString().slice(-6)}` },
  });
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = SignupSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    joinCode: formData.get("joinCode"),
    farmName: formData.get("farmName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { role, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "emailTaken" };
  }

  // A worker joins an existing farm by code; a manager creates a new one.
  // Either way the account is tied to exactly one farm before it exists,
  // so there is no window in which someone is signed in with no tenant.
  let farmId: number;
  if (role === "worker") {
    const farm = await prisma.farm.findUnique({
      where: { joinCode: parsed.data.joinCode.trim().toUpperCase() },
    });
    if (!farm) {
      return { error: "joinCodeInvalid" };
    }
    farmId = farm.id;
  } else {
    const farm = await createFarm(parsed.data.farmName);
    farmId = farm.id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, farmId },
  });

  await createSession(user.id);
  redirect(role === "worker" ? "/log" : "/dashboard");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  if (await isRateLimited(email)) {
    return { error: "rateLimited" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  await recordLoginAttempt(email, !!valid);

  if (!valid) {
    return { error: "invalidCredentials" };
  }

  await createSession(user.id);
  redirect(user.role === "worker" ? "/log" : "/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export type ChangePasswordState = { error?: string; success?: boolean } | undefined;

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await getCurrentUser();
  if (!user) return { error: "notAuthenticated" };

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const isCorrect = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isCorrect) {
    return { error: "currentPasswordWrong" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { success: true };
}
