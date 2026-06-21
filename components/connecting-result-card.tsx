"use client";

import { motion } from "motion/react";
import { ChevronRight, ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConnectingRoute } from "@/lib/connectingRoutes";
import type { Route } from "@/types";
import { formatNumber } from "@/lib/utils";

interface ConnectingResultCardProps {
	connectingRoute: ConnectingRoute;
	locale: string;
	index: number;
	stopTranslations: Record<string, string>;
}

export function ConnectingResultCard({ connectingRoute, locale, index, stopTranslations }: ConnectingResultCardProps) {
	const { leg1, leg2, transferStop, totalFare, totalDistance } = connectingRoute;

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
				<CardContent className="p-4 sm:p-5 space-y-4 bg-background">
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
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
