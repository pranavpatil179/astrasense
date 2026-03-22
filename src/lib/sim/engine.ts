export type IndexKey = "ndvi" | "ndwi" | "lst" | "evi";
export type HazardKey = "flood" | "drought" | "veg_stress" | "land_degradation";

export type IndexReading = {
  key: IndexKey;
  label: string;
  value: number;
  unit?: string;
  status: "low" | "moderate" | "high";
  description: string;
};

export type HazardPrediction = {
  key: HazardKey;
  label: string;
  probability: number; // 0-100
  severity: "low" | "medium" | "high";
  explanation: string;
};

export type AlertItem = {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical";
  message: string;
  createdAt: string;
};

export type TrendPoint = {
  t: string; // ISO date
  ndvi: number;
  ndwi: number;
  evi: number;
  lst: number;
  flood: number;
  drought: number;
  veg_stress: number;
  land_degradation: number;
};

export type HotspotPoint = {
  lat: number;
  lng: number;
  kind: HazardKey;
  intensity: number; // 0-1
};

export type SimulationOutput = {
  generatedAt: string;
  location: { lat: number; lng: number };
  indices: Record<IndexKey, IndexReading>;
  hazards: Record<HazardKey, HazardPrediction>;
  alerts: AlertItem[];
  trends: TrendPoint[];
  hotspots: HotspotPoint[];
};

