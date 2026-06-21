import type { Route, Stop } from "@/types";
import type { FareSettings } from "@/hooks/store";

export interface ConnectingLeg {
  route: Route;
  fromStop: string;
  toStop: string;
  distance: string;
  fare: number;
  /** stops along this leg, from→transfer or transfer→to */
  path: Stop[];
}

export interface ConnectingRoute {
  leg1: ConnectingLeg;
  leg2: ConnectingLeg;
  transferStop: string;
  totalFare: number;
  totalDistance: string;
}

function calcFare(distKm: number, settings: FareSettings): number {
  const raw = distKm * settings.farePerKm;
  return Math.max(settings.minFare, Math.ceil(raw / 5) * 5);
}

function buildLeg(
  route: Route,
  fromStopName: string,
  toStopName: string,
  settings: FareSettings,
): ConnectingLeg | null {
  const fromIdx = route.stops.findIndex((s) => s.name.en === fromStopName);
  const toIdx = route.stops.findIndex((s) => s.name.en === toStopName);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return null;

  const dist = Math.abs(route.stops[toIdx].distance - route.stops[fromIdx].distance);
  const fare = calcFare(dist, settings);

  const startIdx = Math.min(fromIdx, toIdx);
  const endIdx = Math.max(fromIdx, toIdx);
  const path = route.stops.slice(startIdx, endIdx + 1);
  const pathSorted = fromIdx < toIdx ? path : [...path].reverse();

  return {
    route,
    fromStop: fromStopName,
    toStop: toStopName,
    distance: dist.toFixed(1),
    fare,
    path: pathSorted,
  };
}

/**
 * Find connecting (1-transfer) routes between fromStop and toStop.
 * Returns up to `limit` options sorted by lowest total fare.
 */
export function findConnectingRoutes(
  fromStop: string,
  toStop: string,
  routes: Route[],
  settings: FareSettings,
  limit = 5,
): ConnectingRoute[] {
  // Routes that contain the from stop
  const fromRoutes = routes.filter((r) =>
    r.stops.some((s) => s.name.en === fromStop),
  );
  // Routes that contain the to stop (index them by stop for fast lookup)
  const toRoutesByStop = new Map<string, Route[]>();
  for (const r of routes) {
    if (!r.stops.some((s) => s.name.en === toStop)) continue;
    for (const s of r.stops) {
      if (s.name.en === fromStop || s.name.en === toStop) continue;
      const arr = toRoutesByStop.get(s.name.en) ?? [];
      arr.push(r);
      toRoutesByStop.set(s.name.en, arr);
    }
  }

  const seen = new Set<string>();
  const results: ConnectingRoute[] = [];

  for (const r1 of fromRoutes) {
    for (const stop of r1.stops) {
      const transferName = stop.name.en;
      if (transferName === fromStop || transferName === toStop) continue;

      const toRoutes = toRoutesByStop.get(transferName);
      if (!toRoutes) continue;

      for (const r2 of toRoutes) {
        // Avoid using same route twice (must be a real transfer)
        if (r1.code.en === r2.code.en) continue;

        const key = `${r1.code.en}|${transferName}|${r2.code.en}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const leg1 = buildLeg(r1, fromStop, transferName, settings);
        const leg2 = buildLeg(r2, transferName, toStop, settings);
        if (!leg1 || !leg2) continue;

        const totalDist = parseFloat(leg1.distance) + parseFloat(leg2.distance);

        results.push({
          leg1,
          leg2,
          transferStop: transferName,
          totalFare: leg1.fare + leg2.fare,
          totalDistance: totalDist.toFixed(1),
        });
      }
    }
  }

  return results.sort((a, b) => a.totalFare - b.totalFare).slice(0, limit);
}
