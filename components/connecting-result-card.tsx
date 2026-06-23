"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, ArrowRight, RefreshCw, Bus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConnectingRoute } from "@/lib/connectingRoutes";
import type { Route, BusOperator } from "@/types";
import { formatNumber, formatTime } from "@/lib/utils";
import { getBusesBetweenStopsOnRoute } from "@/lib/busData";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface ConnectingResultCardProps {
	connectingRoute: ConnectingRoute;
	locale: string;
	index: number;
	stopTranslations: Record<string, string>;
}

export function ConnectingResultCard({
	connectingRoute,
	locale,
	index,
	stopTranslations,
}: ConnectingResultCardProps) {
	const { leg1, leg2, transferStop, totalFare, totalDistance } = connectingRoute;
	const t = useTranslations("Calculator");

	const getStopName = (nameEn: string) => {
		if (locale === "bn") {
			return stopTranslations[nameEn] || nameEn;
		}
		return nameEn;
	};

	const getRouteCode = (route: Route) => {
		return locale === "en" ? route.code.en : route.code.bn;
	};

	const getRouteName = (route: Route) => {
		return locale === "en" ? route.name.en : route.name.bn;
	};

	// Match available buses for both legs
	const leg1Buses = getBusesBetweenStopsOnRoute(leg1.route, leg1.fromStop, leg1.toStop);
	const leg2Buses = getBusesBetweenStopsOnRoute(leg2.route, leg2.fromStop, leg2.toStop);

	return (
		<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
			<Card className="overflow-hidden hover:shadow-md transition-shadow">
				{/* Header - Styled like FareResultCard */}
				<CardHeader className="pb-3 border-b">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2 flex-wrap">
								<Badge
									variant="secondary"
									className="text-[10px] font-bold tracking-widest text-primary uppercase"
								>
									{locale === "en" ? "Connecting Route" : "সংযোগকারী রুট"}
								</Badge>
								<Badge
									variant="outline"
									className="text-[10px] font-semibold border-primary/30 text-primary"
								>
									{locale === "en" ? "1 Transfer" : "১টি স্থানান্তর"}
								</Badge>
							</div>
							<CardTitle className="text-lg font-bold flex items-center gap-2 flex-wrap">
								<span>{getStopName(leg1.fromStop)}</span>
								<ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
								<span className="text-primary font-bold">{getStopName(transferStop)}</span>
								<ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
								<span>{getStopName(leg2.toStop)}</span>
							</CardTitle>
						</div>
						<div className="text-left sm:text-right shrink-0">
							<div className="text-2xl font-extrabold text-foreground leading-none">
								৳{formatNumber(totalFare, locale)}
							</div>
							<div className="text-sm text-muted-foreground font-medium mt-1">
								{formatNumber(totalDistance, locale)} km
							</div>
						</div>
					</div>
				</CardHeader>

				{/* Content */}
				<CardContent className="p-4 sm:p-5 space-y-5 bg-background">
					{/* Leg 1 */}
					<div className="space-y-3">
						<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/20 pb-1.5">
							<div className="flex items-center gap-2">
								<Badge
									variant="secondary"
									className="text-[10px] font-bold tracking-widest text-primary uppercase"
								>
									{locale === "en" ? "Leg 1" : "১ম বাস"}
								</Badge>
								<span className="text-sm font-bold text-foreground">
									{getRouteCode(leg1.route)} — {getRouteName(leg1.route)}
								</span>
							</div>
							<span className="text-xs font-semibold text-muted-foreground">
								৳{formatNumber(leg1.fare, locale)} • {formatNumber(leg1.distance, locale)} km
							</span>
						</div>

						{/* Stop sequence */}
						<div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground pl-1">
							{leg1.path.map((stop, sIdx) => (
								<div key={stop.name.en} className="flex items-center gap-2">
									<span
										className={
											sIdx === 0 || sIdx === leg1.path.length - 1
												? "text-foreground font-medium"
												: ""
										}
									>
										{locale === "en" ? stop.name.en : stop.name.bn}
									</span>
									{sIdx < leg1.path.length - 1 && (
										<ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
									)}
								</div>
							))}
						</div>

						{/* Available Buses for Leg 1 */}
						<div className="pl-1 pt-1.5 space-y-1.5">
							<span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest block">
								{t("availableBuses")}
							</span>
							{leg1Buses.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{leg1Buses.map((bus, i) => (
										<BusOperatorItem key={`${bus.title.en}-${bus.routes?.en?.[0]?.name || ""}-${bus.routes?.en?.[bus.routes.en.length - 1]?.name || ""}-${i}`} bus={bus} locale={locale} />
									))}
								</div>
							) : (
								<p className="text-[11px] text-muted-foreground/60 italic">
									{t("noBusesFound")}
								</p>
							)}
						</div>
					</div>

					{/* Transfer Info */}
					<div className="relative py-2 flex items-center justify-center">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-dashed border-border" />
						</div>
						<div className="relative z-10 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center gap-1.5 shadow-sm">
							<RefreshCw className="h-3.5 w-3.5 animate-spin-slow text-primary" />
							<span>
								{locale === "en"
									? `Transfer at ${getStopName(transferStop)}`
									: `${getStopName(transferStop)}-এ পরিবর্তন`}
							</span>
						</div>
					</div>

					{/* Leg 2 */}
					<div className="space-y-3">
						<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/20 pb-1.5">
							<div className="flex items-center gap-2">
								<Badge
									variant="secondary"
									className="text-[10px] font-bold tracking-widest text-primary uppercase"
								>
									{locale === "en" ? "Leg 2" : "২য় বাস"}
								</Badge>
								<span className="text-sm font-bold text-foreground">
									{getRouteCode(leg2.route)} — {getRouteName(leg2.route)}
								</span>
							</div>
							<span className="text-xs font-semibold text-muted-foreground">
								৳{formatNumber(leg2.fare, locale)} • {formatNumber(leg2.distance, locale)} km
							</span>
						</div>

						{/* Stop sequence */}
						<div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground pl-1">
							{leg2.path.map((stop, sIdx) => (
								<div key={stop.name.en} className="flex items-center gap-2">
									<span
										className={
											sIdx === 0 || sIdx === leg2.path.length - 1
												? "text-foreground font-medium"
												: ""
										}
									>
										{locale === "en" ? stop.name.en : stop.name.bn}
									</span>
									{sIdx < leg2.path.length - 1 && (
										<ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
									)}
								</div>
							))}
						</div>

						{/* Available Buses for Leg 2 */}
						<div className="pl-1 pt-1.5 space-y-1.5">
							<span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest block">
								{t("availableBuses")}
							</span>
							{leg2Buses.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{leg2Buses.map((bus, i) => (
										<BusOperatorItem key={`${bus.title.en}-${bus.routes?.en?.[0]?.name || ""}-${bus.routes?.en?.[bus.routes.en.length - 1]?.name || ""}-${i}`} bus={bus} locale={locale} />
									))}
								</div>
							) : (
								<p className="text-[11px] text-muted-foreground/60 italic">
									{t("noBusesFound")}
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

function BusOperatorItem({ bus, locale }: { bus: BusOperator; locale: string }) {
	const [hasError, setHasError] = useState(!bus.image);

	return (
		<div className="flex items-center gap-2.5 p-1.5 rounded-lg border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
			<div className="relative w-11 h-7 shrink-0 rounded-md overflow-hidden bg-muted border border-border/40 flex items-center justify-center">
				{hasError ? (
					<Bus className="h-4 w-4 text-muted-foreground/30" />
				) : (
					<Image
						src={bus.image!}
						alt={locale === "en" ? bus.title.en : bus.title.bn}
						fill
						className="object-cover object-center"
						onError={() => setHasError(true)}
						sizes="(max-width: 768px) 44px, 44px"
					/>
				)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="font-bold text-[11px] text-foreground truncate leading-snug">
					{locale === "en" ? bus.title.en : bus.title.bn}
				</div>
				<div className="flex items-center gap-1.5 mt-0.5">
					<Badge variant="outline" className="text-[7px] py-0 px-1 font-semibold border-transparent bg-primary/5 text-primary shrink-0">
						{bus.service_type || (locale === "en" ? "Standard" : "সাধারণ")}
					</Badge>
					<span className="text-[8px] text-muted-foreground flex items-center gap-0.5 truncate">
						<Clock className="h-2 w-2 shrink-0 text-muted-foreground/75" />
						{formatTime(bus.time.start, locale)} - {formatTime(bus.time.close, locale)}
					</span>
				</div>
			</div>
		</div>
	);
}
