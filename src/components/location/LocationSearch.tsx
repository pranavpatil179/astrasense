"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Suggestion = {
  label: string;
  lat: number;
  lng: number;
};

function parseCoordinateQuery(input: string): { lat: number; lng: number } | null {
  const m = input
    .trim()
    .match(
      /^(-?\d{1,3}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/,
    );
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function LocationSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const coord = useMemo(() => parseCoordinateQuery(query), [query]);

  useEffect(() => {
    setError(null);
    setActiveIndex(-1);

    const q = query.trim();
    if (q.length < 2) {
      abortRef.current?.abort();
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    // If user typed coordinates, no need to call API for suggestions.
    if (coord) {
      abortRef.current?.abort();
      setItems([
        {
          label: `Coordinates: ${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}`,
          lat: coord.lat,
          lng: coord.lng,
        },
      ]);
      setOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setOpen(true);
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = (await res.json()) as { suggestions?: Suggestion[] };
        setItems(Array.isArray(json.suggestions) ? json.suggestions : []);
        setError(null);
      } catch (e) {
        if ((e as { name?: string })?.name === "AbortError") return;
        setItems([]);
        setError("Location search failed. Try again.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query, coord]);

  function select(item: Suggestion) {
    const label = item.label;
    const lat = item.lat;
    const lng = item.lng;
    const url = `/dashboard?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(
      String(lng),
    )}&label=${encodeURIComponent(label)}`;
    setOpen(false);
    router.push(url);
  }

  return (
    <div className="relative">
      <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl focus-within:border-white/20">
        <div className="h-2.5 w-2.5 rounded-full bg-cyan-300/80 shadow-[0_0_18px_rgba(34,211,238,0.6)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, items.length - 1));
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const item =
                items[activeIndex] ?? (items.length === 1 ? items[0] : null);
              if (item) select(item);
              return;
            }
          }}
          placeholder="Search city, region, or lat, lng"
          className="h-10 w-full bg-transparent text-base text-white outline-none placeholder:text-white/40"
          aria-label="Search location"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
          ) : null}
          <button
            type="button"
            onClick={() => {
              const item = items[0];
              if (item) select(item);
            }}
            className="hidden h-10 items-center justify-center rounded-xl bg-cyan-400/20 px-4 text-sm font-medium text-cyan-50 ring-1 ring-cyan-300/25 transition hover:bg-cyan-400/25 md:inline-flex"
          >
            Analyze
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-white/55">
        {error ? <span className="text-rose-200">{error}</span> : null}
        {!error && query.trim().length === 0 ? (
          <span>Examples: “Mumbai”, “California”, “19.0760, 72.8777”.</span>
        ) : null}
      </div>

      {open && items.length > 0 ? (
        <div
          className="absolute z-50 mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl"
          role="listbox"
        >
          {items.map((item, idx) => (
            <button
              key={`${item.lat}:${item.lng}:${item.label}`}
              type="button"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => select(item)}
              className={[
                "flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition",
                idx === activeIndex ? "bg-white/10" : "hover:bg-white/5",
              ].join(" ")}
              role="option"
              aria-selected={idx === activeIndex}
            >
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
              <span className="flex-1">
                <span className="block text-white">{item.label}</span>
                <span className="block text-xs text-white/55">
                  {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

