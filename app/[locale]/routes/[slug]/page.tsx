"use client";

import { getRouteBySlug, getBusesForRoute } from "@/lib/busData";
import { notFound } from "next/navigation";
import RouteHero from "@/components/route-hero";
import StopTimeline from "@/components/stop-timeline";
import FareCalculator from "@/components/fare-calculator";
import RouteOperators from "@/components/route-operators";
import { useState, use, useMemo, useEffect } from "react";
import { useRecentStore } from "@/hooks/recent-store";

export default function RouteDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
	const { slug, locale } = use(params);
	const route = useMemo(() => getRouteBySlug(slug), [slug]);
	const operators = useMemo(() => (route ? getBusesForRoute(route) : []), [route]);
	const addViewedRoute = useRecentStore((state) => state.addViewedRoute);

	useEffect(() => {
		if (slug) {
			addViewedRoute(slug);
		}
	}, [slug, addViewedRoute]);

	const [fromIdx, setFromIdx] = useState<number | null>(null);
	const [toIdx, setToIdx] = useState<number | null>(null);

	if (!route) notFound();

	const handleSelectRange = (start: number, end: number) => {
		setFromIdx(start);
		setToIdx(end);
	};

	const selectedRange = useMemo(() => {
		if (fromIdx !== null && toIdx !== null) {
			return {
				start: Math.min(fromIdx, toIdx),
				end: Math.max(fromIdx, toIdx),
			};
		}
		return null;
	}, [fromIdx, toIdx]);

	return (
		<main className="min-h-screen">
			<RouteHero route={route} />

			<div className="container mx-auto px-4 sm:px-6 py-10">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
					{/* Stop timeline – takes up wider left column */}
					<div className="lg:col-span-3">
						<StopTimeline route={route} onSelectRange={handleSelectRange} selectedRange={selectedRange} />
						<RouteOperators operators={operators} locale={locale} />
					</div>

					{/* Fare calculator – sticky right column */}
					<div className="lg:col-span-2">
						<div className="sticky top-24">
							<FareCalculator
								route={route}
								fromIdx={fromIdx}
								toIdx={toIdx}
								onFromChange={setFromIdx}
								onToChange={setToIdx}
							/>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
