"use client";

import { LocationRequired } from "@/components/location/LocationRequired";
import { useSelectedLocation } from "@/components/location/useSelectedLocation";
import { AnalysisMap } from "@/components/map/AnalysisMap";

function MapInner() {
  const { location } = useSelectedLocation();
  if (!location) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Map Analysis</h2>
        <p className="text-sm text-white/60">
          Centered on{" "}
          <span className="text-white/80">{location.label}</span>
        </p>
      </div>

      <AnalysisMap
        center={{ lat: location.lat, lng: location.lng, label: location.label }}
      />
    </div>
  );
}

export default function MapAnalysisPage() {
  return (
    <LocationRequired title="Map Analysis">
      <MapInner />
    </LocationRequired>
  );
}

