import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FARE_PER_KM, MIN_FARE } from "@/lib/busData";

export interface FareSettings {
	minFare: number;
	farePerKm: number;
}

export type Language = "en" | "bn";

interface AppState {
	settings: FareSettings;
	setSettings: (settings: FareSettings) => void;

	// Advanced search states
	selectedRouteSlug: string | null;
	fromStopName: string | null;
	toStopName: string | null;
	setSelectedRouteSlug: (slug: string | null) => void;
	setFromStopName: (stop: string | null) => void;
	setToStopName: (stop: string | null) => void;
}

export const useStore = create<AppState>()(
	persist(
		(set) => ({
			settings: { minFare: MIN_FARE, farePerKm: FARE_PER_KM },
			setSettings: (settings) => set({ settings }),

			selectedRouteSlug: "all",
			fromStopName: null,
			toStopName: null,
			setSelectedRouteSlug: (slug) => set({ selectedRouteSlug: slug }),
			setFromStopName: (name) => set({ fromStopName: name }),
			setToStopName: (name) => set({ toStopName: name }),
		}),
		{
			name: "dhaka-bus-fare-store",
		},
	),
);
