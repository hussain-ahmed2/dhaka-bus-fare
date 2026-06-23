"use client";

import { useMemo } from "react";
import { History } from "lucide-react";
import RouteCard from "@/components/route-card";
import { getRouteBySlug } from "@/lib/busData";
import { useRecentStore } from "@/hooks/recent-store";
import { useTranslations } from "next-intl";
import type { Route } from "@/types";

export default function RecentlyViewedSection() {
  const t = useTranslations("Home");
  const { recentlyViewedSlugs } = useRecentStore();

  const recentRoutes = useMemo<Route[]>(
    () =>
      recentlyViewedSlugs
        .map((slug) => getRouteBySlug(slug))
        .filter((r): r is Route => !!r),
    [recentlyViewedSlugs]
  );

  if (recentRoutes.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 py-10 pb-0">
      <div className="space-y-4">
        {/* Heading — mirrors the popular routes heading style */}
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-primary" />
          {t("recentRoutes")}
        </h2>

        {/* Grid — same layout as popular routes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentRoutes.map((route) => (
            <RouteCard key={`recent-${route.code.en}`} route={route} />
          ))}
        </div>
      </div>
    </section>
  );
}
