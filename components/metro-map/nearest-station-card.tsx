"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/utils";
import type { MetroStation } from "@/types";

interface NearestStationCardProps {
	nearest: {
		station: MetroStation;
		distance: number;
		walkingMinutes: number;
	};
}

export function NearestStationCard({ nearest }: NearestStationCardProps) {
	const t = useTranslations("Metro");
	const locale = useLocale();

	return (
		<div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:w-[350px] z-[1000] pointer-events-none">
			<div className="pointer-events-auto bg-background/90 backdrop-blur-xl rounded-xl border border-border shadow-lg p-3">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
							{t("nearestStation")}
						</p>
						<p className="text-sm font-bold">
							{locale === "en" ? nearest.station.name.en : nearest.station.name.bn}
						</p>
						<p className="text-xs text-muted-foreground">
							{t("walkingTime", { time: formatNumber(nearest.walkingMinutes, locale) })} ·{" "}
							{nearest.distance.toFixed(1)} {t("km")}
						</p>
					</div>
					<div className="text-right">
						<p className="text-lg font-black text-primary">{nearest.distance.toFixed(1)}</p>
						<p className="text-[10px] text-muted-foreground font-semibold">{t("km")}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
