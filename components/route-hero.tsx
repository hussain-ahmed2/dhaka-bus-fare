import { Link } from "@/i18n/routing";
import { ChevronLeft, MapPin, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Route } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/utils";
import SaveRouteButton from "./save-route-button";

interface RouteHeroProps {
  route: Route;
  slug: string;
}

export default function RouteHero({ route, slug }: RouteHeroProps) {
  const t = useTranslations("Route");
  const locale = useLocale();

  const totalDistance = route.stops.at(-1)?.distance ?? 0;
  const startStop =
    locale === "en"
      ? (route.stops.at(0)?.name.en ?? "")
      : (route.stops.at(0)?.name.bn ?? "");
  const endStop =
    locale === "en"
      ? (route.stops.at(-1)?.name.en ?? "")
      : (route.stops.at(-1)?.name.bn ?? "");

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/60 text-primary-foreground">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-10 space-y-5">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 -ml-1"
          >
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back")}
            </Link>
          </Button>

          <SaveRouteButton routeId={slug} routeType="bus" />
        </div>

        {/* Code + name */}
        <div className="space-y-2">
          <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/30 text-xs font-bold tracking-wider">
            {locale === "en" ? route.code.en : route.code.bn}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight max-w-xl">
            {locale === "en" ? route.name.en : route.name.bn}
          </h1>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
          <span className="flex items-center gap-1.5">
            <RouteIcon className="h-3.5 w-3.5" />
            <strong className="text-primary-foreground">
              {formatNumber(route.stops.length, locale)}
            </strong>{" "}
            {t("stops")}
          </span>
          <span className="text-primary-foreground/40">·</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <strong className="text-primary-foreground">
              {formatNumber(totalDistance, locale)} {t("km")}
            </strong>
          </span>
          <span className="text-primary-foreground/40">·</span>
          <span>
            {startStop} → {endStop}
          </span>
        </div>
      </div>
    </div>
  );
}
