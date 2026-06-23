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

	// Persistent bus card calculators state
	busCalculators: Record<string, { boarding: string | null; destination: string | null }>;
	setBusCalculator: (busTitle: string, boarding: string | null, destination: string | null) => void;

	// Persistent bus card expanded state
	expandedBuses: Record<string, boolean>;
	setBusExpanded: (busTitle: string, expanded: boolean) => void;
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

			busCalculators: {},
			setBusCalculator: (busTitle, boarding, destination) =>
				set((state) => ({
					busCalculators: {
						...state.busCalculators,
						[busTitle]: { boarding, destination },
					},
				})),

			expandedBuses: {},
			setBusExpanded: (busTitle, expanded) =>
				set((state) => ({
					expandedBuses: {
						...state.expandedBuses,
						[busTitle]: expanded,
					},
				})),
		}),
		{
			name: "dhaka-bus-fare-store",
		},
	),
);
