"use client";

import { useMemo, useState } from "react";
import { Ticket, ArrowUpDown } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { getAllRoutes, routeToSlug } from "@/lib/busData";
import { Link } from "@/i18n/routing";

const routes = getAllRoutes();

const allUniqueStops = Array.from(
  new Set(routes.flatMap((r) => r.stops.map((s) => s.name.en))),
).sort();

const stopTranslations: Record<string, string> = {};
routes.forEach((r) => {
  r.stops.forEach((s) => {
    stopTranslations[s.name.en] = s.name.bn;
  });
});

export default function HeroCalculatorCard() {
  const [selectedSlug, setSelectedSlug] = useState("all");
  const [fromStop, setFromStop] = useState<string | null>(null);
  const [toStop, setToStop] = useState<string | null>(null);
  const t = useTranslations("Calculator");
  const locale = useLocale();

  const availableStops = useMemo(() => {
    if (selectedSlug === "all") return allUniqueStops;
    const r = routes.find((rt) => routeToSlug(rt) === selectedSlug);
    return r ? r.stops.map((s) => s.name.en) : allUniqueStops;
  }, [selectedSlug]);

  const swapStops = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  const params = new URLSearchParams();
  params.set("route", selectedSlug);
  if (fromStop) params.set("from", fromStop);
  if (toStop) params.set("to", toStop);
  const calcHref = `/fare-calculator?${params.toString()}`;

  const canCalculate = fromStop && toStop && fromStop !== toStop;

  return (
    <Card className="backdrop-blur-sm bg-card/95">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          {t("journeyDetails")}
        </CardTitle>
        <CardDescription>{t("journeySelect")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {t("routeOp")}
          </label>
          <Select
            value={selectedSlug}
            onValueChange={(v) => {
              setSelectedSlug(v);
              setFromStop(null);
              setToStop(null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("allRoutes")} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">
                <span className="font-semibold text-primary">
                  {t("allRoutes")}
                </span>
              </SelectItem>
              {routes.map((r) => (
                <SelectItem key={r.code.en} value={routeToSlug(r)}>
                  <span className="font-semibold">
                    {locale === "en" ? r.code.en : r.code.bn}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 border border-border p-3 rounded-xl bg-muted/20">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              {t("selectFrom")}
            </label>
            <Select
              value={fromStop || ""}
              onValueChange={(v) => setFromStop(v)}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder={t("boardingStop")} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {availableStops.map((stop) => (
                  <SelectItem key={stop} value={stop}>
                    {locale === "en"
                      ? stop
                      : stopTranslations[stop] || stop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={swapStops}
              className="h-8 w-8 rounded-full shadow-sm bg-background border-border"
            >
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="space-y-1.5 border border-border p-3 rounded-xl bg-muted/20">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              {t("selectTo")}
            </label>
            <Select
              value={toStop || ""}
              onValueChange={(v) => setToStop(v)}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder={t("destinationStop")} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {availableStops.map((stop) => (
                  <SelectItem key={stop} value={stop}>
                    {locale === "en"
                      ? stop
                      : stopTranslations[stop] || stop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2">
          {canCalculate ? (
            <Button className="w-full h-11 text-base shadow-sm" asChild>
              <Link href={calcHref}>{t("calcButton")}</Link>
            </Button>
          ) : (
            <Button className="w-full h-11 text-base shadow-sm" disabled>
              {t("calcButton")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
