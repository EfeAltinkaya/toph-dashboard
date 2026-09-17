import { prisma } from "@/lib/prisma";
import { FarmMap } from "@/components/FarmMap";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const logs = await prisma.employeeLog.groupBy({
    by: ["field"],
    _count: { field: true },
  });
  const fieldCounts = Object.fromEntries(logs.map((l) => [l.field, l._count.field]));

  return (
    <div className="flex h-screen flex-1 flex-col p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">Map</h1>
        <p className="text-sm text-surface/60">
          Every field being tracked, with how much logged activity each has.
        </p>
      </div>
      <div className="mt-6 flex-1 overflow-hidden rounded-2xl border border-neutral-200">
        <FarmMap fieldCounts={fieldCounts} />
      </div>
    </div>
  );
}
