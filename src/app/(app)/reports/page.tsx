import { prisma } from "@/lib/prisma";
import { getI18n } from "@/i18n/server";
import { tr } from "@/i18n";

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
  const { t } = await getI18n();
  const [byActivity, byField, totalLogs, totalEmployees] = await Promise.all([
    prisma.employeeLog.groupBy({ by: ["activity"], _count: { activity: true } }),
    prisma.employeeLog.groupBy({ by: ["field"], _count: { field: true } }),
    prisma.employeeLog.count(),
    prisma.employee.count(),
  ]);

  const activityRows = byActivity
    .map((a) => ({ label: tr(t.vocab.activities, a.activity), count: a._count.activity }))
    .sort((a, b) => b.count - a.count);
  const fieldRows = byField
    .map((f) => ({ label: tr(t.vocab.fields, f.field), count: f._count.field }))
    .sort((a, b) => b.count - a.count);
  const maxActivity = Math.max(1, ...activityRows.map((r) => r.count));
  const maxField = Math.max(1, ...fieldRows.map((r) => r.count));

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">{t.pages.reports.title}</h1>
        <p className="text-sm text-surface/60">{t.pages.reports.subtitle}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">{t.pages.reports.totalLogs}</div>
          <div className="mt-1 text-3xl font-semibold text-neutral-900">{totalLogs}</div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">{t.pages.reports.totalEmployees}</div>
          <div className="mt-1 text-3xl font-semibold text-neutral-900">{totalEmployees}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-sm font-semibold text-neutral-900">{t.pages.reports.byActivity}</div>
          {activityRows.map((r) => (
            <Bar key={r.label} label={r.label} count={r.count} max={maxActivity} />
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-sm font-semibold text-neutral-900">{t.pages.reports.byField}</div>
          {fieldRows.map((r) => (
            <Bar key={r.label} label={r.label} count={r.count} max={maxField} />
          ))}
        </div>
      </div>
    </div>
  );
}
