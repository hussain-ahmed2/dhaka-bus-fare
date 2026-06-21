import busData from "@/data/data.json";
import Fuse from "fuse.js";
import type { Route, BusData } from "@/types";

const data = busData as BusData;

let fuseInstance: Fuse<Route> | null = null;

function getFuse(): Fuse<Route> {
	if (!fuseInstance) {
		fuseInstance = new Fuse(data.routes, {
			keys: [
				{ name: "code.en", weight: 2 },
				{ name: "code.bn", weight: 2 },
				{ name: "name.en", weight: 1.5 },
				{ name: "name.bn", weight: 1.5 },
				{ name: "stops.name.en", weight: 1 },
				{ name: "stops.name.bn", weight: 1 },
			],
			threshold: 0.4,
			ignoreLocation: true,
			minMatchCharLength: 1,
		});
	}
	return fuseInstance;
}

// ─── Queries ────────────────────────────────────────────
export function getAllRoutes(): Route[] {
	return data.routes;
}

export function getRouteBySlug(slug: string): Route | undefined {
	return data.routes.find((r) => routeToSlug(r) === slug.toLowerCase());
}

export function routeToSlug(route: Route): string {
	return route.code.en.toLowerCase().replace(/\s/g, "-");
}

export function searchRoutes(query: string): Route[] {
	const q = query.trim();
	if (!q) return data.routes;

	return getFuse()
		.search(q)
		.map((r) => r.item);
}

// ─── Fare Logic ─────────────────────────────────────────
export const FARE_PER_KM = 2.53; // BDT per km
export const MIN_FARE = 10; // BDT

export function calculateFare(distanceKm: number): number {
	const raw = distanceKm * FARE_PER_KM;
	return Math.max(MIN_FARE, Math.ceil(raw / 5) * 5); // round to nearest 5 BDT
}

export function getFareBetweenStops(route: Route, fromIndex: number, toIndex: number): number {
	const distance = Math.abs(route.stops[toIndex].distance - route.stops[fromIndex].distance);
	return calculateFare(distance);
}

// ─── Stats ─────────────────────────────────────────────
export function getTotalUniqueStops(): number {
	return new Set(getAllRoutes().flatMap((r) => r.stops.map((s) => s.name.en))).size;
}
