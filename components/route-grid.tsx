"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RouteCard from "@/components/route-card";
import SearchBar from "@/components/search-bar";
import { searchRoutes } from "@/lib/busData";
import type { Route } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useSearchQuery } from "@/hooks/use-search-query";

interface RouteGridProps {
	initialRoutes: Route[];
}

export default function RouteGrid({ initialRoutes }: RouteGridProps) {
	const { value: query, setValue: setSearchQuery, clearValue: handleClearSearch } = useSearchQuery("search", 300);
	const [debouncedQuery, setDebouncedQuery] = useState(query);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, 200); // 200ms debounce for list filtering to keep typing fluid
		return () => clearTimeout(timer);
	}, [query]);

	const t = useTranslations("Home");
	const locale = useLocale();

	const filteredRoutes = useMemo(() => {
		if (debouncedQuery.trim()) {
			return searchRoutes(debouncedQuery);
		}
		return initialRoutes;
	}, [debouncedQuery, initialRoutes]);

	const totalMatches = filteredRoutes.length;

	return (
		<div className="space-y-8">
			{/* Search Input */}
			<SearchBar
				value={query}
				onChange={setSearchQuery}
				onClear={handleClearSearch}
				placeholder={t("searchPlaceholder")}
			/>

			{/* Results Label */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground w-full">
					{debouncedQuery ? (
						<p>
							<span className="font-semibold text-foreground">{formatNumber(totalMatches, locale)}</span>{" "}
							{t("resultsFoundCount", { count: totalMatches, query: debouncedQuery })}
						</p>
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
			</div>

			{/* Grid of Results */}
			<AnimatePresence mode="wait">
				{filteredRoutes.length > 0 ? (
					<motion.div
						key="results"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="space-y-10"
					>
						<div className="space-y-4">
							<motion.div
								key="routes-grid"
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
							>
								{filteredRoutes.map((route) => (
									<motion.div
										key={route.code.en}
										initial={{ opacity: 0, y: 16 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.15 }}
										className="flex flex-col"
									>
										<RouteCard route={route} />
									</motion.div>
								))}
							</motion.div>
						</div>
					</motion.div>
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
							<p className="text-sm text-muted-foreground mt-1">{t("noRoutesAdvice")}</p>
						</div>
						<Button variant="outline" size="sm">
							<Link href="/routes">{t("browseAll")}</Link>
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
