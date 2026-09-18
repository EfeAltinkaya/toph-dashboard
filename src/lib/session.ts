import "server-only";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET env var is not set");
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type SessionPayload = {
  sessionId: number;
  expiresAt: string;
};

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

// The cookie only carries a signed, opaque session id; the row it points at
// in the database is what actually gets checked and can be revoked (e.g. on
// logout, or if we ever add "log out of all devices").
export async function createSession(userId: number) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });

  const token = await encrypt({ sessionId: session.id, expiresAt: expiresAt.toISOString() });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = await decrypt(token);
  if (payload) {
    await prisma.session.delete({ where: { id: payload.sessionId } }).catch(() => {});
  }
  cookieStore.delete("session");
}

// Cached per request: several server components/actions can call this in
// the same render without triggering duplicate DB lookups.
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = await decrypt(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
});

/**
 * For server actions only a manager may call. The dashboard hides these
 * controls from workers, but a server action is a public endpoint: a
 * worker in the same farm could call deleteLog directly with any id. The
 * role has to be checked where the write happens, not where the button is.
 */
export async function requireManager() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "manager") throw new Error("Managers only");
  return user;
}

/**
 * The farm the signed-in user belongs to. Every dashboard query is scoped
 * by this, and it lives here as one named helper so a new page can't
 * accidentally read across farms by forgetting a `where` clause: the value
 * a page needs to filter by is only obtainable from the session.
 */
export const requireFarmId = cache(async () => {
  const user = await getCurrentUser();
  // Callers all sit behind the (app) layout's own check, so this is a
  // belt-and-braces redirect rather than the primary gate.
  if (!user) redirect("/login");
  return user.farmId;
});
