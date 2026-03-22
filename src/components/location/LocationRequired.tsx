"use client";

import Link from "next/link";
import { useSelectedLocation } from "@/components/location/useSelectedLocation";

export function LocationRequired({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { location } = useSelectedLocation();

  if (!location) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-white/70">
            Select a location to begin environmental risk analysis.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-400/20 px-4 text-sm font-medium text-cyan-50 ring-1 ring-cyan-300/25 transition hover:bg-cyan-400/25"
            >
              Search a location
            </Link>
            <Link
              href="/dashboard?lat=19.0760&lng=72.8777&label=Mumbai"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/70 backdrop-blur transition hover:bg-white/10"
            >
              Use example: Mumbai
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

