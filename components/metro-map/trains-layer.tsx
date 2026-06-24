"use client";

import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { TrainFront } from "lucide-react";
import type { SimulatedTrain, MetroStation } from "@/types";

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

interface TrainsLayerProps {
	trains: SimulatedTrain[];
	stations: MetroStation[];
}

export function TrainsLayer({ trains, stations }: TrainsLayerProps) {
	return (
		<>
			{trains.map((train) => {
				const rotation = getTrainRotation(train, stations);
				return (
					<Marker key={train.id} position={[train.lat, train.lng]} icon={createTrainIcon(rotation)}>
						<Tooltip direction="top" offset={[0, -15]} className="metro-tooltip">
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
