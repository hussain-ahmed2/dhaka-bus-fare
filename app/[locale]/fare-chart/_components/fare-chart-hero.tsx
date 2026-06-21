"use client";

import { LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";

export function FareChartHero() {
  const t = useTranslations("Chart");

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/60 text-primary-foreground py-16 px-4 sm:px-6">
      <div className="relative mx-auto max-w-3xl text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
          <LayoutGrid className="h-4 w-4" /> {t("badge")}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-primary-foreground/80 max-w-md mx-auto">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}
