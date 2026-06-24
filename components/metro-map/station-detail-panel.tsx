"use client";

import { motion } from "motion/react";
import { X, Navigation, TrainFront } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/utils";
import type { MetroStation } from "@/types";
import { calculateMetroFare, getMetroFareWithCard, haversineDistance, findNearestStation } from "@/lib/metroData";

interface StationDetailPanelProps {
	selectedStation: MetroStation;
	userLocation: { lat: number; lng: number; accuracy: number } | null;
	operating: boolean;
	nextTrain: number;
	onClose: () => void;
}

export function StationDetailPanel({
	selectedStation,
	userLocation,
	operating,
	nextTrain,
	onClose,
}: StationDetailPanelProps) {
	const t = useTranslations("Metro");
	const locale = useLocale();

	return (
		<motion.div
			initial={{ y: "100%", opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: "100%", opacity: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className="absolute bottom-0 left-0 right-0 sm:bottom-4 sm:left-3 sm:right-auto sm:w-[350px] z-1001 pointer-events-auto"
		>
			<div className="bg-background/95 backdrop-blur-xl rounded-t-2xl sm:rounded-xl border-t sm:border border-border shadow-2xl p-4 space-y-4">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div className="space-y-0.5">
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
								<TrainFront className="w-2.5 h-2.5" />
								{t("mrtLine6")}
							</span>
							{selectedStation.underConstruction && (
								<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
									{t("underConstruction")}
								</span>
							)}
						</div>
						<h3 className="text-base font-bold text-foreground">
							{locale === "en" ? selectedStation.name.en : selectedStation.name.bn}
						</h3>
						<p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
							{t("stationDetails")}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
						aria-label={t("close")}
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Info Grid */}
				<div className="grid grid-cols-2 gap-2 text-xs">
					<div className="bg-muted/30 border border-border/50 rounded-lg p-2 space-y-0.5">
						<p className="text-[9px] text-muted-foreground font-semibold uppercase">{t("distance")}</p>
						<p className="font-bold text-foreground">
							{formatNumber(selectedStation.distanceFromStart, locale)} {t("km")}
						</p>
						<p className="text-[8px] text-muted-foreground">from Uttara North</p>
					</div>

					<div className="bg-muted/30 border border-border/50 rounded-lg p-2 space-y-0.5">
						<p className="text-[9px] text-muted-foreground font-semibold uppercase">Next Train</p>
						<p
							className={`font-bold ${selectedStation.underConstruction ? "text-muted-foreground" : "text-primary"}`}
						>
							{selectedStation.underConstruction
								? t("notOperational")
								: operating && nextTrain > 0
									? t("nextTrain", { minutes: formatNumber(nextTrain, locale) })
									: "—"}
						</p>
						<p className="text-[8px] text-muted-foreground">
							{selectedStation.underConstruction ? t("status") : "based on schedule"}
						</p>
					</div>
				</div>

				{/* User location info (Distance & Fare) */}
				{userLocation && (
					<div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
						{(() => {
							const dist = haversineDistance(
								userLocation.lat,
								userLocation.lng,
								selectedStation.lat,
								selectedStation.lng,
							);
							const walkingMin = Math.ceil((dist / 5) * 60);
							const isCurrent =
								findNearestStation(userLocation.lat, userLocation.lng).station.id ===
								selectedStation.id;

							const isUnderConstruction = selectedStation.underConstruction;
							const nearestOperationalId = findNearestStation(userLocation.lat, userLocation.lng).station
								.id;
							const fareVal = isUnderConstruction
								? 0
								: calculateMetroFare(nearestOperationalId, selectedStation.id);
							const cardFareVal = getMetroFareWithCard(fareVal);

							return (
								<>
									<div className="flex items-center justify-between text-xs">
										<div className="flex items-center gap-1.5 text-muted-foreground">
											<Navigation className="w-3.5 h-3.5 text-primary" />
											<span>
												{isCurrent
													? "You are here"
													: `${formatNumber(dist.toFixed(1), locale)} ${t("km")} away`}
											</span>
										</div>
										{!isCurrent && (
											<span className="text-[10px] text-muted-foreground font-bold">
												~{formatNumber(walkingMin, locale)} {t("min")} walk
											</span>
										)}
									</div>

									{!isUnderConstruction && !isCurrent && fareVal > 0 && (
										<div className="flex items-center justify-between pt-1.5 border-t border-primary/10 text-xs">
											<span className="text-[10px] text-muted-foreground font-medium">
												{t("fareFromLocation")}
											</span>
											<div className="flex items-center gap-1.5 font-bold">
												<span className="text-foreground">
													৳{formatNumber(fareVal, locale)}
												</span>
												<span className="text-primary text-[10px] bg-primary/10 px-1.5 py-0.5 rounded">
													৳{formatNumber(cardFareVal, locale)} Card
												</span>
											</div>
										</div>
									)}
								</>
							);
						})()}
					</div>
				)}

				{/* Actions */}
				<a
					href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}&travelmode=walking`}
					target="_blank"
					rel="noopener noreferrer"
					className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md text-center cursor-pointer"
				>
					<Navigation className="h-3.5 w-3.5 rotate-45" />
					{t("getDirections")}
				</a>
			</div>
		</motion.div>
	);
}
