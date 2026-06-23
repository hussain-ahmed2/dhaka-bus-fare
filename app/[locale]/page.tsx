import { getAllRoutes, getTotalUniqueStops } from "@/lib/busData";
import RouteGrid from "@/components/route-grid";
import HeroCalculatorCard from "@/components/hero-calculator-card";
import RecentlyViewedSection from "@/components/recently-viewed-wrapper";
import { Separator } from "@/components/ui/separator";
import { getTranslations, getLocale } from "next-intl/server";
import { formatNumber } from "@/lib/utils";
import { Bus } from "lucide-react";

// Enable static generation with ISR (revalidate every 24 hours)
export const revalidate = 86400;

export default async function HomePage() {
	const routes = getAllRoutes();
	const totalRoutes = routes.length;
	const totalStops = getTotalUniqueStops();
	const t = await getTranslations("Home");
	const locale = await getLocale();

	return (
		<main className="min-h-screen">
			{/* ── Hero ────────────────────────────────────────── */}
			<section className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/70 text-primary-foreground">
				{/* Decorative blur blobs */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
					<div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
				</div>

				<div className="relative container mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
					{/* Left: Text content */}
					<div className="text-center lg:text-left space-y-5">
						<div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
							<Bus className="h-3.5 w-3.5" />
							{t("routesBadge")}
						</div>
						<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
							{t("title")}{" "}
							<span className="underline decoration-wavy decoration-primary-foreground/40 underline-offset-4">
								{t("titleHighlight")}
							</span>
						</h1>
						<p className="text-base sm:text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
							{t("subtitle", { totalRoutes: formatNumber(totalRoutes, locale) })}
						</p>

						{/* Stats strip */}
						<div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
							<Stat value={formatNumber(totalRoutes, locale)} label={t("totalRoutes")} />
							<div className="h-8 w-px bg-primary-foreground/20" />
							<Stat value={formatNumber(totalStops, locale)} label={t("totalStops")} />
							<div className="h-8 w-px bg-primary-foreground/20" />
							<Stat value={t("minFare")} label={t("minFareLabel")} />
						</div>
					</div>

					{/* Right: Calculator card */}
					<div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
						<HeroCalculatorCard />
					</div>
				</div>
			</section>

			<Separator />

			{/* ── Recently Viewed Routes ──────────────────────── */}
			<RecentlyViewedSection />

			{/* ── Route Grid (Popular Routes) ─────────────────── */}
			<section className="container mx-auto px-4 sm:px-6 py-10">
				<RouteGrid initialRoutes={routes} isHomePage={true} />
			</section>
		</main>
	);
}

function Stat({ value, label }: { value: string | number; label: string }) {
	return (
		<div className="text-center">
			<div className="text-2xl font-extrabold tracking-tight">{value}</div>
			<div className="text-xs text-primary-foreground/70 uppercase tracking-widest font-medium mt-0.5">
				{label}
			</div>
		</div>
	);
}
