import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OpenCageResponse = {
  results: Array<{
    formatted?: string;
    geometry?: { lat: number; lng: number };
    components?: Record<string, unknown>;
  }>;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'." },
      { status: 400 },
    );
  }

  const key = process.env.OPENCAGE_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Server is missing OPENCAGE_API_KEY. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  const url = new URL("https://api.opencagedata.com/geocode/v1/json");
  url.searchParams.set("q", q);
  url.searchParams.set("key", key);
  url.searchParams.set("no_annotations", "1");
  url.searchParams.set("limit", "8");

  let json: OpenCageResponse;
  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `OpenCage request failed (${res.status}).` },
        { status: 502 },
      );
    }
    json = (await res.json()) as OpenCageResponse;
  } catch {
    return NextResponse.json(
      { error: "Failed to reach OpenCage." },
      { status: 502 },
    );
  }

  const suggestions = (json.results ?? [])
    .map((r) => {
      const lat = r.geometry?.lat;
      const lng = r.geometry?.lng;
      const label = r.formatted ?? "";
      if (typeof lat !== "number" || typeof lng !== "number" || !label) return null;
      return { label, lat, lng, components: r.components ?? {} };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .slice(0, 6);

  return NextResponse.json({ suggestions });
}

