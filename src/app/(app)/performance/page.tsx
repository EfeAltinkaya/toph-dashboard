import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const employees = await prisma.employee.findMany({
    include: { logs: { select: { accuracy: true } } },
  });

  const rows = employees
    .map((emp) => ({
      name: emp.name,
      logCount: emp.logs.length,
      avgAccuracy: emp.logs.length
        ? Math.round(emp.logs.reduce((s, l) => s + l.accuracy, 0) / emp.logs.length)
        : 0,
    }))
    .sort((a, b) => b.logCount - a.logCount);

  const maxLogs = Math.max(1, ...rows.map((r) => r.logCount));

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Performance</h1>
        <p className="text-sm text-neutral-500">
          Logged activity and average transcription confidence per employee.
        </p>
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        {rows.map((row) => (
          <div key={row.name}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-neutral-900">{row.name}</span>
              <span className="text-neutral-500">
                {row.logCount} logs · {row.avgAccuracy || "—"}
                {row.avgAccuracy ? "%" : ""} avg. accuracy
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(row.logCount / maxLogs) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
