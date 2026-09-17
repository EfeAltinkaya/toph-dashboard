import { prisma } from "@/lib/prisma";
import { DashboardBody } from "@/components/DashboardBody";

// Dashboard reflects live database state (recordings logged today, tags
// added, read/unread status), so it must never be served from a static
// build-time cache.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [logs, tags] = await Promise.all([
    prisma.employeeLog.findMany({
      include: { employee: true, tags: true },
      orderBy: { date: "desc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysLogs = logs.filter((l) => l.date >= today && l.date < tomorrow);
  const activeWorkers = new Set(logs.map((l) => l.employee.id)).size;
  const responseAccuracy = logs.length
    ? Math.round(logs.reduce((sum, l) => sum + l.accuracy, 0) / logs.length)
    : 0;

  return (
    <DashboardBody
      logs={logs}
      allTags={tags}
      stats={{
        todaysRecordings: todaysLogs.length,
        newToday: todaysLogs.filter((l) => l.isNew).length,
        activeWorkers,
        responseAccuracy,
      }}
    />
  );
}
