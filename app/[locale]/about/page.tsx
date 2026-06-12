import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Bus, MapPin, Calculator, Github, Map, Search, Smartphone, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllRoutes, getTotalUniqueStops } from "@/lib/busData";

// Enable static generation with ISR (revalidate every 24 hours)
export const revalidate = 86400;

export const metadata: Metadata = {
	title: "About",
	description: "About the Dhaka Metro Bus Fare application.",
};

export default async function AboutPage() {
	const t = await getTranslations("About");
	const totalRoutes = getAllRoutes().length;
	const totalStops = getTotalUniqueStops();

	const features = [
		{
			icon: <Map className="h-6 w-6 text-primary" />,
			title: t("f1Title"),
			description: t("f1Desc"),
		},
		{
			icon: <Calculator className="h-6 w-6 text-primary" />,
			title: t("f2Title"),
			description: t("f2Desc"),
		},
		{
			icon: <Search className="h-6 w-6 text-primary" />,
			title: t("f3Title"),
			description: t("f3Desc"),
		},
		{
			icon: <Smartphone className="h-6 w-6 text-primary" />,
			title: "Mobile Friendly",
			description: "Fully responsive design that works great on phones, tablets, and desktops.",
		},
	];

	return (
		<main className="min-h-screen">
			{/* Hero */}
			<section className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/60 text-primary-foreground py-16 px-4 sm:px-6">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
				</div>
				<div className="relative mx-auto max-w-3xl text-center space-y-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/15 border border-primary-foreground/20 mx-auto">
						<Bus className="h-8 w-8" />
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t("title")}</h1>
					<p className="text-sm sm:text-base text-primary-foreground/80 max-w-md mx-auto leading-relaxed">
						{t("subtitle")}
					</p>
				</div>
			</section>

			<section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-12">
				{/* Stats */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					{[
						{
							icon: <Bus className="h-5 w-5 text-primary" />,
							value: totalRoutes,
							label: "Routes",
						},
						{
							icon: <MapPin className="h-5 w-5 text-primary" />,
							value: totalStops,
							label: "Unique Stops",
						},
						{
							icon: <Calculator className="h-5 w-5 text-primary" />,
							value: "৳10+",
							label: "Min Fare",
						},
						{
							icon: <Zap className="h-5 w-5 text-primary" />,
							value: "Free",
							label: "Always",
						},
					].map((s) => (
						<Card key={s.label}>
							<CardContent className="pt-5 pb-4 text-center space-y-1">
								<div className="flex justify-center">{s.icon}</div>
								<div className="text-2xl font-extrabold tracking-tight">{s.value}</div>
								<div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
									{s.label}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Features */}
				<div>
					<h2 className="text-xl font-bold mb-5">{t("featuresTitle")}</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{features.map((f) => (
							<Card key={f.title}>
								<CardContent className="pt-5 pb-5 flex gap-4">
									<span className="shrink-0">{f.icon}</span>
									<div>
										<p className="font-semibold text-sm">{f.title}</p>
										<p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
											{f.description}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Data credit */}
				<div className="rounded-xl border border-border bg-muted/30 p-6 space-y-3">
					<h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
						{t("sourceTitle")}
					</h2>
					<p className="text-sm text-foreground leading-relaxed">
						{t("sourceDesc")}{" "}
						<a
							href="https://github.com/imamhossain94/dhaka-metro-area-bus-fare-list"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary underline underline-offset-3 hover:text-primary/80"
						>
							{t("viewGithub")}
						</a>
					</p>
					<Button variant="outline" size="sm" asChild>
						<a
							href="https://github.com/imamhossain94/dhaka-metro-area-bus-fare-list"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Github className="h-4 w-4 mr-2" />
							View Data Source
						</a>
					</Button>
				</div>

				{/* CTA */}
				<div className="text-center space-y-4">
					<p className="text-muted-foreground text-sm">Ready to plan your journey?</p>
					<div className="flex items-center justify-center gap-3 flex-wrap">
						<Button asChild>
							<Link href="/">Browse Routes</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/fare-calculator">Calculate Fare</Link>
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
