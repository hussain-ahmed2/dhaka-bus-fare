"use client";

import { motion } from "motion/react";
import RouteCard from "@/components/route-card";
import { getPopularRoutes } from "@/lib/busData";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

const popularRoutes = getPopularRoutes();

export default function HomeRouteGrid() {
	const t = useTranslations("Home");

	return (
		<div className="space-y-8">
			{/* Title */}
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
					<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
					{t("popularRoutes")}
				</h2>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{popularRoutes.map((route, i) => (
					<motion.div
						key={route.code.en}
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25, delay: i * 0.02 }}
						className="flex flex-col"
					>
						<RouteCard route={route} />
					</motion.div>
				))}
			</div>

			{/* View All Routes Button */}
			<div className="pt-4 text-center">
				<Button
					asChild
					size="lg"
					variant="outline"
					className="px-8 shadow-xs border-primary/20 hover:bg-primary/5"
				>
					<Link href="/routes">{t("viewAllRoutes")}</Link>
				</Button>
			</div>
		</div>
	);
}
