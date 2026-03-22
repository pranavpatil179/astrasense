import { NextResponse } from "next/server";
import { simulateEnvironment } from "@/lib/sim/engine";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  const daysRaw = searchParams.get("days");

  const lat = latRaw ? Number(latRaw) : NaN;
  const lng = lngRaw ? Number(lngRaw) : NaN;
  const days = daysRaw ? Number(daysRaw) : undefined;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng." },
      { status: 400 },
    );
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: "lat/lng out of range." },
      { status: 400 },
    );
  }

  const payload = simulateEnvironment({ lat, lng, days });
  return NextResponse.json(payload, {
    headers: { "cache-control": "no-store" },
  });
}

