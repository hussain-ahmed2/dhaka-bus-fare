"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Bus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Route, Stop, BusOperator } from "@/types";
import { formatNumber, formatTime } from "@/lib/utils";
import { getBusesBetweenStopsOnRoute } from "@/lib/busData";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface FareResultCardProps {
	route: Route;
	distance: string;
	fare: number;
	path: Stop[];
	locale: string;
	index: number;
	fromStopName?: string;
	toStopName?: string;
}

export function FareResultCard({
	route,
	distance,
	fare,
	path,
	locale,
	index,
	fromStopName,
	toStopName,
}: FareResultCardProps) {
	const t = useTranslations("Calculator");

	const availableBuses =
		fromStopName && toStopName ? getBusesBetweenStopsOnRoute(route, fromStopName, toStopName) : [];

	return (
		<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
			<Card className="overflow-hidden hover:shadow-md transition-shadow">
				<CardHeader className="pb-3 border-b">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<Badge variant="secondary" className="text-[10px] font-bold tracking-widest text-primary">
								{locale === "en" ? route.code.en : route.code.bn}
							</Badge>
							<CardTitle className="text-lg">{locale === "en" ? route.name.en : route.name.bn}</CardTitle>
						</div>
						<div className="text-left sm:text-right shrink-0">
							<div className="text-2xl font-extrabold text-foreground leading-none">
								৳{formatNumber(fare, locale)}
							</div>
							<div className="text-sm text-muted-foreground font-medium mt-1">
								{formatNumber(distance, locale)} km
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-4 bg-background space-y-4">
					{/* Stop timeline path */}
					<div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
						{path.map((stop, sIdx) => (
							<div key={stop.name.en} className="flex items-center gap-2">
								<span
									className={
										sIdx === 0 || sIdx === path.length - 1 ? "text-foreground font-medium" : ""
									}
								>
									{locale === "en" ? stop.name.en : stop.name.bn}
								</span>
								{sIdx < path.length - 1 && (
									<ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
								)}
							</div>
						))}
					</div>

					{/* Available Buses */}
					{fromStopName && toStopName && (
						<div className="pt-3.5 border-t border-border/50 space-y-2.5">
							<span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
								{t("availableBuses")}
							</span>

							{availableBuses.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{availableBuses.map((bus, i) => (
										<BusOperatorItem key={`${bus.title.en}-${bus.routes?.en?.[0]?.name || ""}-${bus.routes?.en?.[bus.routes.en.length - 1]?.name || ""}-${i}`} bus={bus} locale={locale} />
									))}
								</div>
							) : (
								<p className="text-xs text-muted-foreground/60 italic font-medium">
									{t("noBusesFound")}
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

function BusOperatorItem({ bus, locale }: { bus: BusOperator; locale: string }) {
	const [hasError, setHasError] = useState(!bus.image);

	return (
		<div className="flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
			<div className="relative w-14 h-9 shrink-0 rounded-md overflow-hidden bg-muted border border-border/40 flex items-center justify-center">
				{hasError ? (
					<Bus className="h-5 w-5 text-muted-foreground/30" />
				) : (
					<Image
						src={bus.image!}
						alt={locale === "en" ? bus.title.en : bus.title.bn}
						fill
						className="object-cover object-center"
						onError={() => setHasError(true)}
						sizes="(max-width: 768px) 56px, 56px"
					/>
				)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="font-bold text-xs text-foreground truncate leading-snug">
					{locale === "en" ? bus.title.en : bus.title.bn}
				</div>
				<div className="flex items-center gap-1.5 mt-0.5">
					<Badge variant="outline" className="text-[8px] py-0 px-1 font-semibold border-transparent bg-primary/5 text-primary shrink-0">
						{bus.service_type || (locale === "en" ? "Standard" : "সাধারণ")}
					</Badge>
					<span className="text-[9px] text-muted-foreground flex items-center gap-0.5 truncate">
						<Clock className="h-2.5 w-2.5 shrink-0 text-muted-foreground/75" />
						{formatTime(bus.time.start, locale)} - {formatTime(bus.time.close, locale)}
					</span>
				</div>
			</div>
		</div>
	);
}
