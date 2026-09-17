import { prisma } from "@/lib/prisma";
import { requireFarmId } from "@/lib/session";
import { getI18n } from "@/i18n/server";
import { format, tr } from "@/i18n";
import { LogsTable } from "@/components/LogsTable";

export const dynamic = "force-dynamic";

const AUDIT_TAGS = ["Needs Review", "Flagged"];

export default async function AuditManagerPage() {
  const { t } = await getI18n();
  const farmId = await requireFarmId();
  const tagNames = {
    needsReview: tr(t.vocab.tags, "Needs Review"),
    flagged: tr(t.vocab.tags, "Flagged"),
  };
  const [logs, tags] = await Promise.all([
    prisma.employeeLog.findMany({
      where: { farmId, tags: { some: { name: { in: AUDIT_TAGS } } } },
      include: { employee: true, tags: true },
      orderBy: { date: "desc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">{t.pages.auditManager.title}</h1>
        <p className="text-sm text-surface/60">
          {format(t.pages.auditManager.subtitle, tagNames)}
        </p>
      </div>

      <div className="mt-6">
        {logs.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-400">
            {format(t.pages.auditManager.empty, tagNames)}
          </div>
        ) : (
          <LogsTable
            logs={logs}
            allTags={tags}
            defaultDateRange="all"
            title={t.pages.auditManager.tableTitle}
          />
        )}
      </div>
    </div>
  );
}
