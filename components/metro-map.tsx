"use client";

import { useState, useEffect, useRef } from "react";
import {
	MapContainer,
	TileLayer,
	Polyline,
	CircleMarker,
	Marker,
	Tooltip,
	Circle,
	useMap,
} from "react-leaflet";
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
	calculateMetroFare,
	getMetroFareWithCard,
	haversineDistance,
} from "@/lib/metroData";
import type { SimulatedTrain, MetroStation } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { X, Navigation, TrainFront, Clock, Ticket, Plus, Minus, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";

// ─── Custom Train Icon ──────────────────────────────────
function createTrainIcon(rotation: number) {
	return L.divIcon({
		className: "metro-train-icon",
		html: `<div style="
			width: 16px; height: 26px;
			display: flex; align-items: center; justify-content: center;
			animation: trainPulse 2s ease-in-out infinite;
		">
			<svg width="12" height="22" viewBox="0 0 12 22" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg); overflow: visible;">
				<!-- Main Body -->
				<path d="M 2,19 C 2,20.5 4,21 6,21 C 8,21 10,20.5 10,19 L 10,7 C 10,4.5 7.5,1.2 6,1 C 4.5,1.2 2,4.5 2,7 Z" fill="var(--background)" stroke="var(--primary)" stroke-width="1.2" />

				<!-- Side stripes -->
				<path d="M 2,10 L 2,16" stroke="var(--primary)" stroke-width="1.2" stroke-linecap="round" />
				<path d="M 10,10 L 10,16" stroke="var(--primary)" stroke-width="1.2" stroke-linecap="round" />

				<!-- Windshield -->
				<path d="M 3.5,6 C 3.5,4.5 5,3 6,2.8 C 7,3 8.5,4.5 8.5,6 Z" fill="#1E293B" stroke="var(--primary)" stroke-width="0.5" />

				<!-- Headlights -->
				<circle cx="4.5" cy="3" r="0.6" fill="#F59E0B" />
				<circle cx="7.5" cy="3" r="0.6" fill="#F59E0B" />

				<!-- Taillights -->
				<rect x="3.5" y="19.5" width="1.2" height="0.6" rx="0.3" fill="#EF4444" />
				<rect x="7.3" y="19.5" width="1.2" height="0.6" rx="0.3" fill="#EF4444" />

				<!-- Roof details -->
				<line x1="6" y1="8" x2="6" y2="18" stroke="var(--border)" stroke-width="0.6" stroke-dasharray="1.5 1.5" />
			</svg>
		</div>`,
		iconSize: [16, 26],
		iconAnchor: [8, 13],
	});
}


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

// ─── Custom Zoom Buttons ────────────────────────────────
function ZoomButtons() {
	const map = useMap();
	return (
		<div className="absolute right-3 bottom-24 sm:bottom-4 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
			<button
				onClick={() => map.zoomIn()}
				className="w-9 h-9 bg-background/90 backdrop-blur-md border border-border rounded-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer"
				aria-label="Zoom in"
			>
				<Plus className="w-4 h-4 text-foreground" />
			</button>
			<button
				onClick={() => map.zoomOut()}
				className="w-9 h-9 bg-background/90 backdrop-blur-md border border-border rounded-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer"
				aria-label="Zoom out"
			>
				<Minus className="w-4 h-4 text-foreground" />
			</button>
		</div>
	);
}

// ─── Map Event Handlers ─────────────────────────────────
function MapEvents({ onMapClick }: { onMapClick: () => void }) {
	const map = useMap();
	useEffect(() => {
		const handleClick = (e: L.LeafletMouseEvent) => {
			// Ignore map clicks that originate from interactive layers or components
			const target = e.originalEvent?.target as HTMLElement | undefined;
			if (
				target &&
				(target.tagName === "path" ||
					target.closest(".leaflet-marker-icon") ||
					target.closest(".leaflet-popup") ||
					target.closest(".leaflet-tooltip") ||
					target.closest(".metro-tooltip"))
			) {
				return;
			}
			onMapClick();
		};
		map.on("click", handleClick);
		return () => {
			map.off("click", handleClick);
		};
	}, [map, onMapClick]);
	return null;
}

// ─── Map Recenter Handler ───────────────────────────────
function MapRecenter({ selectedStation }: { selectedStation: MetroStation | null }) {
	const map = useMap();
	useEffect(() => {
		if (selectedStation) {
			map.setView([selectedStation.lat, selectedStation.lng], 14, {
				animate: true,
				duration: 0.8,
			});
		}
	}, [selectedStation, map]);
	return null;
}

// ─── Train Rotation Logic ───────────────────────────────
function getTrainRotation(train: SimulatedTrain, stations: MetroStation[]) {
	let from = train.fromStation;
	let to = train.toStation;

	if (from.id === to.id) {
		const idx = stations.findIndex((s) => s.id === from.id);
		if (idx !== -1) {
			if (train.direction === "southbound") {
				if (idx < stations.length - 1) {
					to = stations[idx + 1];
				} else {
					from = stations[idx - 1];
				}
			} else {
				if (idx > 0) {
					to = stations[idx - 1];
				} else {
					from = stations[idx + 1];
				}
			}
		}
	}

	const dy = to.lat - from.lat;
	const dx = to.lng - from.lng;
	const angleRad = Math.atan2(dy, dx);
	const angleDeg = (angleRad * 180) / Math.PI;
	return (90 - angleDeg + 360) % 360;
}

// ─── Animated Trains Layer ──────────────────────────────
function TrainsLayer({ trains, stations }: { trains: SimulatedTrain[]; stations: MetroStation[] }) {
	return (
		<>
			{trains.map((train) => {
				const rotation = getTrainRotation(train, stations);
				return (
					<Marker
						key={train.id}
						position={[train.lat, train.lng]}
						icon={createTrainIcon(rotation)}
					>
						<Tooltip
							direction="top"
							offset={[0, -15]}
							className="metro-tooltip"
						>
							<span className="flex items-center gap-1 text-[10px] font-bold">
								<TrainFront className="w-3.5 h-3.5 text-primary animate-pulse" />
								{train.direction === "northbound" ? "Uttara" : "Motijheel"}
							</span>
						</Tooltip>
					</Marker>
				);
			})}
		</>
	);
}

// ─── Main Map Component ─────────────────────────────────
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

	// Sync state from query parameters (Single Source of Truth)
	useEffect(() => {
		const stationId = searchParams.get("station");
		if (stationId) {
			const found = stations.find((s) => s.id === stationId);
			setSelectedStation(found || null);
		} else {
			setSelectedStation(null);
		}
	}, [searchParams, stations]);

	// Update state and query parameters
	const handleStationClick = (stationId: string | null) => {
		// Update local state immediately for instant response
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
	const [locationDenied, setLocationDenied] = useState(false);
	const [now, setNow] = useState(new Date());
	const [isDark, setIsDark] = useState(false);
	const animFrameRef = useRef<number>(0);

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
	const mapCenter: [number, number] = [23.7950, 90.3900];
	const mapZoom = 12;

	// Station coordinates for the polyline
	const lineCoords: [number, number][] = stations.map((s) => [s.lat, s.lng]);

	// ── Train simulation loop ───────────────────────────
	useEffect(() => {
		let active = true;

		const tick = () => {
			if (!active) return;
			const currentTime = new Date();
			setNow(currentTime);
			setTrains(simulateTrainPositions(currentTime));
			animFrameRef.current = requestAnimationFrame(tick);
		};

		// Update every second instead of every frame for performance
		const interval = setInterval(() => {
			const currentTime = new Date();
			setNow(currentTime);
			setTrains(simulateTrainPositions(currentTime));
		}, 1000);

		return () => {
			active = false;
			cancelAnimationFrame(animFrameRef.current);
			clearInterval(interval);
		};
	}, []);

	// ── User geolocation ────────────────────────────────
	useEffect(() => {
		if (!navigator.geolocation) {
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
			{ enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
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
					url={isDark
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
					const isTerminal = idx === 0 || idx === stations.length - 1;
					return (
						<CircleMarker
							key={station.id}
							center={[station.lat, station.lng]}
							radius={isTerminal ? 8 : 5}
							bubblingMouseEvents={false}
							pathOptions={{
								fillColor: "#fff",
								fillOpacity: 1,
								color: line.color,
								weight: isTerminal ? 3 : 2,
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
									<MapPin className="w-3.5 h-3.5 text-primary" />
									{locale === "en" ? station.name.en : station.name.bn}
								</span>
							</Tooltip>
						</CircleMarker>
					);
				})}

				{/* Animated Trains */}
				<TrainsLayer trains={trains} stations={stations} />

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
						<Marker
							position={[userLocation.lat, userLocation.lng]}
							icon={userLocationIcon}
						/>
					</>
				)}
			</MapContainer>

			{/* Floating Status Bar (Responsive placement: Top-left on desktop) */}
			<div className="absolute top-3 left-3 right-3 sm:right-auto z-[1000] pointer-events-none">
				<div className="pointer-events-auto bg-background/90 backdrop-blur-xl rounded-xl border border-border shadow-lg p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
					<div className="flex items-center gap-2 flex-shrink-0">
						<div
							className={`w-2.5 h-2.5 rounded-full ${operating ? "bg-primary animate-pulse" : "bg-red-400"} flex-shrink-0`}
						/>
						<span className="text-xs font-bold whitespace-nowrap">
							{operating ? t("metroOperating") : t("metroClosed")}
						</span>
					</div>
					<div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-shrink-0 flex-wrap sm:flex-nowrap">
						{operating && (
							<>
								<span className="font-semibold whitespace-nowrap">
									{t("frequency", { minutes: formatNumber(frequency, locale) })}
								</span>
								{nextTrain > 0 && (
									<>
										<span className="text-border">·</span>
										<span className="font-semibold text-primary whitespace-nowrap">
											{t("nextTrain", { minutes: formatNumber(nextTrain, locale) })}
										</span>
									</>
								)}
							</>
						)}
						<span className="text-border">·</span>
						<span className="font-bold whitespace-nowrap">
							{trains.length} 🚇
						</span>
					</div>
				</div>
			</div>

			{/* Nearest Station Card (Responsive placement: Bottom-left on desktop) */}
			{nearest && userLocation && !selectedStation && (
				<div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:w-[350px] z-[1000] pointer-events-none">
					<div className="pointer-events-auto bg-background/90 backdrop-blur-xl rounded-xl border border-border shadow-lg p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
									{t("nearestStation")}
								</p>
								<p className="text-sm font-bold">
									{locale === "en" ? nearest.station.name.en : nearest.station.name.bn}
								</p>
								<p className="text-xs text-muted-foreground">
									{t("walkingTime", { time: formatNumber(nearest.walkingMinutes, locale) })} · {nearest.distance.toFixed(1)} {t("km")}
								</p>
							</div>
							<div className="text-right">
								<p className="text-lg font-black text-primary">
									{nearest.distance.toFixed(1)}
								</p>
								<p className="text-[10px] text-muted-foreground font-semibold">{t("km")}</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Selected Station Detail Panel (Responsive drawer/card) */}
			<AnimatePresence>
				{selectedStation && (
					<motion.div
						initial={{ y: "100%", opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: "100%", opacity: 0 }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className="absolute bottom-0 left-0 right-0 sm:bottom-4 sm:left-3 sm:right-auto sm:w-[350px] z-[1001] pointer-events-auto"
					>
						<div className="bg-background/95 backdrop-blur-xl rounded-t-2xl sm:rounded-xl border-t sm:border border-border shadow-2xl p-4 space-y-4">
							{/* Header */}
							<div className="flex items-start justify-between">
								<div className="space-y-0.5">
									<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
										<TrainFront className="w-2.5 h-2.5" />
										{t("mrtLine6")}
									</span>
									<h3 className="text-base font-bold text-foreground">
										{locale === "en" ? selectedStation.name.en : selectedStation.name.bn}
									</h3>
									<p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
										{t("stationDetails")}
									</p>
								</div>
								<button
									onClick={() => handleStationClick(null)}
									className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
									aria-label={t("close")}
								>
									<X className="h-4 w-4" />
								</button>
							</div>

							{/* Info Grid */}
							<div className="grid grid-cols-2 gap-2 text-xs">
								<div className="bg-muted/30 border border-border/50 rounded-lg p-2 space-y-0.5">
									<p className="text-[9px] text-muted-foreground font-semibold uppercase">{t("distance")}</p>
									<p className="font-bold text-foreground">
										{formatNumber(selectedStation.distanceFromStart, locale)} {t("km")}
									</p>
									<p className="text-[8px] text-muted-foreground">from Uttara North</p>
								</div>

								<div className="bg-muted/30 border border-border/50 rounded-lg p-2 space-y-0.5">
									<p className="text-[9px] text-muted-foreground font-semibold uppercase">Next Train</p>
									<p className="font-bold text-primary">
										{operating && nextTrain > 0 ? t("nextTrain", { minutes: formatNumber(nextTrain, locale) }) : "—"}
									</p>
									<p className="text-[8px] text-muted-foreground">based on schedule</p>
								</div>
							</div>

							{/* User location info (Distance & Fare) */}
							{userLocation && (
								<div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
									{(() => {
										const dist = haversineDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng);
										const walkingMin = Math.ceil((dist / 5) * 60);
										const fareVal = calculateMetroFare(findNearestStation(userLocation.lat, userLocation.lng).station.id, selectedStation.id);
										const cardFareVal = getMetroFareWithCard(fareVal);
										const isCurrent = findNearestStation(userLocation.lat, userLocation.lng).station.id === selectedStation.id;

										return (
											<>
												<div className="flex items-center justify-between text-xs">
													<div className="flex items-center gap-1.5 text-muted-foreground">
														<Navigation className="w-3.5 h-3.5 text-primary" />
														<span>{isCurrent ? "You are here" : `${formatNumber(dist.toFixed(1), locale)} ${t("km")} away`}</span>
													</div>
													{!isCurrent && (
														<span className="text-[10px] text-muted-foreground font-bold">
															~{formatNumber(walkingMin, locale)} {t("min")} walk
														</span>
													)}
												</div>

												{!isCurrent && fareVal > 0 && (
													<div className="flex items-center justify-between pt-1.5 border-t border-primary/10 text-xs">
														<span className="text-[10px] text-muted-foreground font-medium">{t("fareFromLocation")}</span>
														<div className="flex items-center gap-1.5 font-bold">
															<span className="text-foreground">৳{formatNumber(fareVal, locale)}</span>
															<span className="text-primary text-[10px] bg-primary/10 px-1.5 py-0.5 rounded">
																৳{formatNumber(cardFareVal, locale)} Card
															</span>
														</div>
													</div>
												)}
											</>
										);
									})()}
								</div>
							)}

							{/* Actions */}
							<a
								href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}&travelmode=walking`}
								target="_blank"
								rel="noopener noreferrer"
								className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md text-center cursor-pointer"
							>
								<Navigation className="h-3.5 w-3.5 rotate-45" />
								{t("getDirections")}
							</a>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Location Denied Message */}
			{locationDenied && !userLocation && (
				<div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:w-[350px] z-[1000] pointer-events-none">
					<div className="pointer-events-auto bg-amber-50/90 backdrop-blur-xl rounded-xl border border-amber-200 shadow-lg p-3 text-center">
						<p className="text-xs text-amber-700 font-semibold">
							{t("enableLocation")}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
