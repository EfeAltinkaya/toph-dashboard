import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Login-attempt rate limiting, backed by the database rather than an
// in-memory counter: on Vercel, each request can land on a different,
// short-lived serverless instance, so anything kept only in process
// memory would reset (or simply not be shared) between requests and
// stop protecting anything.
export async function isRateLimited(email: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recentFailures = await prisma.loginAttempt.count({
    where: { email, success: false, createdAt: { gte: since } },
  });
  return recentFailures >= MAX_ATTEMPTS;
}

export async function recordLoginAttempt(email: string, success: boolean) {
  await prisma.loginAttempt.create({ data: { email, success } });
}
