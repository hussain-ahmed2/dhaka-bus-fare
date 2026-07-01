"use client";

import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Route, Stop } from "@/types";
import { useLocale } from "next-intl";
import { Map as MapIcon, MapPin, Loader2 } from "lucide-react";

// Sub-component to fit bounds
function FitBounds({ coords, routeId }: { coords: [number, number][], routeId: string }) {
	const map = useMap();
	useEffect(() => {
		if (coords.length > 0) {
			const bounds = L.latLngBounds(coords);
			map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map, routeId]);
	return null;
}

// Sub-component to fix hidden tab rendering issues
function InvalidateSize() {
	const map = useMap();
	useEffect(() => {
		const timeout = setTimeout(() => {
			map.invalidateSize();
		}, 250);
		return () => clearTimeout(timeout);
	}, [map]);
	return null;
}

export default function BusRouteMap({
	route,
	fromIdx,
	toIdx,
}: {
	route: Route;
	fromIdx: number | null;
	toIdx: number | null;
}) {
	const locale = useLocale();
	const [isDark, setIsDark] = useState(false);
	const [curvedPath, setCurvedPath] = useState<[number, number][] | null>(null);
	const [isFetchingCurve, setIsFetchingCurve] = useState(false);

	useEffect(() => {
		const checkTheme = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};
		checkTheme();
		const observer = new MutationObserver(checkTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	// Filter stops that have coordinates
	const validStops = route.stops
		.map((stop, index) => ({ stop, index }))
		.filter((item) => item.stop.lat !== undefined && item.stop.lng !== undefined) as {
		stop: Stop & { lat: number; lng: number };
		index: number;
	}[];

	const coords: [number, number][] = useMemo(() => validStops.map((s) => [s.stop.lat, s.stop.lng]), [validStops]);

	// Fetch curved path from OSRM
	useEffect(() => {
		if (coords.length < 2) return;
		let isMounted = true;
		
		const fetchOSRM = async () => {
			setIsFetchingCurve(true);
			try {
				const coordString = coords.map(c => `${c[1]},${c[0]}`).join(";");
				const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
				
				const res = await fetch(url);
				if (!res.ok) throw new Error("OSRM error");
				
				const data = await res.json();
				if (data.routes && data.routes.length > 0 && isMounted) {
					// OSRM returns [lng, lat], Leaflet expects [lat, lng]
					const geometry = data.routes[0].geometry.coordinates;
					const path: [number, number][] = geometry.map((c: [number, number]) => [c[1], c[0]]);
					setCurvedPath(path);
				}
			} catch (error) {
				console.error("Failed to fetch curved route", error);
			} finally {
				if (isMounted) setIsFetchingCurve(false);
			}
		};

		fetchOSRM();
		return () => { isMounted = false; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [route.name.en]); // Re-fetch only when route changes

	// Helper to find closest point on curve
	const getClosestIndex = (path: [number, number][], lat: number, lng: number) => {
		let minD = Infinity;
		let minI = 0;
		for (let i = 0; i < path.length; i++) {
			const d = Math.pow(path[i][0] - lat, 2) + Math.pow(path[i][1] - lng, 2);
			if (d < minD) {
				minD = d;
				minI = i;
			}
		}
		return minI;
	};

	// Highlight logic
	const isSelected = (index: number) => {
		if (fromIdx === null || toIdx === null) return false;
		const min = Math.min(fromIdx, toIdx);
		const max = Math.max(fromIdx, toIdx);
		return index >= min && index <= max;
	};

	const hasSelection = fromIdx !== null && toIdx !== null;

	const displayPath = curvedPath || coords;
	let selectedPath: [number, number][] = [];

	if (hasSelection) {
		const fromStop = validStops.find((s) => s.index === fromIdx)?.stop;
		const toStop = validStops.find((s) => s.index === toIdx)?.stop;
		
		if (fromStop && toStop) {
			if (curvedPath) {
				const startI = getClosestIndex(curvedPath, fromStop.lat, fromStop.lng);
				const endI = getClosestIndex(curvedPath, toStop.lat, toStop.lng);
				const minI = Math.min(startI, endI);
				const maxI = Math.max(startI, endI);
				selectedPath = curvedPath.slice(minI, maxI + 1);
			} else {
				// Fallback to straight lines for selection
				selectedPath = validStops.filter((s) => isSelected(s.index)).map((s) => [s.stop.lat, s.stop.lng]);
			}
		}
	}

	if (validStops.length < 2) {
		return (
			<div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 min-h-[400px] rounded-2xl border-2 border-dashed border-primary/20">
				<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
					<MapIcon className="h-6 w-6 text-primary opacity-50" />
				</div>
				<p className="text-sm font-semibold text-foreground">Map Data Unavailable</p>
				<p className="text-xs text-muted-foreground mt-1 max-w-[250px] text-center">
					We don&apos;t have accurate geographic coordinates for the stops on this route yet.
				</p>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full min-h-[400px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-sm border border-border">
			<style>{`
				.bus-tooltip {
					background: var(--popover) !important;
					color: var(--popover-foreground) !important;
					border: 1px solid var(--border) !important;
					border-radius: calc(var(--radius) - 2px) !important;
					padding: 4px 8px !important;
					font-size: 10px !important;
					font-weight: 700 !important;
					letter-spacing: 0.025em !important;
					box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
					font-family: inherit !important;
				}
				.bus-tooltip::before {
					display: none !important;
				}
				.dark .bus-tooltip {
					box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
				}
			`}</style>
			<MapContainer
				center={coords[Math.floor(coords.length / 2)]}
				zoom={12}
				style={{ width: "100%", height: "100%", zIndex: 1 }}
				zoomControl={true}
				attributionControl={false}
			>
				<TileLayer
					key={isDark ? "dark" : "light"}
					url={
						isDark
							? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
							: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
					}
				/>
				<InvalidateSize />
				<FitBounds coords={coords} routeId={route.name.en} />

				{/* Unselected Polyline */}
				<Polyline
					positions={displayPath}
					pathOptions={{
						color: hasSelection ? (isDark ? "#334155" : "#CBD5E1") : "#3B82F6",
						weight: 4,
						opacity: 0.7,
						lineCap: "round",
						lineJoin: "round",
					}}
				/>

				{/* Selected Segment Polyline */}
				{hasSelection && selectedPath.length > 0 && (
					<>
						<Polyline
							positions={selectedPath}
							pathOptions={{
								color: "#3B82F6",
								weight: 5,
								opacity: 1,
								lineCap: "round",
								lineJoin: "round",
							}}
						/>
						<Polyline
							positions={selectedPath}
							pathOptions={{
								color: "#3B82F6",
								weight: 12,
								opacity: 0.2,
								lineCap: "round",
								lineJoin: "round",
							}}
						/>
					</>
				)}

				{/* Station Markers */}
				{validStops.map(({ stop, index }) => {
					const active = !hasSelection || isSelected(index);
					const isTerminal = index === 0 || index === route.stops.length - 1;
					const isEndpoint = index === fromIdx || index === toIdx;

					return (
						<CircleMarker
							key={index}
							center={[stop.lat, stop.lng]}
							radius={isEndpoint ? 8 : isTerminal ? 6 : 4}
							pathOptions={{
								fillColor: active ? (isEndpoint ? "#3B82F6" : "#fff") : isDark ? "#1E293B" : "#F1F5F9",
								fillOpacity: 1,
								color: active ? "#3B82F6" : isDark ? "#475569" : "#94A3B8",
								weight: active ? (isEndpoint ? 3 : 2) : 1,
							}}
						>
							<Tooltip direction="right" offset={[10, 0]} permanent={isEndpoint || isTerminal} className="bus-tooltip">
								<span className="flex items-center gap-1.5 text-[10px] font-bold">
									{active && <MapPin className="w-3.5 h-3.5 text-primary" />}
									{locale === "en" ? stop.name.en : stop.name.bn}
								</span>
							</Tooltip>
						</CircleMarker>
					);
				})}
			</MapContainer>

			{isFetchingCurve && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-1000 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-lg flex items-center gap-2">
					<Loader2 className="w-4 h-4 animate-spin text-primary" />
					<span className="text-xs font-semibold text-foreground">Loading Road Network...</span>
				</div>
			)}
		</div>
	);
}
