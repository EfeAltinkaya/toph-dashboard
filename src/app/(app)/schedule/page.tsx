import { prisma } from "@/lib/prisma";
import { requireFarmId } from "@/lib/session";
import { getI18n } from "@/i18n/server";
import { format, tr } from "@/i18n";
import { localeFor } from "@/i18n/config";
import { FARM_TIME_ZONE, farmDayKey } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const { lang, t } = await getI18n();
  const dateFormatter = new Intl.DateTimeFormat(localeFor(lang), {
    timeZone: FARM_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const farmId = await requireFarmId();
  const logs = await prisma.employeeLog.findMany({
    where: { farmId },
    include: { employee: true },
    orderBy: { date: "desc" },
    take: 200,
  });

  const groups = new Map<string, typeof logs>();
  for (const log of logs) {
    const key = farmDayKey(log.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">{t.pages.schedule.title}</h1>
        <p className="text-sm text-surface/60">{t.pages.schedule.subtitle}</p>
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
                    <span className="text-neutral-500">
                      {" "}
                      {format(t.pages.schedule.entry, {
                        activity: tr(t.vocab.activities, log.activity),
                        field: tr(t.vocab.fields, log.field),
                      })}
                    </span>
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