function clamp(x: number, a: number, b: number) {
  return Math.min(b, Math.max(a, x));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function fract(x: number) {
  return x - Math.floor(x);
}

function hash2(a: number, b: number) {
  // deterministic pseudo-random in [0,1)
  return fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
}

function noise2(lat: number, lng: number, k: number) {
  return hash2(lat * 0.1 + k * 17.13, lng * 0.1 - k * 9.21);
}

function seasonalFactor(lat: number, date: Date) {
  // approximate: sine wave, phase flips across equator
  const month = date.getUTCMonth(); // 0..11
  const t = (month / 12) * Math.PI * 2;
  const hemi = lat >= 0 ? 1 : -1;
  return Math.sin(t - hemi * Math.PI / 3);
}

function toSeverity(p: number): "low" | "medium" | "high" {
  if (p >= 70) return "high";
  if (p >= 40) return "medium";
  return "low";
}

function toIndexStatus(
  key: IndexKey,
  value: number,
): "low" | "moderate" | "high" {
  if (key === "lst") {
    if (value >= 35) return "high";
    if (value >= 25) return "moderate";
    return "low";
  }
  // NDVI/NDWI/EVI normalized [0,1] where higher is better (for our UI)
  if (value >= 0.66) return "high";
  if (value >= 0.33) return "moderate";
  return "low";
}

export function simulateEnvironment(args: {
  lat: number;
  lng: number;
  now?: Date;
  days?: number;
}): SimulationOutput {
  const now = args.now ?? new Date();
  const days = clamp(Math.floor(args.days ?? 60), 14, 180);
  const lat = args.lat;
  const lng = args.lng;

  const season = seasonalFactor(lat, now); // -1..1
  const coastalness = smoothstep(0.2, 0.8, noise2(lat, lng, 1)); // proxy for water adjacency
  const elevationProxy = noise2(lat, lng, 2); // 0..1
  const aridityBase = smoothstep(0.25, 0.85, noise2(lat, lng, 3)); // 0..1

  // Indices (current)
  // NDVI/EVI: better when season favorable and aridity low
  const greenBoost = 0.55 + 0.25 * season - 0.35 * aridityBase + 0.08 * (1 - elevationProxy);
  const ndvi = clamp(greenBoost + (noise2(lat, lng, 10) - 0.5) * 0.12, 0.02, 0.92);
  const evi = clamp(ndvi * 0.92 + 0.06 + (noise2(lat, lng, 11) - 0.5) * 0.10, 0.02, 0.95);

  // NDWI: higher when coastalness high and season wet; lower when arid
  const wetness = 0.42 + 0.18 * season + 0.25 * coastalness - 0.35 * aridityBase;
  const ndwi = clamp(wetness + (noise2(lat, lng, 12) - 0.5) * 0.14, 0.01, 0.95);

  // LST (°C): higher near arid regions; seasonality + latitude band
  const latBand = 1 - smoothstep(10, 65, Math.abs(lat)); // warmer near equator
  const lst =
    18 +
    12 * latBand +
    10 * aridityBase -
    2.5 * season +
    (noise2(lat, lng, 13) - 0.5) * 3.5;
  const lstC = clamp(lst, 5, 48);

  // Risk primitives
  const dryness = clamp(1 - ndwi, 0, 1);
  const heat = clamp((lstC - 18) / 26, 0, 1);
  const vegWeak = clamp(1 - ndvi, 0, 1);

  const rainfallProxy = clamp(0.35 + 0.25 * season + 0.25 * coastalness - 0.2 * aridityBase, 0, 1);
  const floodBase = clamp(0.55 * ndwi + 0.35 * rainfallProxy + 0.15 * (1 - elevationProxy), 0, 1);
  const droughtBase = clamp(0.6 * dryness + 0.45 * heat + 0.15 * aridityBase, 0, 1);
  const vegStressBase = clamp(0.55 * vegWeak + 0.35 * heat + 0.15 * dryness, 0, 1);
  const landDegBase = clamp(0.45 * dryness + 0.35 * vegWeak + 0.25 * aridityBase, 0, 1);

  const floodP = clamp(Math.round(100 * floodBase), 0, 100);
  const droughtP = clamp(Math.round(100 * droughtBase), 0, 100);
  const vegStressP = clamp(Math.round(100 * vegStressBase), 0, 100);
  const landDegP = clamp(Math.round(100 * landDegBase), 0, 100);

  const indices: SimulationOutput["indices"] = {
    ndvi: {
      key: "ndvi",
      label: "NDVI – Vegetation Health",
      value: Number(ndvi.toFixed(2)),
      status: toIndexStatus("ndvi", ndvi),
      description: "Higher indicates healthier vegetation canopy.",
    },
    ndwi: {
      key: "ndwi",
      label: "NDWI – Water Content",
      value: Number(ndwi.toFixed(2)),
      status: toIndexStatus("ndwi", ndwi),
      description: "Higher indicates greater surface moisture / water content.",
    },
    lst: {
      key: "lst",
      label: "LST – Land Surface Temperature",
      value: Number(lstC.toFixed(1)),
      unit: "°C",
      status: toIndexStatus("lst", lstC),
      description: "Thermal proxy; elevated LST can amplify drought/stress.",
    },
    evi: {
      key: "evi",
      label: "EVI – Enhanced Vegetation Index",
      value: Number(evi.toFixed(2)),
      status: toIndexStatus("evi", evi),
      description: "Vegetation signal with improved sensitivity over dense areas.",
    },
  };

  const hazards: SimulationOutput["hazards"] = {
    flood: {
      key: "flood",
      label: "Flood Risk",
      probability: floodP,
      severity: toSeverity(floodP),
      explanation: `Moisture index (NDWI ${indices.ndwi.value}) and rainfall proxy indicate ${floodP >= 70 ? "high" : floodP >= 40 ? "moderate" : "low"} water accumulation potential.`,
    },
    drought: {
      key: "drought",
      label: "Drought Probability",
      probability: droughtP,
      severity: toSeverity(droughtP),
      explanation: `Low water content (NDWI ${indices.ndwi.value}) combined with elevated temperature (LST ${indices.lst.value}${indices.lst.unit}) drives dryness risk.`,
    },
    veg_stress: {
      key: "veg_stress",
      label: "Vegetation Stress",
      probability: vegStressP,
      severity: toSeverity(vegStressP),
      explanation: `Vegetation indices (NDVI ${indices.ndvi.value}, EVI ${indices.evi.value}) plus heat/dryness signal stress conditions.`,
    },
    land_degradation: {
      key: "land_degradation",
      label: "Land Degradation Risk",
      probability: landDegP,
      severity: toSeverity(landDegP),
      explanation: `Persistent dryness and reduced vegetation cover can increase soil exposure and degradation likelihood.`,
    },
  };

  const alerts: AlertItem[] = [];
  const createdAt = now.toISOString();
  const seed = Math.floor((lat + 90) * 1000 + (lng + 180));
  if (hazards.flood.probability >= 70) {
    alerts.push({
      id: `flood-${seed}`,
      title: "High Flood Risk Detected",
      severity: "critical",
      message: "Moisture and rainfall proxies suggest high flood susceptibility. Review low-lying zones and waterways.",
      createdAt,
    });
  } else if (hazards.flood.probability >= 45) {
    alerts.push({
      id: `flood-${seed}`,
      title: "Moderate Flood Risk",
      severity: "warning",
      message: "Conditions indicate moderate flood potential. Monitor drainage basins and recent precipitation signals.",
      createdAt,
    });
  }

  if (hazards.drought.probability >= 70) {
    alerts.push({
      id: `drought-${seed}`,
      title: "Severe Drought Probability",
      severity: "critical",
      message: "Low moisture with high surface temperature indicates severe drought probability. Monitor water supply and crop stress.",
      createdAt,
    });
  } else if (hazards.drought.probability >= 45) {
    alerts.push({
      id: `drought-${seed}`,
      title: "Moderate Drought Probability",
      severity: "warning",
      message: "Dryness signals are rising. Consider targeted monitoring for soil moisture decline and heat anomalies.",
      createdAt,
    });
  }

  if (hazards.veg_stress.probability >= 65) {
    alerts.push({
      id: `veg-${seed}`,
      title: "Vegetation Stress Increasing",
      severity: hazards.veg_stress.probability >= 80 ? "critical" : "warning",
      message: "Vegetation indices indicate elevated stress. Cross-check LST anomalies and irrigation availability.",
      createdAt,
    });
  }

  // Trends: backfill simulated series with mild continuity
  const trends: TrendPoint[] = [];
  let ndviT = ndvi;
  let ndwiT = ndwi;
  let eviT = evi;
  let lstT = lstC;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    const s = seasonalFactor(lat, d);
    const drift = (noise2(lat, lng, 30 + i) - 0.5) * 0.03;

    ndviT = clamp(ndviT + 0.015 * s - 0.01 * aridityBase + drift, 0.02, 0.95);
    eviT = clamp(eviT + 0.012 * s - 0.008 * aridityBase + drift * 0.8, 0.02, 0.98);
    ndwiT = clamp(ndwiT + 0.012 * s + 0.006 * coastalness - 0.012 * aridityBase + drift, 0.01, 0.98);
    lstT = clamp(
      lstT +
        0.35 * (aridityBase - 0.45) +
        0.6 * (0.3 - s) +
        (noise2(lat, lng, 80 + i) - 0.5) * 0.6,
      5,
      49,
    );

    const drynessT = clamp(1 - ndwiT, 0, 1);
    const heatT = clamp((lstT - 18) / 26, 0, 1);
    const vegWeakT = clamp(1 - ndviT, 0, 1);

    const rainfallT = clamp(
      0.35 + 0.25 * s + 0.25 * coastalness - 0.2 * aridityBase,
      0,
      1,
    );
    const floodT = clamp(0.55 * ndwiT + 0.35 * rainfallT + 0.15 * (1 - elevationProxy), 0, 1);
    const droughtT = clamp(0.6 * drynessT + 0.45 * heatT + 0.15 * aridityBase, 0, 1);
    const vegStressT = clamp(0.55 * vegWeakT + 0.35 * heatT + 0.15 * drynessT, 0, 1);
    const landDegT = clamp(0.45 * drynessT + 0.35 * vegWeakT + 0.25 * aridityBase, 0, 1);

    trends.push({
      t: d.toISOString().slice(0, 10),
      ndvi: Number(ndviT.toFixed(3)),
      ndwi: Number(ndwiT.toFixed(3)),
      evi: Number(eviT.toFixed(3)),
      lst: Number(lstT.toFixed(2)),
      flood: Math.round(100 * floodT),
      drought: Math.round(100 * droughtT),
      veg_stress: Math.round(100 * vegStressT),
      land_degradation: Math.round(100 * landDegT),
    });
  }

  // Hotspots: small ring around location to visualize heatmaps/globe points
  const hotspots: HotspotPoint[] = [];
  const baseKinds: HazardKey[] = ["flood", "drought", "veg_stress", "land_degradation"];
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const r = 0.35 + (noise2(lat, lng, 200 + i) - 0.5) * 0.18; // degrees (roughly)
    const pLat = clamp(lat + Math.cos(angle) * r, -85, 85);
    const pLng = clamp(lng + Math.sin(angle) * r * (1 / Math.cos((lat * Math.PI) / 180)), -180, 180);

    const kind = baseKinds[i % baseKinds.length];
    const base =
      kind === "flood"
        ? floodBase
        : kind === "drought"
          ? droughtBase
          : kind === "veg_stress"
            ? vegStressBase
            : landDegBase;
    const localVar = (noise2(pLat, pLng, 260 + i) - 0.5) * 0.22;
    const intensity = clamp(base + localVar, 0, 1);
    if (intensity < 0.35) continue;
    hotspots.push({ lat: pLat, lng: pLng, kind, intensity: Number(intensity.toFixed(3)) });
  }

  return {
    generatedAt: now.toISOString(),
    location: { lat, lng },
    indices,
    hazards,
    alerts,
    trends,
    hotspots,
  };
}

