"use client";

import type { IndexReading } from "@/lib/sim/engine";

function statusColor(status: IndexReading["status"]) {
  switch (status) {
    case "high":
      return "text-emerald-200 bg-emerald-400/15 ring-emerald-300/20";
    case "moderate":
      return "text-amber-200 bg-amber-400/15 ring-amber-300/20";
    case "low":
    default:
      return "text-rose-200 bg-rose-400/15 ring-rose-300/20";
  }
}

export function IndicatorCard({ reading }: { reading: IndexReading }) {
  const pct =
    reading.key === "lst"
      ? Math.max(0, Math.min(1, (reading.value - 5) / (49 - 5)))
      : Math.max(0, Math.min(1, reading.value));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            {reading.label}
          </div>
          <div className="mt-1 text-xs text-white/60">{reading.description}</div>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
            statusColor(reading.status),
          ].join(" ")}
        >
          {reading.status.toUpperCase()}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="text-3xl font-semibold text-white tabular-nums">
          {reading.value}
          <span className="ml-1 text-base font-medium text-white/60">
            {reading.unit ?? ""}
          </span>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300/60 via-emerald-300/60 to-cyan-300/60"
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>
    </div>
  );
}

