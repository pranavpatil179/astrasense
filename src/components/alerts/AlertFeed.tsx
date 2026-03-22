"use client";

import type { AlertItem } from "@/lib/sim/engine";
import { AlertCard } from "@/components/alerts/AlertCard";

export function AlertFeed({ alerts }: { alerts: AlertItem[] }) {
  if (!alerts.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 backdrop-blur-xl">
        No active warnings for this location. Continue monitoring trend signals.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {alerts.map((a) => (
        <AlertCard key={a.id} alert={a} />
      ))}
    </div>
  );
}

