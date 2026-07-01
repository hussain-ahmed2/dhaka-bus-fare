"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Tooltip, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
	getMetroLine,
	getMetroStations,
	simulateTrainPositions,
	haversineDistance,
	isMetroOperating,
	getCurrentFrequency,
	getNextTrainMinutes,
	findNearestStation,
	getMetroLineCoords,
} from "@/lib/metroData";
import type { MetroStation, SimulatedTrain } from "@/types";
import { useMetroTrains } from "@/hooks/useMetroTrains";
import type { UnifiedTrain } from "./trains-layer";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence } from "motion/react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { createClient } from "@/utils/supabase/client";

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

function MapFollowUser({ userLocation, isTracking }: { userLocation: {lat: number, lng: number} | null, isTracking: boolean }) {
	const map = useMap();
	
	useEffect(() => {
		if (isTracking && userLocation) {
			map.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
		}
	}, [isTracking, userLocation, map]);
	
	return null;
}

export default function MetroMap() {
	const t = useTranslations("Metro");
	const locale = useLocale();
	const line = getMetroLine();
	const stations = getMetroStations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const liveTrains = useMetroTrains();
	const [simulatedTrains, setSimulatedTrains] = useState<SimulatedTrain[]>([]);
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number; speed?: number; heading?: number } | null>(null);
	const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null);
	const [locationDenied, setLocationDenied] = useState(false);
	const [now, setNow] = useState(new Date());
	const [isDark, setIsDark] = useState(false);
	
	const [isTracking, setIsTracking] = useState(false);
	const [trackingError, setTrackingError] = useState<string | null>(null);
	const [sessionId] = useState(() => crypto.randomUUID());
	const supabase = createClient();

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
			setSimulatedTrains(simulateTrainPositions(currentTime));
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
					speed: pos.coords.speed || 0,
					heading: pos.coords.heading || 0
				});
				setLocationDenied(false);
			},
			(error) => {
				if (error.code === error.PERMISSION_DENIED) {
					setLocationDenied(true);
				}
				// Ignore timeout or position unavailable, maybe we get it later
			},
			{ enableHighAccuracy: false, maximumAge: 10000, timeout: 10000 },
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, []);

	const nearest = userLocation ? findNearestStation(userLocation.lat, userLocation.lng) : null;
	const operating = isMetroOperating(now);
	const frequency = getCurrentFrequency(now);
	const nextTrain = getNextTrainMinutes(now);

	// ── Realtime Tracking DB Push ──────────────────────────
	const lastPushRef = useRef<number>(0);
	useEffect(() => {
		if (isTracking && userLocation) {
			const nowMs = Date.now();
			// Push at most every 5 seconds
			if (nowMs - lastPushRef.current > 5000) {
				lastPushRef.current = nowMs;
				supabase.from('raw_user_locations').insert({
					session_id: sessionId,
					location: `POINT(${userLocation.lng} ${userLocation.lat})`,
					speed: userLocation.speed || 0,
					heading: userLocation.heading || 0,
					is_on_train: true
				}).then(({ error }) => {
					if (error) console.error("Error pushing location:", error);
				});
			}
		}
	}, [isTracking, userLocation, sessionId, supabase]);

	// ── Merge Live and Simulated Trains ──────────────────
	const mergedTrains: UnifiedTrain[] = [];
	
	// Add all live trains first
	for (const live of liveTrains) {
		mergedTrains.push({
			id: live.id,
			lat: live.lat,
			lng: live.lng,
			heading: live.direction, // direction is a number (heading) in TrainLocation
			isLive: true
		});
	}

	// Add simulated trains only if they are not within 0.5km of ANY live train
	for (const sim of simulatedTrains) {
		let isNearLive = false;
		for (const live of liveTrains) {
			const dist = haversineDistance(sim.lat, sim.lng, live.lat, live.lng);
			if (dist < 0.5) {
				isNearLive = true;
				break;
			}
		}

		if (!isNearLive) {
			// Calculate heading for simulated train
			const dy = sim.toStation.lat - sim.fromStation.lat;
			const dx = sim.toStation.lng - sim.fromStation.lng;
			const angleRad = Math.atan2(dy, dx);
			const angleDeg = (angleRad * 180) / Math.PI;
			const heading = (90 - angleDeg + 360) % 360;

			mergedTrains.push({
				id: sim.id,
				lat: sim.lat,
				lng: sim.lng,
				heading,
				isLive: false
			});
		}
	}

	const toggleTracking = () => {
		if (isTracking) {
			setIsTracking(false);
			return;
		}
		if (!userLocation || !nearest) return;

		// Verify distance <= 1km
		if (nearest.distance > 1) {
			setTrackingError(t("tooFarToTrack"));
			setTimeout(() => setTrackingError(null), 5000);
			return;
		}

		setIsTracking(true);
	};

	const handleAllowLocation = () => {
		// Just re-trigger the geolocate logic by clearing location denied
		setLocationDenied(false);
		navigator.geolocation.getCurrentPosition(() => {}, () => {
			setLocationDenied(true);
		});
	};

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
				<MapFollowUser userLocation={userLocation} isTracking={isTracking} />

				{/* Map tiles logic */}
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
				<TrainsLayer trains={mergedTrains} />

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
			<StatusBar operating={operating} frequency={frequency} nextTrain={nextTrain} trainsCount={mergedTrains.length} />

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

			{/* Track Journey Toggle */}
			{userLocation && (
				<div className="absolute top-24 right-3 z-[1000]">
					<button
						onClick={toggleTracking}
						className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all ${
							isTracking 
								? 'bg-emerald-500 text-white animate-pulse'
								: 'bg-white text-primary border-2 border-primary hover:bg-primary/5'
						}`}
					>
						{isTracking ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								{t('trackingActive')}
							</>
						) : (
							<>
								<Navigation className="h-4 w-4" />
								{t('trackJourney')}
							</>
						)}
					</button>
					{trackingError && (
						<div className="absolute top-full mt-2 right-0 w-64 bg-destructive text-destructive-foreground text-xs font-semibold p-2 rounded-lg shadow-xl text-right animate-in fade-in slide-in-from-top-2">
							{trackingError}
						</div>
					)}
				</div>
			)}

			{/* Share Location Banner (if location is not yet available and not explicitly denied) */}
			{!userLocation && !locationDenied && (
				<div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[1000] pointer-events-none">
					<div className="pointer-events-auto bg-primary text-primary-foreground rounded-xl shadow-2xl p-4 text-center animate-in slide-in-from-top-4 fade-in">
						<MapPin className="h-6 w-6 mx-auto mb-2 opacity-80" />
						<p className="text-sm font-semibold mb-3">{t("shareLocationBanner")}</p>
						<button onClick={handleAllowLocation} className="bg-white text-primary text-sm font-bold px-4 py-2 rounded-full shadow hover:bg-white/90 transition-colors">
							{t("allowLocation")}
						</button>
					</div>
				</div>
			)}

			{/* Location Denied Message */}
			{locationDenied && !userLocation && (
				<div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:w-[350px] z-[1000] pointer-events-none">
					<div className="pointer-events-auto bg-amber-50/90 backdrop-blur-xl rounded-xl border border-amber-200 shadow-lg p-3 text-center">
						<p className="text-xs text-amber-700 font-semibold">{t("enableLocation")}</p>
					</div>
				</div>
			)}
		</div>
	);
}
