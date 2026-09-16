"use client";

import dynamic from "next/dynamic";

const LeafletFarmMap = dynamic(
  () => import("@/components/LeafletFarmMap").then((m) => m.LeafletFarmMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-neutral-100" />,
  }
);

export function FarmMap({ fieldCounts }: { fieldCounts: Record<string, number> }) {
  return <LeafletFarmMap fieldCounts={fieldCounts} />;
}
