"use client";

import { LocationRequired } from "@/components/location/LocationRequired";
import { useSelectedLocation } from "@/components/location/useSelectedLocation";
import { AlertCenter } from "@/components/alerts/AlertCenter";

function AlertsInner() {
  const { location } = useSelectedLocation();
  if (!location) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Alert Center</h2>
        <p className="text-sm text-white/60">
          Monitoring{" "}
          <span className="text-white/80">{location.label}</span>
        </p>
      </div>

      <AlertCenter lat={location.lat} lng={location.lng} />
    </div>
  );
}

export default function AlertCenterPage() {
  return (
    <LocationRequired title="Alert Center">
      <AlertsInner />
    </LocationRequired>
  );
}

