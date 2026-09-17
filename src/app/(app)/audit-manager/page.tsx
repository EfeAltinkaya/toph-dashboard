import { prisma } from "@/lib/prisma";
import { LogsTable } from "@/components/LogsTable";

export const dynamic = "force-dynamic";

const AUDIT_TAGS = ["Needs Review", "Flagged"];

export default async function AuditManagerPage() {
  const [logs, tags] = await Promise.all([
    prisma.employeeLog.findMany({
      where: { tags: { some: { name: { in: AUDIT_TAGS } } } },
      include: { employee: true, tags: true },
      orderBy: { date: "desc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">Audit Manager</h1>
        <p className="text-sm text-surface/60">
          Logs tagged &ldquo;Needs Review&rdquo; or &ldquo;Flagged&rdquo; for compliance follow-up.
        </p>
      </div>

      <div className="mt-6">
        {logs.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-400">
            Nothing flagged right now. Tag a log &ldquo;Needs Review&rdquo; or &ldquo;Flagged&rdquo; from the
            dashboard to see it here.
          </div>
        ) : (
          <LogsTable
            logs={logs}
            allTags={tags}
            defaultDateRange="all"
            title="Flagged Logs"
          />
        )}
      </div>
    </div>
  );
}
