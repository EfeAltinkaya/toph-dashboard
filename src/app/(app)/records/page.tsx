import { prisma } from "@/lib/prisma";
import { requireFarmId } from "@/lib/session";
import { APPLICATION_ACTIVITIES, applicationRecords } from "@/lib/records";
import { RecordsReport } from "@/components/RecordsReport";

// The report reflects whatever has been logged, including a log filed a
// minute ago from the field.
export const dynamic = "force-dynamic";

export default async function RecordsPage() {

  // Only logs that applied a product can appear on a use report, so the
  // filter happens in the query rather than pulling the whole history
  // across the wire to throw most of it away.
  const farmId = await requireFarmId();
  const logs = await prisma.employeeLog.findMany({
    where: {
      farmId,
      // A spray logged without its product still has to be on the report
      // (flagged), so this can't be "product is not null" alone.
      OR: [{ product: { not: null } }, { activity: { in: APPLICATION_ACTIVITIES } }],
    },
    include: { employee: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  const records = applicationRecords(
    logs.map((log) => ({
      id: log.id,
      date: log.date,
      startTime: log.startTime,
      activity: log.activity,
      field: log.field,
      employeeName: log.employee.name,
      product: log.product,
      target: log.target,
      rate: log.rate,
      method: log.method,
      coordSource: log.coordSource,
      gpsAccuracyM: log.gpsAccuracyM,
    }))
  );

  return <RecordsReport records={records} />;
}
