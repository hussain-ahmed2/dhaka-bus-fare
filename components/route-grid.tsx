"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RouteCard from "@/components/route-card";
import SearchBar from "@/components/search-bar";
import { searchRoutes, searchBuses, getPopularRoutes } from "@/lib/busData";
import type { Route, BusOperator } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import Image from "next/image";

interface RouteGridProps {
  initialRoutes: Route[];
  isHomePage?: boolean;
}

export default function RouteGrid({ initialRoutes, isHomePage = false }: RouteGridProps) {
  const [query, setQuery] = useState("");
  const t = useTranslations("Home");
  const locale = useLocale();

  const handleSearch = useCallback((q: string) => setQuery(q), []);

  const popularRoutes = useMemo(() => getPopularRoutes(), []);

  const filteredRoutes = useMemo(() => {
    if (query.trim()) {
      return searchRoutes(query);
    }
    return isHomePage ? popularRoutes : initialRoutes;
  }, [query, isHomePage, popularRoutes, initialRoutes]);

  const filteredBuses = useMemo(() => {
    return query.trim() ? searchBuses(query) : [];
  }, [query]);

  const totalMatches = filteredRoutes.length + filteredBuses.length;

  return (
    <div className="space-y-8">
      {/* Search — hidden on homepage, shown on /routes directory */}
      {!isHomePage && <SearchBar onSearch={handleSearch} placeholder={t("searchPlaceholder")} />}

      {/* Results label */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground w-full">
          {query ? (
            <p>
              <span className="font-semibold text-foreground">
                {formatNumber(totalMatches, locale)}
              </span>{" "}
              {t("resultsFoundCount", { count: totalMatches, query })}
            </p>
          ) : (
            <div className="flex items-center justify-between w-full">
              {isHomePage ? (
                <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  {t("popularRoutes")}
                </h2>
              ) : (
                <p>
                  {t("showingAll")}{" "}
                  <span className="font-semibold text-foreground">
                    {formatNumber(filteredRoutes.length, locale)}
                  </span>{" "}
                  {t("routes")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filteredRoutes.length > 0 || filteredBuses.length > 0 ? (
          <div className="space-y-10">

            {filteredBuses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{t("matchingBuses")}</h3>
                </div>
                <motion.div
                  key="buses-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {filteredBuses.map((bus, i) => (
                    <motion.div
                      key={`${bus.title.en}-${bus.routes?.en?.[0]?.name || ""}-${bus.routes?.en?.[bus.routes.en.length - 1]?.name || ""}-${i}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: i * 0.02 }}
                      className="flex flex-col"
                    >
                      <BusSearchResultCard bus={bus} locale={locale} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Routes Section */}
            {filteredRoutes.length > 0 && (
              <div className="space-y-4">
                {query.trim() && filteredBuses.length > 0 && (
                  <div className="flex items-center gap-2 border-t pt-6">
                    <h3 className="text-lg font-bold text-foreground">{t("matchingRoutes")}</h3>
                  </div>
                )}
                <motion.div
                  key="routes-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {filteredRoutes.map((route, i) => (
                    <motion.div
                      key={route.code.en}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: i * 0.02 }}
                      className="flex flex-col"
                    >
                      <RouteCard route={route} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* View All Routes Button (only on homepage and when not searching) */}
            {isHomePage && !query.trim() && (
              <div className="pt-4 text-center">
                <Button asChild size="lg" variant="outline" className="px-8 shadow-xs border-primary/20 hover:bg-primary/5">
                  <Link href="/routes">{t("viewAllRoutes")}</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t("noRoutes")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("noRoutesAdvice")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setQuery("")}>
              {t("browseAll")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BusSearchResultCard({ bus, locale }: { bus: BusOperator; locale: string }) {
  const t = useTranslations("Home");
  const [hasError, setHasError] = useState(!bus.image);

  return (
    <Link href={`/buses?search=${encodeURIComponent(bus.title.en)}`} className="group flex flex-col flex-1 focus:outline-none">
      <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-primary/30 flex flex-col p-3 gap-3 border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-11 shrink-0 rounded-md overflow-hidden border border-border/40 bg-muted flex items-center justify-center">
            {hasError ? (
              <Bus className="h-5 w-5 text-muted-foreground/30" />
            ) : (
              <Image
                src={bus.image!}
                alt={locale === "en" ? bus.title.en : bus.title.bn}
                fill
                className="object-cover object-center"
                onError={() => setHasError(true)}
                sizes="(max-width: 768px) 64px, 64px"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-foreground truncate leading-snug">
              {locale === "en" ? bus.title.en : bus.title.bn}
            </h4>
            <Badge variant="outline" className="text-[8px] py-0 px-1 mt-1 font-semibold border-transparent bg-primary/5 text-primary">
              {bus.service_type || "Standard"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/45 mt-auto">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {bus.time.start} - {bus.time.close}
          </span>
          <span className="font-bold text-primary group-hover:underline text-[9px] shrink-0">
            {t("viewOperator")} →
          </span>
        </div>
      </Card>
    </Link>
  );
}
