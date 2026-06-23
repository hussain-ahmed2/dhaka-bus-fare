"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bus, Clock, MapPin, Search, ChevronDown, ChevronUp, Calculator, Calendar, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { getAllBuses, getAllBusStops, estimateDistanceBetweenStops, stopTranslations } from "@/lib/busData";
import { StopCombobox } from "@/components/stop-combobox";
import { formatNumber } from "@/lib/utils";
import { useStore } from "@/hooks/store";
import type { BusOperator } from "@/types";
import Image from "next/image";

const ITEMS_PER_PAGE = 12;

export default function BusesClient() {
	const t = useTranslations("Buses");
	const locale = useLocale();
	const { settings } = useStore();
	const router = useRouter();
	const pathname = usePathname();

	const allBuses = useMemo(() => getAllBuses(), []);
	const allStops = useMemo(() => getAllBusStops(), []);

	// Service types filter list
	const serviceTypes = useMemo(() => {
		const types = new Set<string>();
		allBuses.forEach((b) => {
			if (b.service_type) types.add(b.service_type);
		});
		return Array.from(types).sort();
	}, [allBuses]);

	// Filter states
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedService, setSelectedService] = useState<string>("all");
	const [selectedStop, setSelectedStop] = useState<string>("all");
	const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

	// Read URL query params on mount
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const search = params.get("search") || "";
		const service = params.get("service") || "all";
		const stop = params.get("stop") || "all";

		setSearchQuery(search);
		setSelectedService(service);
		setSelectedStop(stop);
	}, []);

	// Filtering logic
	const filteredBuses = useMemo(() => {
		let result = allBuses;

		// 1. Text Search
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			result = result.filter(
				(b) =>
					b.title.en.toLowerCase().includes(query) ||
					b.title.bn.toLowerCase().includes(query) ||
					(b.service_type && b.service_type.toLowerCase().includes(query))
			);
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
	}, [allBuses, searchQuery, selectedService, selectedStop]);

	const displayedBuses = useMemo(() => {
		return filteredBuses.slice(0, visibleCount);
	}, [filteredBuses, visibleCount]);

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setSearchQuery(val);
		setVisibleCount(ITEMS_PER_PAGE);

		const params = new URLSearchParams(window.location.search);
		if (val.trim()) {
			params.set("search", val);
		} else {
			params.delete("search");
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const handleServiceChange = (val: string) => {
		setSelectedService(val);
		setVisibleCount(ITEMS_PER_PAGE);

		const params = new URLSearchParams(window.location.search);
		if (val && val !== "all") {
			params.set("service", val);
		} else {
			params.delete("service");
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const handleStopChange = (val: string) => {
		setSelectedStop(val);
		setVisibleCount(ITEMS_PER_PAGE);

		const params = new URLSearchParams(window.location.search);
		if (val && val !== "all") {
			params.set("stop", val);
		} else {
			params.delete("stop");
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
					<div className="md:col-span-6 relative">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t("searchPlaceholder")}
							value={searchQuery}
							onChange={handleSearchChange}
							className="pl-10 h-11"
						/>
					</div>

					{/* Service Filter */}
					<div className="md:col-span-3">
						<Select value={selectedService} onValueChange={handleServiceChange}>
							<SelectTrigger className="w-full h-11!">
								<SelectValue placeholder={t("filterService")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all" className="h-11">{t("allServices")}</SelectItem>
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
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{displayedBuses.map((bus, i) => (
								<BusOperatorProfileCard key={`${bus.title.en}-${bus.routes?.en?.[0]?.name || ""}-${bus.routes?.en?.[bus.routes.en.length - 1]?.name || ""}-${i}`} bus={bus} locale={locale} settings={settings} />
							))}
						</div>
					) : (
						<div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-muted/5 max-w-md mx-auto mt-8">
							<Bus className="h-10 w-10 text-muted-foreground/40 mx-auto" />
							<p className="font-semibold text-foreground">{t("noBuses")}</p>
						</div>
					)}
				</div>

				{/* Load More Button */}
				{filteredBuses.length > visibleCount && (
					<div className="mt-12 text-center">
						<Button onClick={handleLoadMore} size="lg" variant="outline" className="px-8 shadow-xs">
							{locale === "en" ? "Load More Operators" : "আরো অপারেটর দেখুন"}
						</Button>
					</div>
				)}
			</section>
		</main>
	);
}

function BusOperatorProfileCard({
	bus,
	locale,
	settings,
}: {
	bus: BusOperator;
	locale: string;
	settings: { minFare: number; farePerKm: number };
}) {
	const t = useTranslations("Buses");
	const { busCalculators, setBusCalculator, expandedBuses, setBusExpanded } = useStore();
	const [imageSrc, setImageSrc] = useState(bus.image || "");
	const [hasError, setHasError] = useState(!bus.image);
	const [expanded, setExpandedState] = useState(false);

	// Load expanded state on mount
	useEffect(() => {
		const isExpanded = expandedBuses[bus.title.en];
		if (isExpanded !== undefined) {
			setExpandedState(isExpanded);
		}
	}, [expandedBuses, bus.title.en]);

	const setExpanded = (val: boolean | ((prev: boolean) => boolean)) => {
		if (typeof val === "function") {
			setExpandedState((prev) => {
				const next = val(prev);
				setBusExpanded(bus.title.en, next);
				return next;
			});
		} else {
			setExpandedState(val);
			setBusExpanded(bus.title.en, val);
		}
	};

	// Built-in fare calculator states
	const [boardingStop, setBoardingStop] = useState<string | null>(null);
	const [destinationStop, setDestinationStop] = useState<string | null>(null);

	// Load from Zustand store on mount (persists across locale/language switch)
	useEffect(() => {
		const calcState = busCalculators[bus.title.en];
		if (calcState) {
			if (calcState.boarding) setBoardingStop(calcState.boarding);
			if (calcState.destination) setDestinationStop(calcState.destination);
		}
	}, [busCalculators, bus.title.en]);

	const handleBoardingChange = (val: string | null) => {
		setBoardingStop(val);
		setBusCalculator(bus.title.en, val, destinationStop);
	};

	const handleDestinationChange = (val: string | null) => {
		setDestinationStop(val);
		setBusCalculator(bus.title.en, boardingStop, val);
	};

	const stopsList = locale === "en" ? bus.routes.en : bus.routes.bn;
	const stopsEn = bus.routes.en.map((s) => s.name);

	const cardStopTranslations = useMemo(() => {
		const mapping: Record<string, string> = { ...stopTranslations };
		bus.routes.en.forEach((s, idx) => {
			const bnName = bus.routes.bn[idx]?.name;
			if (bnName) {
				mapping[s.name] = bnName;
			}
		});
		return mapping;
	}, [bus.routes.en, bus.routes.bn]);

	const handleImageError = () => {
		setHasError(true);
	};

	// Calculated values
	const calculatedDistance = useMemo(() => {
		if (boardingStop && destinationStop && boardingStop !== destinationStop) {
			return estimateDistanceBetweenStops(boardingStop, destinationStop);
		}
		return 0;
	}, [boardingStop, destinationStop]);

	const calculatedFare = useMemo(() => {
		if (calculatedDistance > 0) {
			const rawFare = calculatedDistance * settings.farePerKm;
			return Math.max(settings.minFare, Math.ceil(rawFare / 5) * 5);
		}
		return 0;
	}, [calculatedDistance, settings]);

	return (
		<Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-all border-border bg-card">
			{/* Top Panel - Main details */}
			<div className="flex p-4 gap-4 items-center">
				<div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
					{hasError ? (
						<Bus className="h-10 w-10 text-muted-foreground/30" />
					) : (
						<Image
							src={imageSrc}
							alt={locale === "en" ? bus.title.en : bus.title.bn}
							fill
							className="object-cover object-center"
							onError={handleImageError}
							sizes="(max-width: 768px) 112px, 112px"
						/>
					)}
				</div>

				<div className="flex-1 min-w-0 space-y-2">
					<h3 className="font-extrabold text-lg text-foreground leading-tight truncate">
						{locale === "en" ? bus.title.en : bus.title.bn}
					</h3>

					<div className="flex flex-wrap gap-1.5 items-center">
						<Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-transparent">
							{bus.service_type || "Standard"}
						</Badge>
					</div>

					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Clock className="h-3.5 w-3.5 shrink-0" />
						<span className="font-medium">
							{t("operatingHours")}: {bus.time.start} - {bus.time.close}
						</span>
					</div>
				</div>
			</div>

			<Separator />

			{/* Toggle stops sequence */}
			<div className="px-4 py-2 bg-muted/10 flex justify-between items-center">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setExpanded(!expanded)}
					className="text-xs font-semibold text-primary hover:bg-primary/5 px-2"
				>
					{expanded ? (
						<span className="flex items-center gap-1">
							{locale === "en" ? "Hide Stops" : "স্টপ লুকান"} <ChevronUp className="h-3.5 w-3.5" />
						</span>
					) : (
						<span className="flex items-center gap-1">
							{locale === "en" ? "Show Stops Sequence" : "স্টপের তালিকা দেখুন"}{" "}
							<ChevronDown className="h-3.5 w-3.5" />
						</span>
					)}
				</Button>

				<Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 border-border">
					{stopsList.length} {locale === "en" ? "Stops" : "টি স্টপ"}
				</Badge>
			</div>

			{/* Expanded section */}
			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25 }}
						className="overflow-hidden bg-muted/5 border-t"
					>
						<div className="p-4 space-y-6">
							{/* Fare Calculator Box */}
							<div className="p-3 sm:p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-4">
								<div className="flex items-center gap-2">
									<Calculator className="h-4 w-4 text-primary" />
									<span className="text-xs font-bold text-primary uppercase tracking-wider">
										{t("estimateFare")}
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{/* Boarding */}
									<div className="space-y-1">
										<span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wide block">
											{t("selectBoarding")}
										</span>
										<StopCombobox
											label={t("selectBoarding")}
											value={boardingStop}
											onValueChange={handleBoardingChange}
											placeholder={t("selectBoarding")}
											availableStops={stopsEn}
											stopTranslations={cardStopTranslations}
											locale={locale}
											noStopsText={t("noStopsFound")}
											hideContainer={true}
											triggerClassName="w-full h-9 bg-background text-xs"
										/>
									</div>

									{/* Destination */}
									<div className="space-y-1">
										<span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wide block">
											{t("selectDestination")}
										</span>
										<StopCombobox
											label={t("selectDestination")}
											value={destinationStop}
											onValueChange={handleDestinationChange}
											placeholder={t("selectDestination")}
											availableStops={stopsEn}
											stopTranslations={cardStopTranslations}
											locale={locale}
											noStopsText={t("noStopsFound")}
											hideContainer={true}
											triggerClassName="w-full h-9 bg-background text-xs"
										/>
									</div>
								</div>

								{/* Fare Result */}
								{calculatedFare > 0 && (
									<div className="pt-2 flex items-center justify-between bg-background border rounded-lg px-4 py-2.5 shadow-2xs">
										<div className="flex flex-col">
											<span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
												{t("calculatedFare")}
											</span>
											<span className="text-base font-black text-foreground">
												৳{formatNumber(calculatedFare, locale)}
											</span>
										</div>
										<div className="flex flex-col items-end">
											<span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
												{t("distance")}
											</span>
											<span className="text-xs font-semibold text-muted-foreground">
												{formatNumber(calculatedDistance.toFixed(1), locale)} km
											</span>
										</div>
									</div>
								)}
							</div>

							{/* Vertical Stops Timeline */}
							<div className="space-y-3.5 pl-2 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
								{stopsList.map((stop, sIdx) => (
									<div key={sIdx} className="flex items-center gap-3 relative z-10">
										<div className="w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[7px] font-black text-primary shadow-xs">
											{sIdx + 1}
										</div>
										<span className="text-xs font-bold text-foreground">
											{stop.name}
										</span>
									</div>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</Card>
	);
}
