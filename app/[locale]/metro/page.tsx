import { getTranslations } from "next-intl/server";
import { getMetroLine, getMetroStations } from "@/lib/metroData";
import { Separator } from "@/components/ui/separator";
import { TrainFront, MapPin, Clock, Ticket } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatNumber } from "@/lib/utils";
import { getLocale } from "next-intl/server";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MetroFareCalculator = dynamic(() => import("@/components/metro-fare-calculator"), {
	loading: () => <div className="h-[300px] w-full rounded-xl border border-border bg-muted/10 animate-pulse" />,
});

const MetroFareChart = dynamic(() => import("@/components/metro-fare-chart"), {
	loading: () => <div className="h-[400px] w-full rounded-xl border border-border bg-muted/10 animate-pulse" />,
});

const MetroSchedule = dynamic(() => import("@/components/metro-schedule"), {
	loading: () => <div className="h-[500px] w-full rounded-xl border border-border bg-muted/10 animate-pulse" />,
});

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Metro" });

	return {
		title: t("metaTitle"),
		description: t("metaDescription"),
		keywords: t("metaKeywords"),
	};
}

export default async function MetroPage() {
	const t = await getTranslations("Metro");
	const locale = await getLocale();
	const line = getMetroLine();
	const stations = getMetroStations();

	return (
		<main className="min-h-screen pb-16">
			{/* ── Hero ────────────────────────────────────────── */}
			<section className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/70 text-primary-foreground">
				{/* Decorative blur blobs */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
					<div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
					{/* Subtle track lines */}
					<div className="absolute inset-0">
						<div className="absolute top-1/4 left-0 right-0 h-px bg-white/10" />
						<div className="absolute top-2/4 left-0 right-0 h-px bg-white/10" />
						<div className="absolute top-3/4 left-0 right-0 h-px bg-white/10" />
					</div>
				</div>

				<div className="relative container mx-auto px-4 sm:px-6 py-10 space-y-6">
					<div className="text-center space-y-4">
						<div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
							<TrainFront className="h-3.5 w-3.5" />
							{t("badge")}
						</div>
						<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
							{t("title")}
						</h1>
						<p className="text-base sm:text-lg text-primary-foreground/80 max-w-xl mx-auto leading-relaxed">
							{t("subtitle")}
						</p>
					</div>

					{/* Stats strip */}
					<div className="flex flex-wrap items-center justify-center gap-6 pt-2">
						<Stat
							value={formatNumber(stations.length, locale)}
							label={t("stations")}
							icon={<MapPin className="h-6 w-6" />}
						/>
						<div className="h-8 w-px bg-primary-foreground/20" />
						<Stat
							value={`${formatNumber(line.totalTravelTime, locale)} ${t("min")}`}
							label={t("travelTime")}
							icon={<Clock className="h-6 w-6" />}
						/>
						<div className="h-8 w-px bg-primary-foreground/20" />
						<Stat
							value={`৳${formatNumber(20, locale)}-${formatNumber(100, locale)}`}
							label={t("fareRange")}
							icon={<Ticket className="h-6 w-6" />}
						/>
					</div>

					{/* CTA */}
					<div className="flex justify-center pt-2">
						<Button
							className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-11 text-base font-semibold px-6 shadow-md gap-2.5"
							asChild
						>
							<Link href="/metro/map">
								<TrainFront className="size-5 shrink-0" />
								{t("openMap")}
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<Separator />

			{/* ── Content Grid ───────────────────────────────── */}
			<section className="container mx-auto px-4 sm:px-6 py-10">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Left: Fare Calculator + Chart */}
					<div className="space-y-6">
						<MetroFareCalculator />
						<MetroFareChart />
					</div>

					{/* Right: Schedule + Info */}
					<div className="space-y-6">
						<MetroSchedule />

						{/* Station Directory */}
						<Card className="border border-border shadow-md">
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<MapPin className="h-4 w-4 text-primary" />
									{t("stations")}
								</CardTitle>
								<CardDescription className="text-xs">
									{t("stationsDirectoryDesc")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
									{stations.map((station) => (
										<Link
											key={station.id}
											href={`/metro/map?station=${station.id}`}
											className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all group"
										>
											<span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
												{locale === "en" ? station.name.en : station.name.bn}
											</span>
											<span className="text-[10px] text-muted-foreground shrink-0 font-bold ml-1">
												{formatNumber(station.distanceFromStart.toFixed(1), locale)} {t("km")}
											</span>
										</Link>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</main>
	);
}

function Stat({
	value,
	label,
	icon,
}: {
	value: string | number;
	label: string;
	icon: React.ReactNode;
}) {
	return (
		<div className="text-center">
			<div className="flex items-center justify-center gap-1.5 text-2xl font-extrabold tracking-tight">
				{icon}
				{value}
			</div>
			<div className="text-xs text-primary-foreground/70 uppercase tracking-widest font-medium mt-0.5">
				{label}
			</div>
		</div>
	);
}
