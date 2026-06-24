"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	getMetroLine,
	getMetroSchedule,
	isMetroOperating,
	isPeakHour,
	getCurrentFrequency,
	getNextTrainMinutes,
} from "@/lib/metroData";
import { formatNumber } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import {
	Clock,
	TrainFront,
	CircleDot,
	Timer,
	Ticket,
	CreditCard,
	Baby,
	Percent,
	Luggage,
} from "lucide-react";

export default function MetroSchedule() {
	const t = useTranslations("Metro");
	const locale = useLocale();
	const line = getMetroLine();

	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 30000); // Update every 30s
		return () => clearInterval(interval);
	}, []);

	const operating = isMetroOperating(now);
	const peak = isPeakHour(now);
	const frequency = getCurrentFrequency(now);
	const nextTrain = getNextTrainMinutes(now);

	const scheduleRows = [
		{ label: t("weekday"), schedule: line.schedule.weekday },
		{ label: t("friday"), schedule: line.schedule.friday },
		{ label: t("saturday"), schedule: line.schedule.saturday },
	];

	return (
		<div className="space-y-4">
			{/* Live Status Card */}
			<Card className="border-2 border-primary/20">
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div
								className={`w-3 h-3 rounded-full ${operating ? "bg-primary animate-pulse" : "bg-red-400"}`}
							/>
							<div>
								<p className="text-sm font-bold">
									{operating ? t("metroOperating") : t("metroClosed")}
								</p>
								{operating && (
									<p className="text-xs text-muted-foreground">
										{peak ? t("peakHours") : t("offPeakHours")} ·{" "}
										{t("frequency", { minutes: formatNumber(frequency, locale) })}
									</p>
								)}
								{!operating && nextTrain > 0 && (
									<p className="text-xs text-muted-foreground">
										{t("nextOpening", {
											time: getMetroSchedule(now)?.start ?? "",
										})}
									</p>
								)}
								{!operating && nextTrain === -1 && (
									<p className="text-xs text-muted-foreground">
										{t("serviceEnded")}
									</p>
								)}
							</div>
						</div>
						{operating && nextTrain > 0 && (
							<Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">
								<Timer className="h-3 w-3 mr-1" />
								{t("nextTrain", { minutes: formatNumber(nextTrain, locale) })}
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Operating Hours */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Clock className="h-4 w-4 text-primary" />
						{t("operatingHours")}
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y divide-border">
						{scheduleRows.map((row) => (
							<div
								key={row.label}
								className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
							>
								<span className="text-sm font-medium">{row.label}</span>
								<span className="text-sm font-bold text-primary">
									{row.schedule.start} — {row.schedule.end}
								</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Frequency Info */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<TrainFront className="h-4 w-4 text-primary" />
						{t("frequency", { minutes: "" }).replace("~", "").trim()}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-center">
							<CircleDot className="h-4 w-4 mx-auto mb-1 text-orange-600" />
							<p className="text-lg font-black text-orange-700">
								{formatNumber(line.frequency.peak, locale)} {t("min")}
							</p>
							<p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wider">
								{t("peakHours")}
							</p>
							<p className="text-[9px] text-orange-500 mt-0.5">
								7:00-11:00, 16:00-20:00
							</p>
						</div>
						<div className="rounded-xl bg-sky-50 border border-sky-200 p-3 text-center">
							<CircleDot className="h-4 w-4 mx-auto mb-1 text-sky-600" />
							<p className="text-lg font-black text-sky-700">
								{formatNumber(line.frequency.offPeak, locale)} {t("min")}
							</p>
							<p className="text-[10px] text-sky-600 font-semibold uppercase tracking-wider">
								{t("offPeakHours")}
							</p>
							<p className="text-[9px] text-sky-500 mt-0.5">Other hours</p>
						</div>
					</div>
					<p className="text-[10px] text-muted-foreground text-center">
						{t("travelTime")}: {formatNumber(line.totalTravelTime, locale)} {t("min")} ({t("subtitle")})
					</p>
				</CardContent>
			</Card>

			{/* Ticket & Guideline Info */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Ticket className="h-4 w-4 text-primary" />
						{t("rulesAndDiscounts")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-start gap-3 text-sm">
						<Ticket className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
						<div>
							<p className="font-semibold text-foreground">{t("ticketInfo")}</p>
							<p className="text-muted-foreground text-xs mt-0.5">{t("ticketInfoDesc")}</p>
						</div>
					</div>
					<div className="flex items-start gap-3 text-sm">
						<CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
						<div>
							<p className="font-semibold text-foreground">{t("mrtPass")}</p>
							<p className="text-muted-foreground text-xs mt-0.5">{t("mrtPassInfo")}</p>
						</div>
					</div>
					<div className="flex items-start gap-3 text-sm">
						<Percent className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
						<div>
							<p className="font-semibold text-foreground">{t("guidelines")}</p>
							<ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1 mt-1">
								<li>{t("seniorDiscount")}</li>
								<li>{t("disabledDiscount")}</li>
								<li>{t("studentDiscount")}</li>
								<li>{t("freedomFighterDiscount")}</li>
								<li>{t("childrenFreeUnderHeight")}</li>
							</ul>
						</div>
					</div>
					<div className="flex items-start gap-3 text-sm border-t border-border pt-3">
						<Luggage className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
						<div>
							<p className="font-semibold text-foreground">Luggage Rules</p>
							<p className="text-muted-foreground text-xs mt-0.5">{t("luggageRules")}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
