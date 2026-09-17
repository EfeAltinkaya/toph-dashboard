import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function Bar({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-neutral-900">{label}</span>
        <span className="text-neutral-500">{count}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${(count / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default async function ReportsPage() {
  const [byActivity, byField, totalLogs, totalEmployees] = await Promise.all([
    prisma.employeeLog.groupBy({ by: ["activity"], _count: { activity: true } }),
    prisma.employeeLog.groupBy({ by: ["field"], _count: { field: true } }),
    prisma.employeeLog.count(),
    prisma.employee.count(),
  ]);

  const activityRows = byActivity
    .map((a) => ({ label: a.activity, count: a._count.activity }))
    .sort((a, b) => b.count - a.count);
  const fieldRows = byField
    .map((f) => ({ label: f.field, count: f._count.field }))
    .sort((a, b) => b.count - a.count);
  const maxActivity = Math.max(1, ...activityRows.map((r) => r.count));
  const maxField = Math.max(1, ...fieldRows.map((r) => r.count));

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">Reports</h1>
        <p className="text-sm text-surface/60">
          A summary of everything logged across the farm.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Total Logs</div>
          <div className="mt-1 text-3xl font-semibold text-neutral-900">{totalLogs}</div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Total Employees</div>
          <div className="mt-1 text-3xl font-semibold text-neutral-900">{totalEmployees}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-sm font-semibold text-neutral-900">By Activity</div>
          {activityRows.map((r) => (
            <Bar key={r.label} label={r.label} count={r.count} max={maxActivity} />
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-sm font-semibold text-neutral-900">By Field</div>
          {fieldRows.map((r) => (
            <Bar key={r.label} label={r.label} count={r.count} max={maxField} />
          ))}
        </div>
      </div>
    </div>
  );
}
