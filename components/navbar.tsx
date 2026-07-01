"use client";

import { useState, useEffect } from "react";
import { Bus, Map, Calculator, Table, TrainFront, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import FareSettingsDialog from "@/components/fare-settings-dialog";
import { useStore } from "@/hooks/store";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { settings, setSettings } = useStore();
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (scrollingDown && currentScrollY > 100) {
        setIsVisible(false);
      } else if (!scrollingDown) {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const changeLocale = (newLocale: "en" | "bn") => {
    const searchParams = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`${pathname}${searchParams}`, { locale: newLocale });
  };

  const navLinks = [
    {
      href: "/",
      label: t("navHome"),
      mobileLabel: t("navMobileHome"),
      icon: Home,
      mobileOnly: true,
    },
    {
      href: "/metro",
      label: t("navMetro"),
      mobileLabel: t("navMobileMetro"),
      icon: TrainFront,
    },
    {
      href: "/routes",
      label: t("navRoutes"),
      mobileLabel: t("navRoutes"),
      icon: Map,
    },
    {
      href: "/fare-calculator",
      label: t("navCalculator"),
      mobileLabel: t("navMobileCalc"),
      icon: Calculator,
    },
    {
      href: "/fare-chart",
      label: t("navChart"),
      mobileLabel: t("navMobileChart"),
      icon: Table,
      desktopOnly: true,
    },
    {
      href: "/buses",
      label: t("navBuses"),
      mobileLabel: t("navMobileBuses"),
      icon: Bus,
    },
    {
      href: "/account",
      label: t("navAccount"),
      mobileLabel: t("navMobileAccount"),
      icon: User,
    }
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60 transition-transform duration-300 ease-in-out",
          !isVisible && "-translate-y-full",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Bus className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-bold tracking-tight">
                {t("brandTitle")}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest hidden sm:block">
                {t("brandSubtitle")}
              </span>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-xl mx-auto">
            {navLinks
              .filter((link) => !link.mobileOnly)
              .map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Button
                    key={link.href}
                    variant="ghost"
                    size="sm"
                    asChild
                    className={cn(
                      "px-4 transition-colors",
                      isActive
                        ? "bg-muted text-primary font-semibold"
                        : "",
                    )}
                  >
                    <Link href={link.href} aria-current={isActive ? "page" : undefined}>{link.label}</Link>
                  </Button>
                );
              })}
          </nav>

          {/* Global Tools: Lang & Settings */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center bg-muted/50 rounded-full p-0.5 border border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeLocale("en")}
                aria-label="Switch to English"
                aria-pressed={locale === "en"}
                className={cn(
                  "h-7 px-2 text-[10px] font-bold rounded-full transition-all",
                  locale === "en"
                    ? "bg-background shadow-xs text-foreground"
                    : "text-muted-foreground hover:bg-transparent",
                )}
              >
                EN
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeLocale("bn")}
                aria-label="বাংলায় পরিবর্তন করুন"
                aria-pressed={locale === "bn"}
                className={cn(
                  "h-7 px-2 text-[10px] font-bold rounded-full transition-all",
                  locale === "bn"
                    ? "bg-background shadow-xs text-foreground"
                    : "text-muted-foreground hover:bg-transparent",
                )}
              >
                বাং
              </Button>
            </div>

            <div className="w-px h-5 bg-border mx-0.5 sm:mx-1" aria-hidden="true" />

            <FareSettingsDialog settings={settings} onSave={setSettings} />
          </div>
        </div>
      </header>

      {/* Mobile App-style Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out",
          !isVisible && "translate-y-full",
        )}
      >
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {navLinks
            .filter((link) => !link.desktopOnly)
            .map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center h-8 w-12 rounded-full transition-all duration-300 group-active:scale-90",
                      isActive ? "bg-primary/10" : "group-hover:bg-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "stroke-[2.5px]" : "stroke-2",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none transition-all duration-300",
                      isActive ? "font-bold scale-105" : "",
                    )}
                  >
                    {link.mobileLabel}
                  </span>
                </Link>
              );
            })}
        </div>
      </nav>
    </>
  );
}
