import busData from "@/data/data.json";
import busesData from "@/data/buses.json";
import Fuse from "fuse.js";
import type { Route, BusData, BusOperator } from "@/types";

const data = busData as BusData;
const buses = (busesData as { buses: BusOperator[] }).buses;

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
export const stopTranslations: Record<string, string> = {};

// 1. Populate from global routes
data.routes.forEach((r) => {
	r.stops.forEach((s) => {
		stopTranslations[s.name.en] = s.name.bn;
	});
});

// 2. Populate from bus operators routes
buses.forEach((bus) => {
	if (bus.routes && bus.routes.en && bus.routes.bn) {
		const bnMap = new Map<number, string>();
		bus.routes.bn.forEach((s) => {
			bnMap.set(s.sortOrder, s.name);
		});
		bus.routes.en.forEach((s, idx) => {
			const bnName = bnMap.get(s.sortOrder) || (bus.routes.bn[idx] ? bus.routes.bn[idx].name : null);
			if (bnName) {
				if (!stopTranslations[s.name]) {
					stopTranslations[s.name] = bnName;
				}
			}
		});
	}
});

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

// ─── Bus Operator Overlap Matching ──────────────────────
function normalizeStopName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[\s-]/g, "")
		.replace(/[\(\)]/g, "")
		.trim();
}

export function getBusesForRoute(route: Route): BusOperator[] {
	const routeStops = new Set(route.stops.map((s) => normalizeStopName(s.name.en)));
	const matches: BusOperator[] = [];

	for (const bus of buses) {
		if (!bus.routes || !bus.routes.en) continue;

		const busStops = bus.routes.en.map((s) => normalizeStopName(s.name));
		const sharedStops = busStops.filter((s) => routeStops.has(s));

		const minStopsCount = Math.min(routeStops.size, busStops.length);
		const overlapRatio = sharedStops.length / minStopsCount;

		if (sharedStops.length >= 3 && overlapRatio >= 0.35) {
			matches.push(bus);
		}
	}

	return matches;
}

export function getBusesBetweenStopsOnRoute(route: Route, fromStop: string, toStop: string): BusOperator[] {
	const routeBuses = getBusesForRoute(route);
	const normFrom = normalizeStopName(fromStop);
	const normTo = normalizeStopName(toStop);

	return routeBuses.filter((bus) => {
		const busStops = bus.routes.en.map((s) => normalizeStopName(s.name));
		return busStops.includes(normFrom) && busStops.includes(normTo);
	});
}

export function getAllBuses(): BusOperator[] {
	return buses;
}

export function getAllBusStops(): string[] {
	const stopsSet = new Set<string>();
	for (const bus of buses) {
		if (bus.routes && bus.routes.en) {
			bus.routes.en.forEach((s) => stopsSet.add(s.name));
		}
	}
	return Array.from(stopsSet).sort();
}

export function estimateDistanceBetweenStops(fromStop: string, toStop: string): number {
	const normFrom = normalizeStopName(fromStop);
	const normTo = normalizeStopName(toStop);

	for (const r of data.routes) {
		const fromIdx = r.stops.findIndex((s) => normalizeStopName(s.name.en) === normFrom);
		const toIdx = r.stops.findIndex((s) => normalizeStopName(s.name.en) === normTo);

		if (fromIdx !== -1 && toIdx !== -1) {
			return Math.abs(r.stops[toIdx].distance - r.stops[fromIdx].distance);
		}
	}

	return 2.0; // fallback km
}

let fuseBusesInstance: Fuse<BusOperator> | null = null;

function getBusesFuse(): Fuse<BusOperator> {
	if (!fuseBusesInstance) {
		fuseBusesInstance = new Fuse(buses, {
			keys: [
				{ name: "title.en", weight: 2 },
				{ name: "title.bn", weight: 2 },
				{ name: "service_type", weight: 1.5 },
				{ name: "routes.en.name", weight: 1 },
				{ name: "routes.bn.name", weight: 1 },
			],
			threshold: 0.4,
			ignoreLocation: true,
			minMatchCharLength: 1,
		});
	}
	return fuseBusesInstance;
}

export function searchBuses(query: string): BusOperator[] {
	const q = query.trim();
	if (!q) return [];

	return getBusesFuse()
		.search(q)
		.map((r) => r.item);
}

const POPULAR_ROUTE_CODES = [
	"A-101 No.",
	"A-102 No.",
	"A-110 No.",
	"A-114 No.",
	"A-115 No.",
	"A-122 No.",
	"A-127 No.",
	"A-129 No.",
];

export function getPopularRoutes(): Route[] {
	const popular = data.routes.filter((r) => POPULAR_ROUTE_CODES.includes(r.code.en));
	if (popular.length >= 8) return popular.slice(0, 8);
	// Fill remaining slots with other routes so we always show 8
	const popularSet = new Set(popular.map((r) => r.code.en));
	const others = data.routes.filter((r) => !popularSet.has(r.code.en));
	return [...popular, ...others].slice(0, 8);
}

export function translateServiceType(type: string, locale: string): string {
	if (locale !== "bn") return type;
	const translations: Record<string, string> = {
		"Seating Service": "সিটিং সার্ভিস",
		"Semi-Seating Service": "সেমি-সিটিং সার্ভিস",
		"Gate Lock Service": "গেট লক সার্ভিস",
		"Direct Service": "ডাইরেক্ট সার্ভিস",
		"Local Service": "লোকাল সার্ভিস",
		"Standard Service": "সাধারণ সার্ভিস",
		"Standard": "সাধারণ",
	};
	return translations[type] || type;
}





