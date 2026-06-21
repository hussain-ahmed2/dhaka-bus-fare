"use client";

import { useState, useRef, useEffect, startTransition } from "react";
import { Table } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllRoutes, routeToSlug } from "@/lib/busData";
import { useFareSettings } from "@/hooks/use-fare-settings";
import type { Route } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { FareChartHero } from "./_components/fare-chart-hero";
import { FareChartTable } from "./_components/fare-chart-table";
import { TripSummary } from "./_components/trip-summary";

const routes = getAllRoutes();

export default function FareChartClient() {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);

  const { loaded } = useFareSettings();
  const t = useTranslations("Chart");
  const locale = useLocale();

  const selectedRoute: Route | null = selectedSlug
    ? (routes.find((r) => routeToSlug(r) === selectedSlug) ?? null)
    : null;

  // Pre-fill selection from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const route = params.get("route");
    startTransition(() => {
      if (route) {
        setSelectedSlug(route);
      } else if (routes[0]) {
        setSelectedSlug(routeToSlug(routes[0]));
      }
    });
  }, []);

  // Scroll to summary when range is selected
  useEffect(() => {
    if (selectedRange && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedRange]);

  const handleRouteSelect = (slug: string) => {
    setSelectedSlug(slug);
    setSelectedRange(null);
    const params = new URLSearchParams();
    params.set("route", slug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCellClick = (row: number, col: number) => {
    if (row === col) return;
    setSelectedRange({ start: col, end: row });
  };

  return (
    <main className="min-h-screen">
      <FareChartHero />

      <section className="mx-auto max-w-full px-4 sm:px-6 py-10">
        <Card className="container mx-auto border-transparent ring-0 shadow-none bg-transparent">
          <CardHeader className="px-0">
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5 text-primary" />
              {t("selectRoute")}
            </CardTitle>
            <CardDescription>{t("chooseRouteDesc")}</CardDescription>
          </CardHeader>

          <CardContent className="px-0 space-y-6">
            {/* Route selector */}
            <div className="max-w-md">
              <Select
                value={selectedSlug ?? undefined}
                onValueChange={handleRouteSelect}
              >
                <SelectTrigger id="route-select-chart" className="w-full">
                  <SelectValue placeholder={t("selectRoute")} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {routes.map((r) => (
                    <SelectItem key={r.code.en} value={routeToSlug(r)}>
                      <span className="font-semibold mr-2">
                        {locale === "en" ? r.code.en : r.code.bn}
                      </span>
                      <span className="text-muted-foreground text-xs truncate">
                        {locale === "en" ? r.name.en : r.name.bn}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fare matrix table */}
            {selectedRoute && loaded && (
              <FareChartTable
                selectedRoute={selectedRoute}
                hoveredCell={hoveredCell}
                selectedRange={selectedRange}
                onCellHover={(row, col) => setHoveredCell({ row, col })}
                onMouseLeave={() => setHoveredCell(null)}
                onCellClick={handleCellClick}
              />
            )}

            {/* Trip summary card */}
            {selectedRange && selectedRoute && (
              <TripSummary
                selectedRoute={selectedRoute}
                selectedRange={selectedRange}
                summaryRef={summaryRef}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
