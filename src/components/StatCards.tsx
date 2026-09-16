import { Mic, Users, Percent } from "lucide-react";

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
        icon={<Mic size={14} />}
        label="Todays Recordings"
        value={todaysRecordings}
        pill={newToday > 0 ? `${newToday} New` : undefined}
      />
      <Card icon={<Users size={14} />} label="Active Workers" value={activeWorkers} />
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
  pill,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  pill?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-3xl font-semibold text-neutral-900">{value}</span>
        {pill && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
            {pill}
          </span>
        )}
      </div>
    </div>
  );
}
