import Link from "next/link";
import { LocationSearch } from "@/components/location/LocationSearch";
import { GlobalGlobe } from "@/components/globe/GlobalGlobe";

export default function Home() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
            Satellite-derived indices • AI risk simulation • Global monitoring
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
            ASTRASENSE – AI Powered Environmental Risk Detection
          </h1>

          <p className="max-w-2xl text-pretty text-base leading-7 text-white/70 md:text-lg">
            ASTRASENSE simulates an advanced environmental intelligence system
            that analyzes satellite indicators (NDVI, NDWI, LST, EVI) to predict
            hazards like floods, droughts, vegetation stress, and land
            degradation for any location on Earth.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-white">
                  Search a location
                </div>
                <div className="text-sm text-white/60">
                  City, region, or coordinates (lat, lng)
                </div>
              </div>
              <LocationSearch />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/map"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur transition hover:bg-white/10"
            >
              Explore Map Analysis
            </Link>
            <Link
              href="/alerts"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur transition hover:bg-white/10"
            >
              Open Alert Center
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur transition hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </div>

        <div className="relative">
          <GlobalGlobe height={460} />
        </div>
      </div>
    </section>
  );
}
