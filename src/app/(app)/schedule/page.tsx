import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default async function SchedulePage() {
  const logs = await prisma.employeeLog.findMany({
    include: { employee: true },
    orderBy: { date: "desc" },
    take: 200,
  });

  const groups = new Map<string, typeof logs>();
  for (const log of logs) {
    const key = log.date.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">Schedule</h1>
        <p className="text-sm text-surface/60">
          Activity grouped by day, most recent first.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {Array.from(groups.entries()).map(([key, dayLogs]) => (
          <div key={key} className="rounded-2xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-900">
              {dateFormatter.format(dayLogs[0].date)}
            </div>
            <div className="divide-y divide-neutral-100">
              {dayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <div>
                    <span className="font-medium text-neutral-900">{log.employee.name}</span>
                    <span className="text-neutral-500"> — {log.activity} at {log.field}</span>
                  </div>
                  <div className="text-neutral-500">
                    {log.startTime} - {log.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
