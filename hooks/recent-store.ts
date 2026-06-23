import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentStore {
	recentlyViewedSlugs: string[];
	addViewedRoute: (slug: string) => void;
	clearRecentRoutes: () => void;
}

export const useRecentStore = create<RecentStore>()(
	persist(
		(set) => ({
			recentlyViewedSlugs: [],
			addViewedRoute: (slug) =>
				set((state) => {
					// Remove the slug if it already exists, then prepend it
					const filtered = state.recentlyViewedSlugs.filter((s) => s !== slug);
					const updated = [slug, ...filtered].slice(0, 4); // Keep last 4 recently viewed
					return { recentlyViewedSlugs: updated };
				}),
			clearRecentRoutes: () => set({ recentlyViewedSlugs: [] }),
		}),
		{
			name: "dhaka-bus-fare-recent-routes-store",
		}
	)
);
