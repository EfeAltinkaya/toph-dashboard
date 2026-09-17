import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { WorkerHome } from "@/components/WorkerHome";

// The entire worker-facing app: not under the (app) route group because it
// deliberately shares none of that layout's sidebar or manager-only pages.
export const dynamic = "force-dynamic";

export default async function WorkerLogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "manager") redirect("/dashboard");

  const [logs, farm] = await Promise.all([
    prisma.employeeLog.findMany({
      where: { farmId: user.farmId, employee: { name: user.name } },
      include: { employee: true, tags: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.farm.findUnique({ where: { id: user.farmId } }),
  ]);

  return <WorkerHome userName={user.name} farmName={farm?.name ?? null} logs={logs} />;
}
