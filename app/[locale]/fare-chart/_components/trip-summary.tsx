"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Route } from "@/types";
import { formatNumber, cn } from "@/lib/utils";
import { useFareSettings } from "@/hooks/use-fare-settings";

interface SelectedRange {
  start: number;
  end: number;
}

interface TripSummaryProps {
  selectedRoute: Route;
  selectedRange: SelectedRange;
  summaryRef: React.RefObject<HTMLDivElement | null>;
}

export function TripSummary({
  selectedRoute,
  selectedRange,
  summaryRef,
}: TripSummaryProps) {
  const t = useTranslations("Chart");
  const locale = useLocale();
  const { calcFare } = useFareSettings();

  const startStop = selectedRoute.stops[selectedRange.start];
  const endStop = selectedRoute.stops[selectedRange.end];
  const distance = Math.abs(endStop.distance - startStop.distance);
  const fare = calcFare(distance);
  const stopCount = selectedRange.end - selectedRange.start + 1;
  const slicedStops = selectedRoute.stops.slice(
    selectedRange.start,
    selectedRange.end + 1,
  );

  return (
    <div
      ref={summaryRef}
      className="p-4 sm:p-6 rounded-2xl bg-muted/20 border border-border/50 shadow-inner mt-4 mx-2 sm:mx-0"
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header row: label + distance/fare badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-[10px] sm:text-xs font-extrabold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            {t("tripSummary")}
          </h3>
          <div className="flex items-center gap-2">
            <div className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
              {formatNumber(distance, locale)} {t("km")}
            </div>
            <div className="text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 bg-primary text-primary-foreground rounded-full shadow-sm ring-2 ring-primary/20">
              ৳{formatNumber(fare, locale)}
            </div>
          </div>
        </div>

        {/* Stop path */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-y-6 sm:gap-y-8",
            "bg-background/50 p-3 sm:p-6 rounded-xl border border-border/40 justify-center sm:justify-start",
          )}
        >
          {slicedStops.map((stop, i, arr) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col gap-1 items-center text-center px-2 sm:px-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-primary">
                  {i + 1}
                </div>
                <span className="text-[9px] sm:text-[11px] font-bold text-foreground max-w-[60px] sm:max-w-[80px] leading-tight line-clamp-2">
                  {locale === "en" ? stop.name.en : stop.name.bn}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex items-center">
                  <ArrowRight className="h-3 w-3 sm:h-5 sm:w-5 text-primary/30 mx-0.5 sm:mx-1 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stop count footer */}
        <div className="flex justify-center sm:justify-end">
          <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded">
            {stopCount} {t("stops")}
          </span>
        </div>
      </div>
    </div>
  );
}
