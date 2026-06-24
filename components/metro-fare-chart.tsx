"use client";

import { useMemo } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getMetroStations, getMetroLine } from "@/lib/metroData";
import { formatNumber } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { TrainFront } from "lucide-react";

export default function MetroFareChart() {
	const t = useTranslations("Metro");
	const locale = useLocale();
	const stations = getMetroStations();
	const line = getMetroLine();

	const fareMatrix = useMemo(() => {
		return stations.map((_, fromIdx) =>
			stations.map((_, toIdx) => {
				const stationsTraveled = Math.abs(toIdx - fromIdx);
				if (stationsTraveled === 0) return 0;
				for (const slab of line.fareSlabs) {
					if (stationsTraveled >= slab.minStations && stationsTraveled <= slab.maxStations) {
						return slab.fare;
					}
				}
				return line.fareSlabs[line.fareSlabs.length - 1].fare;
			})
		);
	}, [stations, line.fareSlabs]);

	const getFareColor = (fare: number) => {
		if (fare === 0) return "bg-muted/30 text-muted-foreground/50";
		if (fare <= 20) return "bg-primary/5 text-primary font-semibold";
		if (fare <= 30) return "bg-primary/10 text-primary font-semibold";
		if (fare <= 40) return "bg-primary/15 text-primary font-bold";
		if (fare <= 60) return "bg-primary/20 text-primary font-extrabold";
		if (fare <= 80) return "bg-primary/25 text-primary font-black";
		return "bg-primary/30 text-primary font-black";
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base flex items-center gap-2">
					<TrainFront className="h-4 w-4 text-primary" />
					{t("fareChart")}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<table className="min-w-full text-[9px] sm:text-[10px]">
						<thead>
							<tr>
								<th className="sticky left-0 z-10 bg-background p-1.5 text-left font-bold text-muted-foreground border-b border-r border-border min-w-[80px]">
									{t("from")} ↓ / {t("to")} →
								</th>
								{stations.map((s) => (
									<th
										key={s.id}
										className="p-1 text-center font-bold text-muted-foreground border-b border-border min-w-[40px] whitespace-nowrap"
									>
										<span className="[writing-mode:vertical-lr] rotate-180 inline-block">
											{locale === "en" ? s.name.en : s.name.bn}
										</span>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{stations.map((fromStation, fromIdx) => (
								<tr key={fromStation.id} className="hover:bg-muted/20 transition-colors">
									<td className="sticky left-0 z-10 bg-background p-1.5 font-bold text-foreground border-r border-border whitespace-nowrap">
										{locale === "en" ? fromStation.name.en : fromStation.name.bn}
									</td>
									{fareMatrix[fromIdx].map((fare, toIdx) => (
										<td
											key={toIdx}
											className={`p-1 text-center border-border text-[8px] sm:text-[9px] ${getFareColor(fare)}`}
										>
											{fare === 0 ? "—" : `৳${formatNumber(fare, locale)}`}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Fare Slab Legend */}
				<div className="p-3 border-t border-border">
					<div className="flex flex-wrap items-center gap-2 text-[9px]">
						{line.fareSlabs.map((slab) => (
							<span
								key={slab.fare}
								className={`px-2 py-0.5 rounded-full ${getFareColor(slab.fare)}`}
							>
								{slab.minStations}-{slab.maxStations} stations: ৳{formatNumber(slab.fare, locale)}
							</span>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
