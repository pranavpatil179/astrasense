"use client";

import { LocationRequired } from "@/components/location/LocationRequired";
import { useSelectedLocation } from "@/components/location/useSelectedLocation";
import type { SimulationOutput } from "@/lib/sim/engine";
import { useEffect, useMemo, useState } from "react";
import { IndicatorCard } from "@/components/dashboard/IndicatorCard";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { AlertFeed } from "@/components/alerts/AlertFeed";
import { IndexTrends } from "@/components/charts/IndexTrends";
import { HazardProbabilities } from "@/components/charts/HazardProbabilities";
import { GlobalGlobe } from "@/components/globe/GlobalGlobe";

function DashboardInner() {
  const { location, source } = useSelectedLocation();
  if (!location) return null;

  const [data, setData] = useState<SimulationOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/simulate?lat=${encodeURIComponent(String(location.lat))}&lng=${encodeURIComponent(
            String(location.lng),
          )}&days=60`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Sim failed (${res.status})`);
        const json = (await res.json()) as SimulationOutput;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setError("Failed to generate simulation for this location.");
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
  }, [location.lat, location.lng]);

  const indicators = useMemo(() => {
    if (!data) return [];
    return [data.indices.ndvi, data.indices.ndwi, data.indices.lst, data.indices.evi];
  }, [data]);

  const hazards = useMemo(() => {
    if (!data) return [];
    return [
      data.hazards.flood,
      data.hazards.drought,
      data.hazards.veg_stress,
      data.hazards.land_degradation,
    ];
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
        <p className="text-sm text-white/60">
          Target: <span className="text-white/80">{location.label}</span> •{" "}
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}{" "}
          <span className="text-white/40">(from {source})</span>
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">
              Generating environmental intelligence…
            </div>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-white/10 bg-black/20"
              />
            ))}
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-6 text-sm text-rose-100 backdrop-blur-xl">
          {error}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <GlobalGlobe
                  selected={{
                    lat: location.lat,
                    lng: location.lng,
                    label: location.label,
                  }}
                  hotspots={data.hotspots}
                  height={320}
                />
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="text-sm font-semibold text-white">
                    Monitoring snapshot
                  </div>
                  <div className="mt-2 text-xs text-white/60">
                    Generated at {new Date(data.generatedAt).toLocaleString()}.
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-white/60">Flood risk</div>
                      <div className="mt-1 text-white tabular-nums">
                        {data.hazards.flood.probability}%
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-white/60">Drought</div>
                      <div className="mt-1 text-white tabular-nums">
                        {data.hazards.drought.probability}%
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-white/60">Veg stress</div>
                      <div className="mt-1 text-white tabular-nums">
                        {data.hazards.veg_stress.probability}%
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-white/60">Land deg.</div>
                      <div className="mt-1 text-white tabular-nums">
                        {data.hazards.land_degradation.probability}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:col-span-7 sm:grid-cols-2">
            {indicators.map((r) => (
              <IndicatorCard key={r.key} reading={r} />
            ))}
          </div>

          <div className="lg:col-span-5">
            <RiskPanel hazards={hazards} />
          </div>

          <div className="lg:col-span-6">
            <IndexTrends data={data.trends.slice(-30)} />
          </div>
          <div className="lg:col-span-6">
            <HazardProbabilities data={data.trends.slice(-30)} />
          </div>

          <div className="lg:col-span-12 space-y-3">
            <div className="text-sm font-semibold text-white">Active Alerts</div>
            <AlertFeed alerts={data.alerts} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <LocationRequired title="Dashboard">
      <DashboardInner />
    </LocationRequired>
  );
}

