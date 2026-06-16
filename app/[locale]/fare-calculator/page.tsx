"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Ticket, ArrowUpDown, ChevronRight, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { getAllRoutes, routeToSlug } from "@/lib/busData";
import { useStore } from "@/hooks/store";
import type { Route, Stop } from "@/types";
import { formatNumber } from "@/lib/utils";

const routes = getAllRoutes();

// Utility to get all unique stops
const allUniqueStops = Array.from(new Set(routes.flatMap((r) => r.stops.map((s) => s.name.en)))).sort();

// Provide translation dictionary for stop names (EN to BN)
const stopTranslations: Record<string, string> = {};
routes.forEach((r) => {
	r.stops.forEach((s) => {
		stopTranslations[s.name.en] = s.name.bn;
	});
});

export default function FareCalculatorPage() {
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

	const [hasCalculated, setHasCalculated] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);

		const params = new URLSearchParams(window.location.search);
		const route = params.get("route");
		const from = params.get("from");
		const to = params.get("to");

		if (route) setSelectedRouteSlug(route);
		if (from) setFromStopName(from);
		if (to) setToStopName(to);

		if (route || from || to) {
			setHasCalculated(true);
		}
	}, []);

	// Available stops based on route selection
	const availableStops = useMemo(() => {
		if (selectedRouteSlug === "all" || !selectedRouteSlug) {
			return allUniqueStops;
		}
		const r = routes.find((rt) => routeToSlug(rt) === selectedRouteSlug);
		return r ? r.stops.map((s) => s.name.en) : allUniqueStops;
	}, [selectedRouteSlug]);

	const handleCalculate = () => {
		if (fromStopName && toStopName && fromStopName !== toStopName) {
			setHasCalculated(true);
		}
	};

	const swapStops = () => {
		const temp = fromStopName;
		setFromStopName(toStopName);
		setToStopName(temp);
		setHasCalculated(false);
	};

	// Find matched routes when calculated
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

					// Get path stops
					const startIdx = Math.min(fromIdx, toIdx);
					const endIdx = Math.max(fromIdx, toIdx);
					const path = r.stops.slice(startIdx, endIdx + 1);
					// Always order path from user's from -> to
					const pathSorted = fromIdx < toIdx ? path : [...path].reverse();

					return {
						route: r,
						distance: distance.toFixed(1),
						fare,
						path: pathSorted,
					};
				}
				return null;
			})
			.filter(Boolean) as {
			route: Route;
			distance: string;
			fare: number;
			path: Stop[];
		}[];

		return matches.sort((a, b) => a.fare - b.fare);
	}, [hasCalculated, fromStopName, toStopName, selectedRouteSlug, settings]);

	if (!mounted) return null;

	return (
		<main className="min-h-screen">
			{/* Hero */}
			<section className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/60 text-primary-foreground py-16 px-4 sm:px-6">
				<div className="relative container mx-auto text-center space-y-4">
					<div className="flex items-center justify-center gap-4 mb-4">
						<div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
							<Calculator className="h-3.5 w-3.5" />
							{t("badge")}
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t("title")}</h1>
					<p className="text-sm sm:text-base text-primary-foreground/80 max-w-md mx-auto">{t("subtitle")}</p>
				</div>
			</section>

			{/* Main Content */}
			<section className="container mx-auto px-4 sm:px-6 py-10 lg:grid lg:grid-cols-12 lg:gap-8">
				{/* Left Column - Controls */}
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
							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
									{t("routeOp")}
								</label>
								<Select
									value={selectedRouteSlug || "all"}
									onValueChange={(v) => {
										setSelectedRouteSlug(v);
										setHasCalculated(false);
										setFromStopName(null);
										setToStopName(null);
									}}
								>
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

							<div className="space-y-4">
								<div className="space-y-1.5 border border-border p-3 rounded-xl bg-muted/20">
									<label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
										{t("selectFrom")}
									</label>
									<Select
										value={fromStopName || ""}
										onValueChange={(v) => {
											setFromStopName(v);
											setHasCalculated(false);
										}}
									>
										<SelectTrigger className="w-full bg-background">
											<SelectValue placeholder={t("boardingStop")} />
										</SelectTrigger>
										<SelectContent className="max-h-64">
											{availableStops.map((stop) => (
												<SelectItem key={stop} value={stop}>
													{locale === "en" ? stop : stopTranslations[stop] || stop}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

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

								<div className="space-y-1.5 border border-border p-3 rounded-xl bg-muted/20">
									<label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
										{t("selectTo")}
									</label>
									<Select
										value={toStopName || ""}
										onValueChange={(v) => {
											setToStopName(v);
											setHasCalculated(false);
										}}
									>
										<SelectTrigger className="w-full bg-background">
											<SelectValue placeholder={t("destinationStop")} />
										</SelectTrigger>
										<SelectContent className="max-h-64">
											{availableStops.map((stop) => (
												<SelectItem key={stop} value={stop}>
													{locale === "en" ? stop : stopTranslations[stop] || stop}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
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

				{/* Right Column - Results */}
				<div className="lg:col-span-8 mt-10 lg:mt-0">
					<div className="mb-6">
						<h2 className="text-2xl font-bold tracking-tight">{t("resultsTitle")}</h2>
						<p className="text-muted-foreground">
							{hasCalculated
								? t("resultsFound", {
										count: formatNumber(matchedRoutesData.length, locale),
									})
								: t("resultsEmpty")}
						</p>
					</div>

					<div className="space-y-4">
						<AnimatePresence mode="popLayout">
							{hasCalculated && matchedRoutesData.length === 0 && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-12 text-center"
								>
									<p className="text-muted-foreground font-medium">{t("noDirectRoutes")}</p>
									<p className="text-sm text-muted-foreground mt-2">{t("tryDifferent")}</p>
								</motion.div>
							)}

							{hasCalculated &&
								matchedRoutesData.map((data, idx) => (
									<motion.div
										key={data.route.code.en}
										initial={{ opacity: 0, y: 15 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.05 }}
									>
										<Card className="overflow-hidden hover:shadow-md transition-shadow">
											<CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
													<div className="space-y-1">
														<Badge
															variant="secondary"
															className="text-[10px] font-bold tracking-widest text-primary"
														>
															{locale === "en" ? data.route.code.en : data.route.code.bn}
														</Badge>
														<CardTitle className="text-lg">
															{locale === "en" ? data.route.name.en : data.route.name.bn}
														</CardTitle>
													</div>
													<div className="text-left sm:text-right shrink-0">
														<div className="text-2xl font-extrabold text-foreground leading-none">
															৳{formatNumber(data.fare, locale)}
														</div>
														<div className="text-sm text-muted-foreground font-medium mt-1">
															{formatNumber(data.distance, locale)} km
														</div>
													</div>
												</div>
											</CardHeader>
											<CardContent className="p-4 bg-background">
												<div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
													{data.path.map((stop, sIdx) => (
														<div key={stop.name.en} className="flex items-center gap-2">
															<span
																className={
																	sIdx === 0 || sIdx === data.path.length - 1
																		? "text-foreground font-medium"
																		: ""
																}
															>
																{locale === "en" ? stop.name.en : stop.name.bn}
															</span>
															{sIdx < data.path.length - 1 && (
																<ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
															)}
														</div>
													))}
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
						</AnimatePresence>

						{!hasCalculated && (
							<div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-12 text-center h-full min-h-75 flex flex-col items-center justify-center space-y-3">
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
