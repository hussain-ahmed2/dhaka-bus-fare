"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { MetroStation } from "@/types";

interface MapRecenterProps {
	selectedStation: MetroStation | null;
}

export function MapRecenter({ selectedStation }: MapRecenterProps) {
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
