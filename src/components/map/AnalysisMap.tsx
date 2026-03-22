"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap, type StyleSpecification } from "maplibre-gl";
import type { HotspotPoint, HazardKey, SimulationOutput } from "@/lib/sim/engine";

type BaseStyle = "streets" | "satellite";

const streetsStyleUrl = "https://demotiles.maplibre.org/style.json";

function satelliteStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      esri: {
        type: "raster",
        tiles: [
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution:
          'Imagery © <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a>',
      },
    },
    layers: [
      {
        id: "sat",
        type: "raster",
        source: "esri",
      },
    ],
  };
}

function toFeatureCollection(points: Array<HotspotPoint & { hazard: HazardKey }>) {
  return {
    type: "FeatureCollection" as const,
    features: points.map((p) => ({
      type: "Feature" as const,
      properties: {
        hazard: p.hazard,
        intensity: p.intensity,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [p.lng, p.lat] as [number, number],
      },
    })),
  };
}

export function AnalysisMap({
  center,
}: {
  center: { lat: number; lng: number; label?: string };
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [base, setBase] = useState<BaseStyle>("streets");
  const [hazard, setHazard] = useState<HazardKey>("flood");
  const [hotspots, setHotspots] = useState<HotspotPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hazardPoints = useMemo(() => {
    return hotspots
      .filter((h) => h.kind === hazard)
      .map((h) => ({ ...h, hazard: h.kind }));
  }, [hotspots, hazard]);

  // Fetch simulation hotspots
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/simulate?lat=${encodeURIComponent(String(center.lat))}&lng=${encodeURIComponent(
            String(center.lng),
          )}&days=60`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("simulate");
        const json = (await res.json()) as SimulationOutput;
        if (!cancelled) setHotspots(json.hotspots ?? []);
      } catch {
        if (!cancelled) {
          setHotspots([]);
          setError("Failed to load hotspot data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: streetsStyleUrl,
      center: [center.lng, center.lat],
      zoom: 7.2,
      pitch: 35,
      bearing: -12,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    markerRef.current = new maplibregl.Marker({ color: "#34d399" })
      .setLngLat([center.lng, center.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 20 }).setHTML(
          `<div style="font-weight:600">${center.label ?? "Selected location"}</div><div style="opacity:.75">${center.lat.toFixed(
            4,
          )}, ${center.lng.toFixed(4)}</div>`,
        ),
      )
      .addTo(map);

    const onLoad = () => {
      // Create empty hotspot source + heatmap layer (we'll update data later)
      map.addSource("hotspots", {
        type: "geojson",
        data: toFeatureCollection([]),
      });

      map.addLayer({
        id: "hotspot-heatmap",
        type: "heatmap",
        source: "hotspots",
        maxzoom: 12,
        paint: {
          // intensity scales the heat contribution
          "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 2, 0.8, 9, 1.35],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 2, 12, 9, 34],
          "heatmap-opacity": 0.75,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0, 0, 0, 0)",
            0.25,
            "rgba(59, 130, 246, 0.55)", // blue
            0.5,
            "rgba(249, 115, 22, 0.60)", // orange
            0.8,
            "rgba(239, 68, 68, 0.70)", // red
            1,
            "rgba(239, 68, 68, 0.92)",
          ],
        },
      });

      map.addLayer({
        id: "hotspot-points",
        type: "circle",
        source: "hotspots",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3, 10, 7],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "intensity"],
            0,
            "rgba(59, 130, 246, 0.65)",
            0.5,
            "rgba(249, 115, 22, 0.70)",
            1,
            "rgba(239, 68, 68, 0.85)",
          ],
          "circle-stroke-color": "rgba(255,255,255,0.22)",
          "circle-stroke-width": 1,
          "circle-opacity": 0.9,
        },
      });
    };

    map.on("load", onLoad);

    return () => {
      map.off("load", onLoad);
      map.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lng, center.label]);

  // Update marker/center when location changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current?.setLngLat([center.lng, center.lat]);
    map.easeTo({ center: [center.lng, center.lat], zoom: 7.2, duration: 900 });
  }, [center.lat, center.lng]);

  // Update base style (streets/satellite)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const style = base === "streets" ? streetsStyleUrl : satelliteStyle();
    const centerLL = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();

    map.setStyle(style as unknown as StyleSpecification);

    map.once("styledata", () => {
      map.jumpTo({ center: centerLL, zoom, pitch, bearing });
      // Re-add sources/layers on style change
      if (!map.getSource("hotspots")) {
        map.addSource("hotspots", { type: "geojson", data: toFeatureCollection([]) });
      }
      if (!map.getLayer("hotspot-heatmap")) {
        map.addLayer({
          id: "hotspot-heatmap",
          type: "heatmap",
          source: "hotspots",
          maxzoom: 12,
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 2, 0.8, 9, 1.35],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 2, 12, 9, 34],
            "heatmap-opacity": 0.75,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0, 0, 0, 0)",
              0.25,
              "rgba(59, 130, 246, 0.55)",
              0.5,
              "rgba(249, 115, 22, 0.60)",
              0.8,
              "rgba(239, 68, 68, 0.70)",
              1,
              "rgba(239, 68, 68, 0.92)",
            ],
          },
        });
      }
      if (!map.getLayer("hotspot-points")) {
        map.addLayer({
          id: "hotspot-points",
          type: "circle",
          source: "hotspots",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3, 10, 7],
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "intensity"],
              0,
              "rgba(59, 130, 246, 0.65)",
              0.5,
              "rgba(249, 115, 22, 0.70)",
              1,
              "rgba(239, 68, 68, 0.85)",
            ],
            "circle-stroke-color": "rgba(255,255,255,0.22)",
            "circle-stroke-width": 1,
            "circle-opacity": 0.9,
          },
        });
      }

      markerRef.current?.addTo(map);
    });
  }, [base]);

  // Update hotspot data when hazard changes or new hotspots arrive
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource("hotspots") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData(toFeatureCollection(hazardPoints));
  }, [hazardPoints]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div ref={containerRef} className="h-[72vh] min-h-[520px] w-full" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white/70 backdrop-blur">
          <div className="font-semibold text-white">Risk Heatmap Overlay</div>
          <div className="mt-1">
            Blue: low • Orange: medium • Red: high
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">Base layers</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBase("streets")}
              className={[
                "rounded-xl px-3 py-2 text-sm ring-1 transition",
                base === "streets"
                  ? "bg-white/10 text-white ring-white/15"
                  : "bg-black/20 text-white/70 ring-white/10 hover:bg-white/5",
              ].join(" ")}
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => setBase("satellite")}
              className={[
                "rounded-xl px-3 py-2 text-sm ring-1 transition",
                base === "satellite"
                  ? "bg-white/10 text-white ring-white/15"
                  : "bg-black/20 text-white/70 ring-white/10 hover:bg-white/5",
              ].join(" ")}
            >
              Satellite
            </button>
          </div>
          <div className="mt-3 text-xs text-white/55">
            Satellite imagery uses a public raster tile service for demo
            purposes.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">Monitoring layer</div>
          <div className="mt-3 grid gap-2">
            {(
              [
                ["flood", "Flood risk zones"],
                ["drought", "Drought-prone regions"],
                ["veg_stress", "Vegetation stress"],
                ["land_degradation", "Land degradation"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setHazard(k)}
                className={[
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm ring-1 transition",
                  hazard === k
                    ? "bg-cyan-400/10 text-white ring-cyan-300/20"
                    : "bg-black/20 text-white/70 ring-white/10 hover:bg-white/5",
                ].join(" ")}
              >
                <span>{label}</span>
                <span className="text-xs text-white/50">{k}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/65">
            {loading ? (
              <div>Loading hotspot grid…</div>
            ) : error ? (
              <div className="text-rose-200">{error}</div>
            ) : (
              <div>
                Showing <span className="text-white">{hazardPoints.length}</span>{" "}
                hotspot points for <span className="text-white">{hazard}</span>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

