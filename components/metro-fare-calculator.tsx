"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpDown, Ticket, ArrowRight, TrainFront, CreditCard } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
	calculateMetroFare,
	getMetroFareWithCard,
	getMetroStations,
	getStationCount,
	getEstimatedTravelTime,
	getDistanceBetweenStations,
	metroStopTranslations,
} from "@/lib/metroData";
import { formatNumber } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { StopCombobox } from "@/components/stop-combobox";

export default function MetroFareCalculator() {
	const t = useTranslations("Metro");
	const locale = useLocale();
	const stations = getMetroStations();

	const [fromId, setFromId] = useState<string | null>(null);
	const [toId, setToId] = useState<string | null>(null);

	const availableStops = useMemo(() => stations.map((s) => s.name.en), [stations]);

	const fromStation = fromId ? stations.find((s) => s.id === fromId) : null;
	const toStation = toId ? stations.find((s) => s.id === toId) : null;

	const handleFromChange = (stopName: string | null) => {
		if (!stopName) {
			setFromId(null);
			return;
		}
		const station = stations.find((s) => s.name.en === stopName);
		setFromId(station?.id ?? null);
	};

	const handleToChange = (stopName: string | null) => {
		if (!stopName) {
			setToId(null);
			return;
		}
		const station = stations.find((s) => s.name.en === stopName);
		setToId(station?.id ?? null);
	};

	const handleSwap = () => {
		setFromId(toId);
		setToId(fromId);
	};

	const canCalc = fromId !== null && toId !== null && fromId !== toId;
	const fare = canCalc ? calculateMetroFare(fromId, toId) : null;
	const cardFare = fare !== null ? getMetroFareWithCard(fare) : null;
	const stationCount = canCalc ? getStationCount(fromId, toId) : null;
	const travelTime = canCalc ? getEstimatedTravelTime(fromId, toId) : null;
	const distance = canCalc ? getDistanceBetweenStations(fromId, toId) : null;

	// Get stations between from and to for path visualization
	const pathStations = useMemo(() => {
		if (!canCalc) return [];
		const fromIdx = stations.findIndex((s) => s.id === fromId);
		const toIdx = stations.findIndex((s) => s.id === toId);
		const start = Math.min(fromIdx, toIdx);
		const end = Math.max(fromIdx, toIdx);
		const result = stations.slice(start, end + 1);
		return fromIdx > toIdx ? [...result].reverse() : result;
	}, [canCalc, fromId, toId, stations]);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<TrainFront className="h-4 w-4 text-primary" />
						{t("fareCalc")}
					</CardTitle>
					<CardDescription>{t("fareNote")}</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* From Station */}
					<StopCombobox
						label={t("from")}
						value={fromStation?.name.en ?? null}
						onValueChange={handleFromChange}
						placeholder={t("selectStation")}
						availableStops={availableStops}
						stopTranslations={metroStopTranslations}
						locale={locale}
						noStopsText={t("noStationsFound")}
					/>

					{/* Swap icon */}
					<div className="flex justify-center">
						<button
							onClick={handleSwap}
							className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
							aria-label="Swap stations"
						>
							<ArrowUpDown className="h-3.5 w-3.5" />
						</button>
					</div>

					{/* To Station */}
					<StopCombobox
						label={t("to")}
						value={toStation?.name.en ?? null}
						onValueChange={handleToChange}
						placeholder={t("selectStation")}
						availableStops={availableStops}
						stopTranslations={metroStopTranslations}
						locale={locale}
						noStopsText={t("noStationsFound")}
					/>

					<Separator />

					{/* Result */}
					<AnimatePresence mode="wait">
						{fare !== null && cardFare !== null ? (
							<motion.div
								key="result"
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.25 }}
								className="space-y-4"
								aria-live="polite"
							>
								{/* Fare Display */}
								<div className="grid grid-cols-2 gap-3">
									{/* Single Ticket */}
									<div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center space-y-1">
										<div className="flex items-center justify-center gap-1.5 mb-1">
											<Ticket className="h-3.5 w-3.5 text-primary" />
											<p className="text-[10px] text-primary font-semibold uppercase tracking-wider">
												{t("singleTicket")}
											</p>
										</div>
										<span className="text-3xl font-black text-primary">
											৳{formatNumber(fare, locale)}
										</span>
									</div>

									{/* Card Fare */}
									<div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center space-y-1">
										<div className="flex items-center justify-center gap-1.5 mb-1">
											<CreditCard className="h-3.5 w-3.5 text-blue-600" />
											<p className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider">
												{t("mrtPass")}
											</p>
										</div>
										<span className="text-3xl font-black text-blue-700">
											৳{formatNumber(cardFare, locale)}
										</span>
										<Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[9px] ml-1">
											{t("discount")}
										</Badge>
									</div>
								</div>

								{/* Stats Row */}
								<div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
									<span className="font-semibold">
										{formatNumber(stationCount!, locale)} {t("stationsTraveled")}
									</span>
									<span className="text-border">|</span>
									<span className="font-semibold">
										{formatNumber(Number(distance!.toFixed(1)), locale)} {t("km")}
									</span>
									<span className="text-border">|</span>
									<span className="font-semibold">
										~{formatNumber(travelTime!, locale)} {t("min")}
									</span>
								</div>

								{/* Visual Path */}
								<div className="bg-muted/30 rounded-xl border border-border/50 p-3 sm:p-4 overflow-hidden relative">
									<div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
										<TrainFront className="h-12 w-12 rotate-12" />
									</div>
									<div className="flex flex-col gap-3 sm:gap-4">
										<div className="flex items-center justify-between border-b border-border/50 pb-2">
											<span className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
												{t("stationsTraveled")}
											</span>
											<span className="text-[9px] sm:text-[10px] font-bold text-primary">
												{pathStations.length} {t("stations")}
											</span>
										</div>
										<div className="flex flex-wrap items-center gap-y-6 justify-center sm:justify-start">
											{pathStations.map((station, i, arr) => (
												<div key={station.id} className="flex items-center">
													<div className="flex flex-col gap-1 items-center text-center px-2 sm:px-3">
														<div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[8px] sm:text-[9px] font-black shadow-sm">
															{i + 1}
														</div>
														<span className="text-[9px] sm:text-[10px] font-bold text-foreground max-w-[60px] sm:max-w-[70px] leading-tight line-clamp-2">
															{locale === "en" ? station.name.en : station.name.bn}
														</span>
													</div>
													{i < arr.length - 1 && (
														<ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/40 animate-pulse mx-0.5" />
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							</motion.div>
						) : (
							<motion.div
								key="placeholder"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="rounded-xl border border-dashed border-border p-6 text-center space-y-2 bg-muted/5 mt-4"
							>
								<div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-2">
									<TrainFront className="h-5 w-5 text-primary/40" />
								</div>
								<p className="text-sm font-medium text-muted-foreground">
									{t("selectDifferentStations")}
								</p>
							</motion.div>
						)}
					</AnimatePresence>

					<p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed pt-2">
						{t("cardDiscountNote")}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
