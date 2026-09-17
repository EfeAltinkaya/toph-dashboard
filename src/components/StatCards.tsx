import { Calendar, IdCard, Percent } from "lucide-react";

export function StatCards({
  todaysRecordings,
  newToday,
  activeWorkers,
  responseAccuracy,
}: {
  todaysRecordings: number;
  newToday: number;
  activeWorkers: number;
  responseAccuracy: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card
        icon={<Calendar size={14} />}
        label="Todays Recordings"
        value={todaysRecordings}
        note={newToday > 0 ? `${newToday} New` : undefined}
      />
      <Card icon={<IdCard size={14} />} label="Active Workers" value={activeWorkers} />
      <Card
        icon={<Percent size={14} />}
        label="Response Accuracy"
        value={responseAccuracy}
      />
    </div>
  );
}

function Card({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-accent-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        <span className="text-accent">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-3xl font-semibold text-neutral-900">{value}</span>
        {note && <span className="text-sm text-neutral-400">{note}</span>}
      </div>
    </div>
  );
}
