"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Ticket, ArrowUpDown, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { getAllRoutes, routeToSlug } from "@/lib/busData";
import { useStore } from "@/hooks/store";
import type { Route, Stop } from "@/types";
import { StopCombobox } from "@/components/stop-combobox";
import { FareResultCard } from "@/components/fare-result-card";
import { findConnectingRoutes } from "@/lib/connectingRoutes";
import { ConnectingResultCard } from "@/components/connecting-result-card";
import { formatNumber } from "@/lib/utils";

const routes = getAllRoutes();

const allUniqueStops = Array.from(new Set(routes.flatMap((r) => r.stops.map((s) => s.name.en)))).sort();

const stopTranslations: Record<string, string> = {};
routes.forEach((r) => {
	r.stops.forEach((s) => {
		stopTranslations[s.name.en] = s.name.bn;
	});
});

export default function FareCalculatorClient() {
	const {
		settings,
		selectedRouteSlug,
		setSelectedRouteSlug,
		fromStopName,
		setFromStopName,
		toStopName,
		setToStopName,
	} = useStore();
	const t = useTranslations("Calculator");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const [hasCalculated, setHasCalculated] = useState(false);

	// Read URL params on mount and pre-fill selections
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const route = params.get("route");
		const from = params.get("from");
		const to = params.get("to");

		if (route) setSelectedRouteSlug(route);
		if (from) setFromStopName(from);
		if (to) setToStopName(to);
		if (route || from || to) {
			setHasCalculated(true);
			// Give React one tick to render the results section, then scroll
			setTimeout(() => {
				document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const availableStops = useMemo(() => {
		if (selectedRouteSlug === "all" || !selectedRouteSlug) return allUniqueStops;
		const r = routes.find((rt) => routeToSlug(rt) === selectedRouteSlug);
		return r ? r.stops.map((s) => s.name.en) : allUniqueStops;
	}, [selectedRouteSlug]);

	const swapStops = () => {
		const temp = fromStopName;
		setFromStopName(toStopName);
		setToStopName(temp);
		setHasCalculated(false);
		router.replace(pathname, { scroll: false });
	};

	const handleCalculate = () => {
		if (fromStopName && toStopName && fromStopName !== toStopName) {
			setHasCalculated(true);
			const params = new URLSearchParams();
			params.set("route", selectedRouteSlug || "all");
			params.set("from", fromStopName);
			params.set("to", toStopName);
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		}
	};

	const handleRouteChange = (slug: string) => {
		setSelectedRouteSlug(slug);
		setHasCalculated(false);
		setFromStopName(null);
		setToStopName(null);
		router.replace(pathname, { scroll: false });
	};

	const handleStopChange = (type: "from" | "to", name: string | null) => {
		if (type === "from") setFromStopName(name);
		else setToStopName(name);
		setHasCalculated(false);
		router.replace(pathname, { scroll: false });
	};

	const matchedRoutesData = useMemo(() => {
		if (!hasCalculated || !fromStopName || !toStopName) return [];

		let targetRoutes = routes;
		if (selectedRouteSlug && selectedRouteSlug !== "all") {
			const r = routes.find((rt) => routeToSlug(rt) === selectedRouteSlug);
			if (r) targetRoutes = [r];
		}

		const matches = targetRoutes
			.map((r) => {
				const fromIdx = r.stops.findIndex((s) => s.name.en === fromStopName);
				const toIdx = r.stops.findIndex((s) => s.name.en === toStopName);
				if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
					const distance = Math.abs(r.stops[toIdx].distance - r.stops[fromIdx].distance);
					const rawFare = distance * settings.farePerKm;
					const fare = Math.max(settings.minFare, Math.ceil(rawFare / 5) * 5);
					const startIdx = Math.min(fromIdx, toIdx);
					const endIdx = Math.max(fromIdx, toIdx);
					const path = r.stops.slice(startIdx, endIdx + 1);
					const pathSorted = fromIdx < toIdx ? path : [...path].reverse();
					return { route: r, distance: distance.toFixed(1), fare, path: pathSorted };
				}
				return null;
			})
			.filter(Boolean) as { route: Route; distance: string; fare: number; path: Stop[] }[];

		return matches.sort((a, b) => a.fare - b.fare);
	}, [hasCalculated, fromStopName, toStopName, selectedRouteSlug, settings]);

	const connectingRoutesData = useMemo(() => {
		if (!hasCalculated || !fromStopName || !toStopName || matchedRoutesData.length > 0) return [];
		return findConnectingRoutes(fromStopName, toStopName, routes, settings);
	}, [hasCalculated, fromStopName, toStopName, matchedRoutesData, settings]);

	return (
		<main className="min-h-screen">
			{/* Hero */}
			<section className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/60 text-primary-foreground py-16 px-4 sm:px-6">
				<div className="relative container mx-auto text-center space-y-4">
					<div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
						<Calculator className="h-3.5 w-3.5" />
						{t("badge")}
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t("title")}</h1>
					<p className="text-sm sm:text-base text-primary-foreground/80 max-w-md mx-auto">{t("subtitle")}</p>
				</div>
			</section>

			{/* Main Content */}
			<section className="container mx-auto px-4 sm:px-6 py-10 lg:grid lg:grid-cols-12 lg:gap-8">
				{/* Left — Controls */}
				<div className="lg:col-span-4 space-y-6">
					<Card className="sticky top-24">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg flex items-center gap-2">
								<Ticket className="h-5 w-5 text-primary" />
								{t("journeyDetails")}
							</CardTitle>
							<CardDescription>{t("journeySelect")}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							{/* Route selector */}
							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
									{t("routeOp")}
								</label>
								<Select value={selectedRouteSlug || "all"} onValueChange={handleRouteChange}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={t("allRoutes")} />
									</SelectTrigger>
									<SelectContent className="max-h-72">
										<SelectItem value="all">
											<span className="font-semibold text-primary">{t("allRoutes")}</span>
										</SelectItem>
										{routes.map((r) => (
											<SelectItem key={r.code.en} value={routeToSlug(r)}>
												<span className="font-semibold">
													{locale === "en" ? r.code.en : r.code.bn}
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Stop pickers */}
							<div className="space-y-4">
								<StopCombobox
									label={t("selectFrom")}
									value={fromStopName}
									onValueChange={(v) => handleStopChange("from", v)}
									placeholder={t("boardingStop")}
									availableStops={availableStops}
									stopTranslations={stopTranslations}
									locale={locale}
									noStopsText={t("noStopsFound")}
								/>

								<div className="flex justify-center relative z-10">
									<Button
										variant="outline"
										size="icon"
										onClick={swapStops}
										className="h-8 w-8 rounded-full shadow-sm bg-background border-border"
									>
										<ArrowUpDown className="h-4 w-4 text-muted-foreground" />
									</Button>
								</div>

								<StopCombobox
									label={t("selectTo")}
									value={toStopName}
									onValueChange={(v) => handleStopChange("to", v)}
									placeholder={t("destinationStop")}
									availableStops={availableStops}
									stopTranslations={stopTranslations}
									locale={locale}
									noStopsText={t("noStopsFound")}
								/>
							</div>

							<div className="pt-2">
								<Button
									className="w-full h-11 text-base shadow-sm"
									onClick={handleCalculate}
									disabled={!fromStopName || !toStopName || fromStopName === toStopName}
								>
									{t("calcButton")}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right — Results */}
				<div id="results" className="lg:col-span-8 mt-10 lg:mt-0">
					<div className="mb-6">
						<h2 className="text-2xl font-bold tracking-tight">{t("resultsTitle")}</h2>
						<p className="text-muted-foreground">
							{hasCalculated
								? matchedRoutesData.length > 0
									? t("resultsFound", { count: formatNumber(matchedRoutesData.length, locale) })
									: connectingRoutesData.length > 0
										? t("connectingResultsFound", {
												count: formatNumber(connectingRoutesData.length, locale),
											})
										: t("resultsFound", { count: formatNumber(0, locale) })
								: t("resultsEmpty")}
						</p>
					</div>

					<div className="space-y-4">
						<AnimatePresence mode="popLayout">
							{hasCalculated && matchedRoutesData.length === 0 && connectingRoutesData.length === 0 && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-12 text-center"
								>
									<p className="text-muted-foreground font-medium">{t("noRoutesFound")}</p>
									<p className="text-sm text-muted-foreground mt-2">{t("tryDifferent")}</p>
								</motion.div>
							)}

							{hasCalculated &&
								matchedRoutesData.map((data, idx) => (
									<FareResultCard
										key={data.route.code.en}
										route={data.route}
										distance={data.distance}
										fare={data.fare}
										path={data.path}
										locale={locale}
										index={idx}
									/>
								))}

							{hasCalculated && matchedRoutesData.length === 0 && connectingRoutesData.length > 0 && (
								<div className="space-y-4">
									<div className="flex items-center gap-2 mb-2">
										<span className="h-px bg-border grow" />
										<span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 shrink-0">
											{t("connectingRoutesTitle")}
										</span>
										<span className="h-px bg-border grow" />
									</div>
									{connectingRoutesData.map((cRoute, idx) => (
										<ConnectingResultCard
											key={`${cRoute.leg1.route.code.en}-${cRoute.transferStop}-${cRoute.leg2.route.code.en}-${idx}`}
											connectingRoute={cRoute}
											locale={locale}
											index={idx}
											stopTranslations={stopTranslations}
										/>
									))}
								</div>
							)}
						</AnimatePresence>

						{!hasCalculated && (
							<div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-12 text-center min-h-75 flex flex-col items-center justify-center space-y-3">
								<Ticket className="h-10 w-10 text-muted-foreground/50" />
								<p className="text-muted-foreground">{t("resultsWillAppear")}</p>
							</div>
						)}
					</div>
				</div>
			</section>
		</main>
	);
}
