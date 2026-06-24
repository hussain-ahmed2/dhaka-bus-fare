"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Tooltip, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
	getMetroLine,
	getMetroStations,
	simulateTrainPositions,
	isMetroOperating,
	getCurrentFrequency,
	getNextTrainMinutes,
	findNearestStation,
	getMetroLineCoords,
} from "@/lib/metroData";
import type { SimulatedTrain, MetroStation } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence } from "motion/react";
import { MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";

// Sub-components
import { ZoomButtons } from "./zoom-buttons";
import { MapEvents } from "./map-events";
import { MapRecenter } from "./map-recenter";
import { TrainsLayer } from "./trains-layer";
import { StatusBar } from "./status-bar";
import { NearestStationCard } from "./nearest-station-card";
import { StationDetailPanel } from "./station-detail-panel";

// ─── User Location Icon ─────────────────────────────────
const userLocationIcon = L.divIcon({
	className: "user-location-icon",
	html: `<div style="
		width: 16px; height: 16px;
		background: #3B82F6;
		border: 3px solid #fff;
		border-radius: 50%;
		box-shadow: 0 0 0 2px #3B82F6, 0 2px 8px rgba(59,130,246,0.4);
		animation: userPulse 2s ease-in-out infinite;
	"></div>`,
	iconSize: [16, 16],
	iconAnchor: [8, 8],
});

export default function MetroMap() {
	const t = useTranslations("Metro");
	const locale = useLocale();
	const line = getMetroLine();
	const stations = getMetroStations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const [trains, setTrains] = useState<SimulatedTrain[]>([]);
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
	const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null);
	const [locationDenied, setLocationDenied] = useState(false);
	const [now, setNow] = useState(new Date());
	const [isDark, setIsDark] = useState(false);

	// Sync state from query parameters (Single Source of Truth)
	useEffect(() => {
		const stationId = searchParams.get("station");
		if (stationId) {
			const found = stations.find((s) => s.id === stationId);
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSelectedStation(found || null);
		} else {
			setSelectedStation(null);
		}
	}, [searchParams, stations]);

	// Update state and query parameters
	const handleStationClick = (stationId: string | null) => {
		if (stationId) {
			const found = stations.find((s) => s.id === stationId);
			setSelectedStation(found || null);
		} else {
			setSelectedStation(null);
		}

		const params = new URLSearchParams(searchParams.toString());
		if (stationId) {
			params.set("station", stationId);
		} else {
			params.delete("station");
		}
		const query = params.toString();
		const newUrl = query ? `${pathname}?${query}` : pathname;
		router.replace(newUrl, { scroll: false });
	};

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

	// Map center — center of the line
	const mapCenter: [number, number] = [23.795, 90.39];
	const mapZoom = 12;

	// Curved track coordinates for the polyline
	const lineCoords: [number, number][] = getMetroLineCoords();

	// ── Train simulation loop ───────────────────────────
	useEffect(() => {
		const updatePositions = () => {
			const currentTime = new Date();
			setNow(currentTime);
			setTrains(simulateTrainPositions(currentTime));
		};
		updatePositions();

		const interval = setInterval(updatePositions, 1000);
		return () => clearInterval(interval);
	}, []);

	// ── User geolocation ────────────────────────────────
	useEffect(() => {
		if (!navigator.geolocation) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setLocationDenied(true);
			return;
		}

		const watchId = navigator.geolocation.watchPosition(
			(pos) => {
				setUserLocation({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
					accuracy: pos.coords.accuracy,
				});
				setLocationDenied(false);
			},
			() => {
				setLocationDenied(true);
			},
			{ enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, []);

	const nearest = userLocation ? findNearestStation(userLocation.lat, userLocation.lng) : null;
	const operating = isMetroOperating(now);
	const frequency = getCurrentFrequency(now);
	const nextTrain = getNextTrainMinutes(now);

	return (
		<div className="relative w-full h-full">
			{/* CSS for animations & dark mode map tiles */}
			<style>{`
				@keyframes trainPulse {
					0%, 100% { filter: drop-shadow(0 2px 3px var(--primary)); }
					50% { filter: drop-shadow(0 2px 8px var(--primary)); }
				}
				@keyframes userPulse {
					0%, 100% { box-shadow: 0 0 0 2px #3B82F6, 0 2px 8px rgba(59,130,246,0.4); }
					50% { box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 16px rgba(59,130,246,0.6); }
				}
				.metro-tooltip {
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
				.metro-tooltip::before {
					display: none !important;
				}
				.leaflet-popup-content-wrapper {
					border-radius: 12px !important;
					box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
				}
				.dark .metro-tooltip {
					box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
				}
			`}</style>

			<MapContainer
				center={mapCenter}
				zoom={mapZoom}
				style={{ width: "100%", height: "100%" }}
				zoomControl={false}
				attributionControl={true}
			>
				<TileLayer
					key={isDark ? "dark" : "light"}
					url={
						isDark
							? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
							: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
					}
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
				/>

				{/* Map Event Handlers */}
				<MapEvents onMapClick={() => handleStationClick(null)} />
				<MapRecenter selectedStation={selectedStation} />

				{/* Custom Zoom Buttons */}
				<ZoomButtons />

				{/* Metro Line Polyline */}
				<Polyline
					positions={lineCoords}
					pathOptions={{
						color: line.color,
						weight: 5,
						opacity: 0.8,
						lineCap: "round",
						lineJoin: "round",
					}}
				/>
				{/* Glow effect */}
				<Polyline
					positions={lineCoords}
					pathOptions={{
						color: line.color,
						weight: 12,
						opacity: 0.15,
						lineCap: "round",
						lineJoin: "round",
					}}
				/>

				{/* Station Markers */}
				{stations.map((station, idx) => {
					const isUnderConstruction = !!station.underConstruction;
					const isTerminal = (idx === 0 || idx === stations.length - 1) && !isUnderConstruction;
					return (
						<CircleMarker
							key={station.id}
							center={[station.lat, station.lng]}
							radius={isUnderConstruction ? 5 : isTerminal ? 8 : 5}
							bubblingMouseEvents={false}
							pathOptions={{
								fillColor: isUnderConstruction ? "#F1F5F9" : "#fff",
								fillOpacity: 1,
								color: isUnderConstruction ? "#94A3B8" : line.color,
								weight: isUnderConstruction ? 2 : isTerminal ? 3 : 2,
								dashArray: isUnderConstruction ? "4, 4" : undefined,
							}}
							eventHandlers={{
								click: (e) => {
									if (e.originalEvent) {
										e.originalEvent.stopPropagation();
									}
									handleStationClick(station.id);
								},
							}}
						>
							<Tooltip
								direction="right"
								offset={[10, 0]}
								permanent={isTerminal}
								className="metro-tooltip"
							>
								<span className="flex items-center gap-1.5 text-[10px] font-bold">
									<MapPin
										className={`w-3.5 h-3.5 ${isUnderConstruction ? "text-slate-400" : "text-primary"}`}
									/>
									{locale === "en" ? station.name.en : station.name.bn}
									{isUnderConstruction && (
										<span className="text-[8px] font-normal text-slate-400 border border-slate-200 bg-slate-50 px-1 rounded ml-1">
											{t("underConstructionShort")}
										</span>
									)}
								</span>
							</Tooltip>
						</CircleMarker>
					);
				})}

				{/* Animated Trains */}
				<TrainsLayer trains={trains} stations={stations.filter((s) => !s.underConstruction)} />

				{/* User Location */}
				{userLocation && (
					<>
						<Circle
							center={[userLocation.lat, userLocation.lng]}
							radius={userLocation.accuracy}
							pathOptions={{
								color: "#3B82F6",
								fillColor: "#3B82F6",
								fillOpacity: 0.1,
								weight: 1,
							}}
						/>
						<Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
					</>
				)}
			</MapContainer>

			{/* Floating Status Bar */}
			<StatusBar operating={operating} frequency={frequency} nextTrain={nextTrain} trainsCount={trains.length} />

			{/* Nearest Station Card */}
			{nearest && userLocation && !selectedStation && <NearestStationCard nearest={nearest} />}

			{/* Selected Station Detail Panel */}
			<AnimatePresence>
				{selectedStation && (
					<StationDetailPanel
						selectedStation={selectedStation}
						userLocation={userLocation}
						operating={operating}
						nextTrain={nextTrain}
						onClose={() => handleStationClick(null)}
					/>
				)}
			</AnimatePresence>

			{/* Location Denied Message */}
			{locationDenied && !userLocation && (
				<div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:w-[350px] z-1000 pointer-events-none">
					<div className="pointer-events-auto bg-amber-50/90 backdrop-blur-xl rounded-xl border border-amber-200 shadow-lg p-3 text-center">
						<p className="text-xs text-amber-700 font-semibold">{t("enableLocation")}</p>
					</div>
				</div>
			)}
		</div>
	);
}
