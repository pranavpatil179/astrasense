"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { HotspotPoint, HazardKey } from "@/lib/sim/engine";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type Marker = {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
};

function colorFor(kind: HazardKey) {
  switch (kind) {
    case "flood":
      return "rgba(34,211,238,0.95)"; // cyan
    case "drought":
      return "rgba(251,191,36,0.95)"; // amber
    case "veg_stress":
      return "rgba(239,68,68,0.95)"; // red
    case "land_degradation":
    default:
      return "rgba(167,139,250,0.95)"; // violet
  }
}

export function GlobalGlobe({
  selected,
  hotspots,
  height = 420,
}: {
  selected?: { lat: number; lng: number; label?: string } | null;
  hotspots?: HotspotPoint[];
  height?: number;
}) {
  const globeRef = useRef<{
    pointOfView: (
      pov: { lat: number; lng: number; altitude: number },
      ms?: number,
    ) => void;
  } | null>(null);

  const points = useMemo(() => {
    const base: Marker[] = [];

    if (hotspots?.length) {
      for (const h of hotspots) {
        base.push({
          lat: h.lat,
          lng: h.lng,
          size: 0.08 + h.intensity * 0.24,
          color: colorFor(h.kind),
          label: `${h.kind.replace("_", " ")} hotspot`,
        });
      }
    } else {
      // Global demo hotspots when no location is selected yet
      const demo = [
        { lat: 23.0, lng: 90.4, kind: "flood" as const, intensity: 0.78 },
        { lat: -2.3, lng: 37.9, kind: "drought" as const, intensity: 0.7 },
        { lat: -15.6, lng: -47.9, kind: "veg_stress" as const, intensity: 0.62 },
        { lat: 41.8, lng: 12.5, kind: "land_degradation" as const, intensity: 0.55 },
        { lat: 34.05, lng: -118.25, kind: "drought" as const, intensity: 0.6 },
      ];
      for (const d of demo) {
        base.push({
          lat: d.lat,
          lng: d.lng,
          size: 0.12 + d.intensity * 0.22,
          color: colorFor(d.kind),
          label: `${d.kind.replace("_", " ")} hotspot`,
        });
      }
    }

    if (selected) {
      base.push({
        lat: selected.lat,
        lng: selected.lng,
        size: 0.55,
        color: "rgba(52,211,153,0.95)",
        label: selected.label ? `Selected: ${selected.label}` : "Selected location",
      });
    }

    return base;
  }, [hotspots, selected]);

  useEffect(() => {
    if (!selected) return;
    globeRef.current?.pointOfView(
      { lat: selected.lat, lng: selected.lng, altitude: 1.6 },
      1100,
    );
  }, [selected?.lat, selected?.lng, selected]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(52,211,153,0.12),transparent_55%)]" />
      <div className="relative">
        <Globe
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={globeRef as any}
          height={height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          showAtmosphere
          atmosphereColor="rgba(34,211,238,0.35)"
          atmosphereAltitude={0.22}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={(d) => (d as Marker).size}
          pointColor={(d) => (d as Marker).color}
          pointLabel={(d) => (d as Marker).label}
          pointRadius={0.18}
          animateIn
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-white/10 bg-black/30 px-4 py-3 text-xs text-white/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-300/80" />
          Flood
          <span className="ml-3 h-2 w-2 rounded-full bg-amber-300/80" />
          Drought
          <span className="ml-3 h-2 w-2 rounded-full bg-rose-300/80" />
          Vegetation stress
          <span className="ml-3 h-2 w-2 rounded-full bg-violet-300/80" />
          Land degradation
        </div>
        <div className="hidden md:block">Drag to rotate • Scroll to zoom</div>
      </div>
    </div>
  );
}

