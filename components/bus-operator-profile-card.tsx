import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bus, Clock, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { estimateDistanceBetweenStops, stopTranslations } from "@/lib/busData";
import { StopCombobox } from "@/components/stop-combobox";
import { formatNumber } from "@/lib/utils";
import { useStore } from "@/hooks/store";
import type { BusOperator } from "@/types";
import Image from "next/image";

export function BusOperatorProfileCard({
	bus,
	locale,
	settings,
	priority = false,
}: {
	bus: BusOperator;
	locale: string;
	settings: { minFare: number; farePerKm: number };
	priority?: boolean;
}) {
	const t = useTranslations("Buses");
	const { busCalculators, setBusCalculator, expandedBuses, setBusExpanded } = useStore();
	const imageSrc = bus.image || "";
	const [hasError, setHasError] = useState(!bus.image);

	const expanded = !!expandedBuses[bus.title.en];
	const setExpanded = (val: boolean | ((prev: boolean) => boolean)) => {
		const next = typeof val === "function" ? val(expanded) : val;
		setBusExpanded(bus.title.en, next);
	};

	// Read built-in fare calculator states directly from Zustand store
	const calcState = busCalculators[bus.title.en];
	const boardingStop = calcState?.boarding || null;
	const destinationStop = calcState?.destination || null;

	const handleBoardingChange = (val: string | null) => {
		setBusCalculator(bus.title.en, val, destinationStop);
	};

	const handleDestinationChange = (val: string | null) => {
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
							priority={priority}
						/>
					)}
				</div>

				<div className="flex-1 min-w-0 space-y-2">
					<h3 className="font-extrabold text-lg text-foreground leading-tight truncate">
						{locale === "en" ? bus.title.en : bus.title.bn}
					</h3>

					<div className="flex flex-wrap gap-1.5 items-center">
						<Badge
							variant="secondary"
							className="text-[10px] font-bold bg-primary/10 text-primary border-transparent"
						>
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
										<span className="text-xs font-bold text-foreground">{stop.name}</span>
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
