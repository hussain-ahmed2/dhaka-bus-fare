"use client";

import { ArrowDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Route } from "@/types";
import { formatNumber, cn } from "@/lib/utils";
import { useFareSettings } from "@/hooks/use-fare-settings";

interface HoveredCell {
  row: number;
  col: number;
}

interface SelectedRange {
  start: number;
  end: number;
}

interface FareChartTableProps {
  selectedRoute: Route;
  hoveredCell: HoveredCell | null;
  selectedRange: SelectedRange | null;
  onCellHover: (row: number, col: number) => void;
  onMouseLeave: () => void;
  onCellClick: (row: number, col: number) => void;
}

export function FareChartTable({
  selectedRoute,
  hoveredCell,
  selectedRange,
  onCellHover,
  onMouseLeave,
  onCellClick,
}: FareChartTableProps) {
  const t = useTranslations("Chart");
  const locale = useLocale();
  const { calcFare } = useFareSettings();

  return (
    <div className="w-full overflow-x-auto border rounded-xl bg-card text-card-foreground shadow-sm">
      <table
        className="w-full text-[10px] sm:text-sm text-center border-collapse min-w-max select-none"
        onMouseLeave={onMouseLeave}
      >
        <thead>
          <tr className="sticky top-0 z-20">
            <th className="p-1.5 sm:p-2.5 border-b border-r bg-muted sticky left-0 top-0 z-50 shadow-[1px_0_0_0_var(--border)] w-[80px] sm:w-auto">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] sm:text-[10px] font-bold text-primary uppercase">
                  {t("stops")}
                </span>
                <span className="text-[7px] sm:text-[8px] text-muted-foreground uppercase leading-none">
                  {t("km")}
                </span>
              </div>
            </th>

            {selectedRoute.stops.map((colStop, colIdx) => {
              const isHovered = hoveredCell?.col === colIdx;
              const isSelected =
                selectedRange &&
                colIdx >= selectedRange.start &&
                colIdx <= selectedRange.end;

              return (
                <th
                  key={colIdx}
                  className={cn(
                    "p-2 sm:p-3 border-b border-r font-medium transition-colors duration-200 bg-muted/50",
                    isHovered ? "bg-primary/10" : "bg-muted/30",
                    isSelected && "bg-primary/20 text-primary",
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-muted-foreground text-[8px] sm:text-[10px] uppercase">
                      {formatNumber(colStop.distance, locale)} KM
                    </span>
                    <span className="text-[9px] sm:text-[11px] leading-tight">
                      {locale === "en" ? colStop.name.en : colStop.name.bn}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {selectedRoute.stops.map((rowStop, rowIdx) => (
            <tr key={rowIdx} className="group">
              {/* Row header (sticky left) */}
              <td
                className={cn(
                  "p-1 sm:p-1.5 border-b border-r font-semibold sticky left-0 z-30 shadow-[1px_0_0_0_var(--border)] whitespace-nowrap text-left transition-colors duration-200 w-[80px] sm:w-auto",
                  hoveredCell?.row === rowIdx ? "bg-muted" : "bg-card",
                  selectedRange &&
                    rowIdx >= selectedRange.start &&
                    rowIdx <= selectedRange.end &&
                    "bg-accent text-primary",
                )}
              >
                <div className="flex flex-col gap-0.5 px-0.5 overflow-hidden">
                  <span className="text-[8px] sm:text-[11px] truncate max-w-full">
                    {locale === "en" ? rowStop.name.en : rowStop.name.bn}
                  </span>
                  <span className="text-muted-foreground/50 text-[6px] sm:text-[8px] font-mono leading-none">
                    {formatNumber(rowStop.distance, locale)} {t("km")}
                  </span>
                </div>
              </td>

              {/* Data cells */}
              {selectedRoute.stops.map((colStop, colIdx) => {
                const isDiagonal = rowIdx === colIdx;
                const isAboveDiagonal = colIdx > rowIdx;
                const isHovered =
                  hoveredCell?.row === rowIdx || hoveredCell?.col === colIdx;
                const isCellHovered =
                  hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;
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
                        "p-1.5 sm:p-3 border-b border-r transition-all duration-300 relative",
                        isPartOfRoute ? "bg-primary/20" : "bg-muted/20",
                        isCellHovered && "bg-primary/30",
                      )}
                      onMouseEnter={() => onCellHover(rowIdx, colIdx)}
                    >
                      <div className="flex flex-col items-center gap-0.5 relative z-0">
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-wide text-muted-foreground font-medium">
                          {formatNumber(rowStop.distance, locale)} KM
                        </span>
                        <span className="text-[8px] sm:text-[10px] uppercase tracking-tighter text-foreground font-semibold leading-tight">
                          {locale === "en" ? rowStop.name.en : rowStop.name.bn}
                        </span>
                      </div>
                      {isPartOfRoute && (
                        <div className="absolute inset-x-0 bottom-0.5 sm:bottom-1 flex justify-center">
                          <ArrowDown className="h-2 w-2 sm:h-3 sm:w-3 text-primary animate-bounce" />
                        </div>
                      )}
                    </td>
                  );
                }

                const distance = Math.abs(rowStop.distance - colStop.distance);
                const fare = calcFare(distance);
                const isIntersection =
                  selectedRange?.end === rowIdx &&
                  selectedRange?.start === colIdx;

                return (
                  <td
                    key={colIdx}
                    onMouseEnter={() => onCellHover(rowIdx, colIdx)}
                    onClick={() => onCellClick(rowIdx, colIdx)}
                    className={cn(
                      "p-2 sm:p-3 border-b border-r text-foreground cursor-pointer transition-all duration-200 relative",
                      isHovered ? "bg-primary/5" : "bg-card",
                      isCellHovered && "bg-primary/10 scale-[1.02] z-10 shadow-sm",
                      isInRange && "bg-primary/5",
                      isIntersection && "bg-primary/20 ring-2 ring-primary/40 z-20 font-bold",
                    )}
                  >
                    <span
                      className={cn(
                        "transition-transform text-[10px] sm:text-sm",
                        isCellHovered && "scale-110 inline-block font-bold text-primary",
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
  );
}
