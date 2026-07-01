"use client";

import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { TrainFront } from "lucide-react";

export interface UnifiedTrain {
	id: string;
	lat: number;
	lng: number;
	heading: number;
	isLive: boolean;
}

function createTrainIcon(rotation: number, isLive: boolean) {
	const strokeColor = isLive ? "#10B981" : "var(--primary)"; // Emerald green if live
	const bodyFill = "var(--background)";
	
	return L.divIcon({
		className: "metro-train-icon",
		html: `<div style="
			width: 16px; height: 26px;
			display: flex; align-items: center; justify-content: center;
			animation: ${isLive ? 'userPulse' : 'trainPulse'} 2s ease-in-out infinite;
		">
			<svg width="12" height="22" viewBox="0 0 12 22" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg); overflow: visible;">
				<!-- Main Body -->
				<path d="M 2,19 C 2,20.5 4,21 6,21 C 8,21 10,20.5 10,19 L 10,7 C 10,4.5 7.5,1.2 6,1 C 4.5,1.2 2,4.5 2,7 Z" fill="${bodyFill}" stroke="${strokeColor}" stroke-width="1.2" />

				<!-- Side stripes -->
				<path d="M 2,10 L 2,16" stroke="${strokeColor}" stroke-width="1.2" stroke-linecap="round" />
				<path d="M 10,10 L 10,16" stroke="${strokeColor}" stroke-width="1.2" stroke-linecap="round" />

				<!-- Windshield -->
				<path d="M 3.5,6 C 3.5,4.5 5,3 6,2.8 C 7,3 8.5,4.5 8.5,6 Z" fill="#1E293B" stroke="${strokeColor}" stroke-width="0.5" />

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

interface TrainsLayerProps {
	trains: UnifiedTrain[];
}

export function TrainsLayer({ trains }: TrainsLayerProps) {
	return (
		<>
			{trains.map((train) => {
				const rotation = train.heading;
				// Estimate northbound vs southbound from heading
				const isNorthbound = rotation > 270 || rotation < 90;
				return (
					<Marker key={train.id} position={[train.lat, train.lng]} icon={createTrainIcon(rotation, train.isLive)}>
						<Tooltip direction="top" offset={[0, -15]} className="metro-tooltip">
							<span className="flex items-center gap-1 text-[10px] font-bold">
								<TrainFront className={`w-3.5 h-3.5 animate-pulse ${train.isLive ? 'text-emerald-500' : 'text-primary'}`} />
								{isNorthbound ? "Uttara" : "Motijheel"} {train.isLive && "(Live)"}
							</span>
						</Tooltip>
					</Marker>
				);
			})}
		</>
	);
}
