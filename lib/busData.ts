import busData from "@/data/data.json";
import type { Route, BusData } from "@/types";

const data = busData as BusData;

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

// Helper to detect if string contains Bengali characters
function containsBengali(str: string): boolean {
	return /[\u0980-\u09FF]/.test(str);
}

export function searchRoutes(query: string): Route[] {
	const q = query.trim();
	if (!q) return data.routes;

	const hasBengali = containsBengali(q);
	const qLower = q.toLowerCase();

	return data.routes.filter((r) => {
		if (hasBengali) {
			// Search in both Bengali and English
			return (
				r.code.bn.toLowerCase().includes(qLower) ||
				r.code.en.toLowerCase().includes(qLower) ||
				r.name.bn.toLowerCase().includes(qLower) ||
				r.name.en.toLowerCase().includes(qLower) ||
				r.stops.some(
					(s) => s.name.bn.toLowerCase().includes(qLower) || s.name.en.toLowerCase().includes(qLower),
				)
			);
		} else {
			// Search only in English
			return (
				r.code.en.toLowerCase().includes(qLower) ||
				r.name.en.toLowerCase().includes(qLower) ||
				r.stops.some((s) => s.name.en.toLowerCase().includes(qLower))
			);
		}
	});
}

// ─── Fare Logic ─────────────────────────────────────────
const FARE_PER_KM = 2.53; // BDT per km
const MIN_FARE = 10; // BDT

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
