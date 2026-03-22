"use client";

import { useEffect, useMemo, useState } from "react";
import type { AlertItem, SimulationOutput } from "@/lib/sim/engine";
import { AlertFeed } from "@/components/alerts/AlertFeed";

type Filter = "all" | AlertItem["severity"];

export function AlertCenter({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const [data, setData] = useState<SimulationOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/simulate?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(
            String(lng),
          )}&days=60`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("simulate");
        const json = (await res.json()) as SimulationOutput;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setError("Failed to load alerts for this location.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  const counts = useMemo(() => {
    const c = { info: 0, warning: 0, critical: 0 };
    for (const a of data?.alerts ?? []) c[a.severity]++;
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    const all = data?.alerts ?? [];
    if (filter === "all") return all;
    return all.filter((a) => a.severity === filter);
  }, [data, filter]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">
              Real-time Environmental Alerts (Simulated)
            </div>
            <div className="mt-1 text-xs text-white/60">
              Threshold-based hazard warnings derived from NDVI/NDWI/LST/EVI.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["critical", `Critical (${counts.critical})`],
                ["warning", `Warning (${counts.warning})`],
                ["info", `Info (${counts.info})`],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={[
                  "rounded-xl px-3 py-2 text-sm ring-1 transition",
                  filter === k
                    ? "bg-white/10 text-white ring-white/15"
                    : "bg-black/20 text-white/70 ring-white/10 hover:bg-white/5",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 backdrop-blur-xl">
          Loading alerts…
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-6 text-sm text-rose-100 backdrop-blur-xl">
          {error}
        </div>
      ) : null}

      {data ? <AlertFeed alerts={filtered} /> : null}
    </div>
  );
}

