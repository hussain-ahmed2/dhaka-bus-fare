"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpDown, Ticket, ArrowRight, Calculator } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getFareBetweenStops, calculateFare, stopTranslations } from "@/lib/busData";
import { formatNumber } from "@/lib/utils";
import type { Route } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { useStore } from "@/hooks/store";
import { StopCombobox } from "@/components/stop-combobox";

interface FareCalculatorProps {
  route: Route;
  fromIdx?: number | null;
  toIdx?: number | null;
  onFromChange?: (idx: number | null) => void;
  onToChange?: (idx: number | null) => void;
}

export default function FareCalculator({
  route,
  fromIdx: externalFrom,
  toIdx: externalTo,
  onFromChange,
  onToChange,
}: FareCalculatorProps) {
  const t = useTranslations("RouteCalc");
  const locale = useLocale();
  const { settings } = useStore();

  const [internalFrom, setInternalFrom] = useState<number | null>(null);
  const [internalTo, setInternalTo] = useState<number | null>(null);

  const fromIdx = externalFrom !== undefined ? externalFrom : internalFrom;
  const toIdx = externalTo !== undefined ? externalTo : internalTo;

  const setFromIdx = (idx: number | null) => {
    if (onFromChange) onFromChange(idx);
    else setInternalFrom(idx);
  };

  const setToIdx = (idx: number | null) => {
    if (onToChange) onToChange(idx);
    else setInternalTo(idx);
  };

  const availableStops = useMemo(() => route.stops.map((s) => s.name.en), [route.stops]);

  const fromStop = fromIdx !== null && route.stops[fromIdx] ? route.stops[fromIdx].name.en : null;
  const toStop = toIdx !== null && route.stops[toIdx] ? route.stops[toIdx].name.en : null;

  const handleFromStopChange = (stopName: string | null) => {
    if (!stopName) {
      setFromIdx(null);
      return;
    }
    const idx = route.stops.findIndex((s) => s.name.en === stopName);
    setFromIdx(idx !== -1 ? idx : null);
  };

  const handleToStopChange = (stopName: string | null) => {
    if (!stopName) {
      setToIdx(null);
      return;
    }
    const idx = route.stops.findIndex((s) => s.name.en === stopName);
    setToIdx(idx !== -1 ? idx : null);
  };

  const canCalc = fromIdx !== null && toIdx !== null && fromIdx !== toIdx;
  const fare = canCalc ? getFareBetweenStops(route, fromIdx, toIdx) : null;
  const distance = canCalc
    ? Math.abs(
        route.stops[toIdx].distance - route.stops[fromIdx].distance,
      ).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      {/* Calculator Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("desc")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* From Stop */}
          <StopCombobox
            label={t("from")}
            value={fromStop}
            onValueChange={handleFromStopChange}
            placeholder={t("boardingStop")}
            availableStops={availableStops}
            stopTranslations={stopTranslations}
            locale={locale}
            noStopsText={t("noStopsFound") || "No stops found"}
          />

          {/* Swap icon */}
          <div className="flex justify-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* To Stop */}
          <StopCombobox
            label={t("to")}
            value={toStop}
            onValueChange={handleToStopChange}
            placeholder={t("alightingStop")}
            availableStops={availableStops}
            stopTranslations={stopTranslations}
            locale={locale}
            noStopsText={t("noStopsFound") || "No stops found"}
          />

          <Separator />

          {/* Result */}
          <AnimatePresence mode="wait">
            {fare !== null ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">
                    {t("estimatedFare")}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-black text-primary drop-shadow-sm">
                      ৳{formatNumber(fare, locale)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 font-bold"
                    >
                      {formatNumber(Number(distance), locale)} {t("km")}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1">
                    ৳{formatNumber(settings.farePerKm, locale)}/{t("km")} · min
                    ৳{formatNumber(settings.minFare, locale)}
                  </p>
                </div>

                {/* Visual Path Summary */}
                <div className="bg-muted/30 rounded-xl border border-border/50 p-3 sm:p-4 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                    <Ticket className="h-12 w-12 rotate-12" />
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                        {t("tripSummary")}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-primary">
                        {Math.abs(toIdx! - fromIdx!) + 1} {t("stops")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-6 justify-center sm:justify-start">
                      {(() => {
                        const start = Math.min(fromIdx!, toIdx!);
                        const end = Math.max(fromIdx!, toIdx!);
                        const stops = route.stops.slice(start, end + 1);
                        if (fromIdx! > toIdx!) stops.reverse();

                        return stops.map((stop, i, arr) => (
                          <div key={i} className="flex items-center">
                            <div className="flex flex-col gap-1 items-center text-center px-2 sm:px-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[8px] sm:text-[9px] font-black shadow-sm">
                                {i + 1}
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-bold text-foreground max-w-[60px] sm:max-w-[70px] leading-tight line-clamp-2">
                                {locale === "en" ? stop.name.en : stop.name.bn}
                              </span>
                            </div>
                            {i < arr.length - 1 && (
                              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/40 animate-pulse mx-0.5" />
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-dashed border-border p-6 text-center space-y-2 bg-muted/5 mt-4"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 opacity-50">
                  <Ticket className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("selectDifferent")}
                </p>
                <p className="text-[11px] text-muted-foreground/60 max-w-[200px] mx-auto">
                  Select your boarding and destination stops to see the fare and
                  trip sequence.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed pt-2">
            {t("ratesNote", {
              rate: formatNumber(settings.farePerKm, locale),
              minFare: formatNumber(settings.minFare, locale),
            })}
            <br />
            {t("actualNote")}
          </p>
        </CardContent>
      </Card>

      {/* Fare table card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t("fareFromFirst")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {route.stops.map((stop, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <span className="text-foreground font-medium truncate mr-2">
                  {locale === "en" ? stop.name.en : stop.name.bn}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(stop.distance, locale)} {t("km")}
                  </span>
                  {idx === 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      {t("start")}
                    </Badge>
                  ) : (
                    <Badge className="text-xs font-bold">
                      ৳{formatNumber(calculateFare(stop.distance), locale)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
