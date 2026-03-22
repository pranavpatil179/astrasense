"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  loadLocationFromStorage,
  parseLocationFromSearchParams,
  saveLocationToStorage,
  type SelectedLocation,
} from "@/lib/location";

export function useSelectedLocation() {
  const searchParams = useSearchParams();
  const parsed = useMemo(() => {
    if (!searchParams) return null;
    return parseLocationFromSearchParams(searchParams);
  }, [searchParams]);

  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [source, setSource] = useState<"url" | "storage" | "none">("none");

  useEffect(() => {
    if (parsed) {
      setLocation(parsed);
      setSource("url");
      saveLocationToStorage(parsed);
      return;
    }
    const stored = loadLocationFromStorage();
    if (stored) {
      setLocation(stored);
      setSource("storage");
    } else {
      setLocation(null);
      setSource("none");
    }
  }, [parsed]);

  return { location, source };
}

