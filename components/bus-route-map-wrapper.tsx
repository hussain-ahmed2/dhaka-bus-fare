"use client";

import dynamic from "next/dynamic";
import { Map } from "lucide-react";
import type { Route } from "@/types";

const BusRouteMap = dynamic(() => import("@/components/bus-route-map"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 min-h-[400px] rounded-2xl border-2 border-dashed border-primary/20">
			<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse mb-3">
				<Map className="h-6 w-6 text-primary" />
			</div>
			<p className="text-sm font-semibold text-foreground">Loading Route Map...</p>
			<p className="text-xs text-muted-foreground mt-1">Initializing map data</p>
		</div>
	),
});

export default function BusRouteMapWrapper({ route, fromIdx, toIdx }: { route: Route; fromIdx: number | null; toIdx: number | null }) {
	return <BusRouteMap route={route} fromIdx={fromIdx} toIdx={toIdx} />;
}
