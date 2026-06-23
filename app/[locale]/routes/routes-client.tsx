"use client";

import { useMemo } from "react";
import { getAllRoutes } from "@/lib/busData";
import RouteGrid from "@/components/route-grid";
import { Map } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RoutesClient() {
	const t = useTranslations("Navbar");
	const routes = useMemo(() => getAllRoutes(), []);

	return (
		<main className="min-h-screen pb-12">
			{/* Hero banner */}
			<section className="relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/60 text-primary-foreground py-16 px-4 sm:px-6">
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
				</div>
				<div className="relative container mx-auto text-center space-y-4">
					<div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
						<Map className="h-3.5 w-3.5" />
						{t("navRoutes")}
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{t("navRoutes")}
					</h1>
					<p className="text-sm sm:text-base text-primary-foreground/80 max-w-md mx-auto">
						{t("brandSubtitle") === "Fare & Routes" ? "Browse the complete city bus route network" : "শহরের সম্পূর্ণ বাস রুট নেটওয়ার্ক ব্রাউজ করুন"}
					</p>
				</div>
			</section>

			{/* Routes grid container */}
			<section className="container mx-auto px-4 sm:px-6 py-10">
				<RouteGrid initialRoutes={routes} isHomePage={false} />
			</section>
		</main>
	);
}
