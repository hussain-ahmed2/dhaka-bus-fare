"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Route } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { Map, ArrowDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useFareSettings } from "@/hooks/use-fare-settings";

interface StopTimelineProps {
  route: Route;
  onSelectRange?: (start: number, end: number) => void;
  selectedRange?: { start: number; end: number } | null;
}

export default function StopTimeline({
  route,
  onSelectRange,
  selectedRange,
}: StopTimelineProps) {
  const stops = route.stops;
  const tRoute = useTranslations("Route");
  const tChart = useTranslations("Chart");
  const locale = useLocale();
  const { calcFare, loaded } = useFareSettings();
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" /> {tRoute("routeDetails")}
            <span className="text-xs font-normal text-muted-foreground">
              ({formatNumber(stops.length, locale)} {tRoute("stops")})
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-6">
        <Tabs defaultValue="timeline" className="w-full">
          <div className="px-4 pb-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="timeline">
                {tRoute("timelineTab", { defaultValue: "Timeline" })}
              </TabsTrigger>
              <TabsTrigger value="chart">
                {tRoute("chartTab", { defaultValue: "Fare Chart" })}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timeline" className="px-4 mt-0">
            <div className="relative ml-3">
              {stops.map((stop, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === stops.length - 1;
                const segDist =
                  idx > 0
                    ? (stop.distance - stops[idx - 1].distance).toFixed(1)
                    : null;

                return (
                  <div key={idx} className="relative flex gap-4">
                    {/* Timeline track */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "rounded-full border-2 border-background z-10 shrink-0",
                          isFirst
                            ? "h-3.5 w-3.5 bg-green-500"
                            : isLast
                              ? "h-3.5 w-3.5 bg-red-500"
                              : "h-2.5 w-2.5 bg-primary mt-[3px]",
                        )}
                      />
                      {!isLast && (
                        <div className="w-px flex-1 bg-border min-h-[36px]" />
                      )}
                    </div>

                    {/* Stop content */}
                    <div className="pb-5 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={cn(
                              "text-sm font-medium leading-snug",
                              (isFirst || isLast) && "font-semibold",
                            )}
                          >
                            {locale === "en" ? stop.name.en : stop.name.bn}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {locale === "en" ? stop.name.bn : stop.name.en}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold text-foreground">
                            {formatNumber(stop.distance, locale)} {tRoute("km")}
                          </span>
                          {segDist && (
                            <p className="text-[10px] text-muted-foreground">
                              +{formatNumber(segDist, locale)} {tRoute("km")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="chart" className="mt-0">
            {loaded ? (
              <div
                className="w-full overflow-x-auto border-t border-b bg-card text-card-foreground select-none"
                onMouseLeave={() => setHoveredCell(null)}
              >
                <table className="w-full text-xs text-center border-collapse min-w-max" aria-label={tRoute("routeDetails")}>
                  <thead>
                    <tr className="sticky top-0 z-20">
                      <th className="p-1.5 sm:p-2.5 border-b border-r bg-muted sticky left-0 top-0 z-50 shadow-[1px_0_0_0_var(--border)] w-[80px] sm:w-auto">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] sm:text-[10px] font-bold text-primary uppercase">
                            {tChart("stops")}
                          </span>
                          <span className="text-[7px] sm:text-[8px] text-muted-foreground uppercase leading-none">
                            {tChart("km")}
                          </span>
                        </div>
                      </th>
                      {stops.map((colStop, colIdx) => {
                        const isHovered = hoveredCell?.col === colIdx;
                        const isSelected =
                          selectedRange &&
                          colIdx >= selectedRange.start &&
                          colIdx <= selectedRange.end;

                        return (
                          <th
                            key={colIdx}
                            className={cn(
                              "px-2 py-1.5 border-b border-r font-medium whitespace-nowrap bg-muted transition-colors",
                              isHovered ? "bg-primary/10" : "bg-muted",
                              isSelected && "bg-primary/20 text-primary",
                            )}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-muted-foreground text-[8px] sm:text-[10px] uppercase font-bold tracking-widest">
                                {formatNumber(colStop.distance, locale)}
                              </span>
                              <span className="text-[9px] sm:text-[11px] leading-tight max-w-[60px] truncate block">
                                {locale === "en"
                                  ? colStop.name.en
                                  : colStop.name.bn}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {stops.map((rowStop, rowIdx) => (
                      <tr key={rowIdx} className="group">
                        <td
                          className={cn(
                            "p-2 border-b border-r font-semibold sticky left-0 z-40 shadow-[1px_0_0_0_var(--border)] whitespace-nowrap text-left transition-colors duration-200 w-[80px] sm:w-auto",
                            hoveredCell?.row === rowIdx
                              ? "bg-muted"
                              : "bg-card",
                            selectedRange &&
                              rowIdx >= selectedRange.start &&
                              rowIdx <= selectedRange.end &&
                              "bg-accent text-primary",
                          )}
                        >
                          <div className="flex flex-col gap-0.5 px-0.5 overflow-hidden">
                            <span className="text-[8px] sm:text-[11px] truncate max-w-full">
                              {locale === "en"
                                ? rowStop.name.en
                                : rowStop.name.bn}
                            </span>
                            <span className="text-muted-foreground/50 text-[6px] sm:text-[8px] font-mono leading-none">
                              {formatNumber(rowStop.distance, locale)}{" "}
                              {tChart("km")}
                            </span>
                          </div>
                        </td>
                        {stops.map((colStop, colIdx) => {
                          const isDiagonal = rowIdx === colIdx;
                          const isAboveDiagonal = colIdx > rowIdx;
                          const isHovered =
                            hoveredCell?.row === rowIdx ||
                            hoveredCell?.col === colIdx;
                          const isCellHovered =
                            hoveredCell?.row === rowIdx &&
                            hoveredCell?.col === colIdx;

                          // Selection logic
                          const isInRange =
                            selectedRange &&
                            rowIdx >= selectedRange.start &&
                            rowIdx <= selectedRange.end &&
                            colIdx >= selectedRange.start &&
                            colIdx <= selectedRange.end;

                          if (isAboveDiagonal) {
                            return (
                              <td
                                key={colIdx}
                                className={cn(
                                  "p-3 border-b border-r transition-colors",
                                  isHovered ? "bg-muted/10" : "bg-muted/5",
                                )}
                              />
                            );
                          }

                          if (isDiagonal) {
                            const isPartOfRoute =
                              selectedRange &&
                              rowIdx >= selectedRange.start &&
                              rowIdx <= selectedRange.end;

                            return (
                              <td
                                key={colIdx}
                                className={cn(
                                  "p-2 border-b border-r transition-all duration-300 relative",
                                  isPartOfRoute
                                    ? "bg-primary/20"
                                    : "bg-muted/20",
                                  isCellHovered && "bg-primary/30",
                                )}
                                onMouseEnter={() =>
                                  setHoveredCell({ row: rowIdx, col: colIdx })
                                }
                              >
                                <div className="flex flex-col items-center gap-0.5 relative z-0">
                                  <span className="text-[7px] sm:text-[9px] uppercase tracking-wide text-muted-foreground font-medium">
                                    {formatNumber(rowStop.distance, locale)} KM
                                  </span>
                                  <span className="text-[8px] sm:text-[10px] uppercase tracking-tighter text-foreground font-semibold leading-tight">
                                    {locale === "en"
                                      ? rowStop.name.en
                                      : rowStop.name.bn}
                                  </span>
                                </div>
                                {isPartOfRoute && (
                                  <div className="absolute inset-x-0 bottom-0.5 sm:bottom-1 flex justify-center">
                                    <ArrowDown className="h-2 w-2 sm:h-3 sm:w-3 text-primary animate-bounce shrink-0" />
                                  </div>
                                )}
                              </td>
                            );
                          }

                          const distance = Math.abs(
                            rowStop.distance - colStop.distance,
                          );
                          const fare = calcFare(distance);
                          const isIntersection =
                            selectedRange?.end === rowIdx &&
                            selectedRange?.start === colIdx;

                          return (
                            <td
                              key={colIdx}
                              onMouseEnter={() =>
                                setHoveredCell({ row: rowIdx, col: colIdx })
                              }
                              onClick={() =>
                                onSelectRange && onSelectRange(colIdx, rowIdx)
                              }
                              className={cn(
                                "p-2 sm:p-3 border-b border-r text-foreground cursor-pointer transition-all duration-200 relative",
                                isHovered ? "bg-primary/5" : "bg-card",
                                isCellHovered &&
                                  "bg-primary/10 scale-[1.02] z-10 shadow-sm",
                                isInRange && "bg-primary/5",
                                isIntersection &&
                                  "bg-primary/20 ring-2 ring-primary/40 z-20 font-bold",
                              )}
                            >
                              <span
                                className={cn(
                                  "transition-transform text-[11px]",
                                  isCellHovered &&
                                    "scale-110 inline-block font-bold text-primary",
                                )}
                              >
                                ৳{formatNumber(fare, locale)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                Loading chart...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
