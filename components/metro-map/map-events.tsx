"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface MapEventsProps {
	onMapClick: () => void;
}

export function MapEvents({ onMapClick }: MapEventsProps) {
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
