"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/utils";

interface StatusBarProps {
	operating: boolean;
	frequency: number;
	nextTrain: number;
	trainsCount: number;
}

export function StatusBar({ operating, frequency, nextTrain, trainsCount }: StatusBarProps) {
	const t = useTranslations("Metro");
	const locale = useLocale();

	return (
		<div className="absolute top-3 left-3 right-3 sm:right-auto z-1000 pointer-events-none">
			<div className="pointer-events-auto bg-background/90 backdrop-blur-xl rounded-xl border border-border shadow-lg p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
				<div className="flex items-center gap-2 shrink-0">
					<div
						className={`w-2.5 h-2.5 rounded-full ${operating ? "bg-primary animate-pulse" : "bg-red-400"} shrink-0`}
					/>
					<span className="text-xs font-bold whitespace-nowrap">
						{operating ? t("metroOperating") : t("metroClosed")}
					</span>
				</div>
				<div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0 flex-wrap sm:flex-nowrap">
					{operating && (
						<>
							<span className="font-semibold whitespace-nowrap">
								{t("frequency", { minutes: formatNumber(frequency, locale) })}
							</span>
							{nextTrain > 0 && (
								<>
									<span className="text-border">·</span>
									<span className="font-semibold text-primary whitespace-nowrap">
										{t("nextTrain", { minutes: formatNumber(nextTrain, locale) })}
									</span>
								</>
							)}
						</>
					)}
					<span className="text-border">·</span>
					<span className="font-bold whitespace-nowrap">{trainsCount} 🚇</span>
				</div>
			</div>
		</div>
	);
}
