import { prisma } from "@/lib/prisma";
import { requireFarmId } from "@/lib/session";
import { getI18n } from "@/i18n/server";
import { EmployeesTable } from "@/components/EmployeesTable";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const { t } = await getI18n();
  const farmId = await requireFarmId();
  const employees = await prisma.employee.findMany({
    where: { farmId },
    include: { logs: { select: { accuracy: true, date: true } } },
    orderBy: { name: "asc" },
  });

  const rows = employees.map((emp) => {
    const logCount = emp.logs.length;
    const avgAccuracy = logCount
      ? Math.round(emp.logs.reduce((s, l) => s + l.accuracy, 0) / logCount)
      : 0;
    const lastActive = logCount
      ? emp.logs.reduce((latest, l) => (l.date > latest ? l.date : latest), emp.logs[0].date)
      : null;
    return { id: emp.id, name: emp.name, logCount, avgAccuracy, lastActive };
  });

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">{t.pages.employees.title}</h1>
        <p className="text-sm text-surface/60">{t.pages.employees.subtitle}</p>
      </div>
      <div className="mt-6">
        <EmployeesTable employees={rows} />
      </div>
    </div>
  );
}
