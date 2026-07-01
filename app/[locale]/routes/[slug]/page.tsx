"use client";

import { getRouteBySlug, getBusesForRoute } from "@/lib/busData";
import { notFound } from "next/navigation";
import RouteHero from "@/components/route-hero";
import StopTimeline from "@/components/stop-timeline";
import FareCalculator from "@/components/fare-calculator";
import RouteOperators from "@/components/route-operators";
import { useState, use, useMemo, useEffect } from "react";
import { useRecentStore } from "@/hooks/recent-store";
import BusRouteMapWrapper from "@/components/bus-route-map-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, ListTree } from "lucide-react";

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
	const [activeTab, setActiveTab] = useState<string>("timeline");

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
			<RouteHero route={route} slug={slug} />

			<div className="container mx-auto px-4 sm:px-6 py-10">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
					{/* Stop timeline – takes up wider left column */}
					<div className="lg:col-span-3 space-y-8">
						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
							<TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6 bg-muted/50 p-1 h-12 rounded-xl mx-auto lg:mx-0">
								<TabsTrigger value="timeline" className="rounded-lg h-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
									<ListTree className="w-4 h-4 mr-2" />
									Timeline
								</TabsTrigger>
								<TabsTrigger value="map" className="rounded-lg h-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
									<Map className="w-4 h-4 mr-2" />
									Live Map
								</TabsTrigger>
							</TabsList>
						</Tabs>

						{activeTab === "timeline" ? (
							<div className="mt-0 animate-in fade-in slide-in-from-bottom-2">
								<StopTimeline route={route} onSelectRange={handleSelectRange} selectedRange={selectedRange} />
							</div>
						) : (
							<div className="mt-0 h-[500px] lg:h-[600px] animate-in fade-in slide-in-from-bottom-2">
								<BusRouteMapWrapper route={route} fromIdx={fromIdx} toIdx={toIdx} />
							</div>
						)}
						
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
