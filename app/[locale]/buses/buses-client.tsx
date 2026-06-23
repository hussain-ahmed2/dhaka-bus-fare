"use client";

import { useState, useMemo, useEffect } from "react";
import { Bus } from "lucide-react";
import SearchBar from "@/components/search-bar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations, useLocale } from "next-intl";
import { stopTranslations, searchBuses } from "@/lib/busData";
import { StopCombobox } from "@/components/stop-combobox";
import { formatNumber } from "@/lib/utils";
import { useStore } from "@/hooks/store";
import { useSearchQueries } from "@/hooks/use-search-queries";
import type { BusOperator } from "@/types";
import dynamic from "next/dynamic";
import { PaginatedBusListSkeleton } from "@/components/paginated-bus-list-skeleton";

const PaginatedBusList = dynamic(
	() => import("@/components/paginated-bus-list").then((mod) => mod.PaginatedBusList),
	{
		loading: () => <PaginatedBusListSkeleton />,
		ssr: false,
	}
);

interface BusesClientProps {
	initialBuses: BusOperator[];
	initialStops: string[];
}

export default function BusesClient({ initialBuses, initialStops }: BusesClientProps) {
	const t = useTranslations("Buses");
	const locale = useLocale();
	const { settings } = useStore();

	const allBuses = useMemo(() => initialBuses, [initialBuses]);
	const allStops = useMemo(() => initialStops, [initialStops]);

	// Service types filter list
	const serviceTypes = useMemo(() => {
		const types = new Set<string>();
		allBuses.forEach((b) => {
			if (b.service_type) types.add(b.service_type);
		});
		return Array.from(types).sort();
	}, [allBuses]);

	// Filter states driven directly by URL query parameters and useSearchQueries hook
	const { values, setValues } = useSearchQueries(["search", "service", "stop"], 300);

	const searchInput = values[0] || "";
	const selectedService = values[1] || "all";
	const selectedStop = values[2] || "all";

	const setSearchInput = (val: string) => {
		setValues((prev) => [val, prev[1], prev[2]]);
	};
	const handleClearSearch = () => {
		setValues((prev) => ["", prev[1], prev[2]]);
	};

	const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
		}, 200); // 200ms debounce for list filtering to keep typing fluid
		return () => clearTimeout(timer);
	}, [searchInput]);

	// Filtering logic
	const filteredBuses = useMemo(() => {
		let result = allBuses;

		// 1. Text Search using Fuse.js (same as routes page search logic)
		if (debouncedSearch.trim()) {
			result = searchBuses(debouncedSearch);
		}

		// 2. Service Type Filter
		if (selectedService !== "all") {
			result = result.filter((b) => b.service_type === selectedService);
		}

		// 3. Stop Intersection Filter
		if (selectedStop !== "all") {
			const targetStopNorm = selectedStop.toLowerCase().trim();
			result = result.filter((b) => {
				if (!b.routes || !b.routes.en) return false;
				return b.routes.en.some((s) => s.name.toLowerCase().trim() === targetStopNorm);
			});
		}

		return result;
	}, [allBuses, debouncedSearch, selectedService, selectedStop]);

	const handleServiceChange = (val: string) => {
		setValues((prev) => [prev[0], val === "all" ? "" : val, prev[2]]);
	};

	const handleStopChange = (val: string) => {
		setValues((prev) => [prev[0], prev[1], val === "all" ? "" : val]);
	};

	return (
		<main className="min-h-screen pb-16">
			{/* Hero banner */}
			<section className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/60 text-primary-foreground py-16 px-4 sm:px-6">
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
				</div>
				<div className="relative container mx-auto text-center space-y-4">
					<div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
						<Bus className="h-3.5 w-3.5" />
						{t("badge")}
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t("title")}</h1>
					<p className="text-sm sm:text-base text-primary-foreground/80 max-w-md mx-auto">{t("subtitle")}</p>
				</div>
			</section>

			{/* Filter Controls */}
			<section className="container mx-auto px-4 sm:px-6 py-8">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-card border rounded-2xl p-4 shadow-xs">
					{/* Search */}
					<div className="md:col-span-6">
						<SearchBar
							value={searchInput}
							onChange={setSearchInput}
							onClear={handleClearSearch}
							placeholder={t("searchPlaceholder")}
						/>
					</div>

					{/* Service Filter */}
					<div className="md:col-span-3">
						<Select value={selectedService} onValueChange={handleServiceChange}>
							<SelectTrigger className="w-full h-11!">
								<SelectValue placeholder={t("filterService")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all" className="h-11">
									{t("allServices")}
								</SelectItem>
								{serviceTypes.map((type) => (
									<SelectItem key={type} value={type} className="h-11">
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Stop Filter */}
					<div className="md:col-span-3">
						<StopCombobox
							label={t("filterStop")}
							value={selectedStop}
							onValueChange={(v) => handleStopChange(v || "all")}
							placeholder={t("filterStop")}
							availableStops={["all", ...allStops]}
							stopTranslations={stopTranslations}
							locale={locale}
							noStopsText={t("noStopsFound")}
							hideContainer={true}
							triggerClassName="w-full h-11 bg-background"
						/>
					</div>
				</div>

				{/* Results Label */}
				<div className="mt-6 flex items-center justify-between">
					<p className="text-sm text-muted-foreground font-medium">
						{t("totalBuses")}:{" "}
						<span className="text-foreground font-extrabold text-base">
							{formatNumber(filteredBuses.length, locale)}
						</span>
					</p>
				</div>

				{/* Buses Grid */}
				<div className="mt-6">
					{filteredBuses.length > 0 ? (
						<PaginatedBusList
							key={`${debouncedSearch}-${selectedService}-${selectedStop}`}
							buses={filteredBuses}
							locale={locale}
							settings={settings}
						/>
					) : (
						<div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-muted/5 max-w-md mx-auto mt-8">
							<Bus className="h-10 w-10 text-muted-foreground/40 mx-auto" />
							<p className="font-semibold text-foreground">{t("noBuses")}</p>
						</div>
					)}
				</div>
			</section>
		</main>
	);
}
