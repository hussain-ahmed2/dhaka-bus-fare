"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore, type FareSettings } from "./store";

export type { FareSettings };

export function useFareSettings() {
  const storeSettings = useStore((state) => state.settings);
  const setSettings = useStore((state) => state.setSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setLoaded(true);
    });
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const updateSettings = useCallback(
    (s: FareSettings) => {
      setSettings(s);
    },
    [setSettings]
  );

  const calcFare = useCallback(
    (distanceKm: number): number => {
      const raw = distanceKm * storeSettings.farePerKm;
      return Math.max(storeSettings.minFare, Math.ceil(raw / 5) * 5);
    },
    [storeSettings]
  );

  return { settings: storeSettings, updateSettings, calcFare, loaded };
}
