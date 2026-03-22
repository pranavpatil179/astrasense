export type SelectedLocation = {
  label: string;
  lat: number;
  lng: number;
};

export function isValidLatLng(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function parseLocationFromSearchParams(
  params: URLSearchParams,
): SelectedLocation | null {
  const latRaw = params.get("lat");
  const lngRaw = params.get("lng");
  const label = (params.get("label") ?? "").trim();
  if (!latRaw || !lngRaw) return null;

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!isValidLatLng(lat, lng)) return null;

  return {
    label: label || `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
    lat,
    lng,
  };
}

const STORAGE_KEY = "astrasense:selectedLocation:v1";

export function saveLocationToStorage(loc: SelectedLocation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // ignore
  }
}

export function loadLocationFromStorage(): SelectedLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Partial<SelectedLocation>;
    if (!obj) return null;
    if (typeof obj.label !== "string") return null;
    if (!isValidLatLng(obj.lat, obj.lng)) return null;
    return { label: obj.label, lat: obj.lat, lng: obj.lng };
  } catch {
    return null;
  }
}

