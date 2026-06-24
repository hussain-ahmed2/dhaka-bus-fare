"use client";

import dynamic from "next/dynamic";
import { TrainFront } from "lucide-react";

const MetroMap = dynamic(() => import("@/components/metro-map"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-full flex items-center justify-center bg-muted/20">
			<div className="text-center space-y-3">
				<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
					<TrainFront className="h-6 w-6 text-primary" />
				</div>
				<div className="space-y-1">
					<p className="text-sm font-semibold text-foreground">Loading Metro Map...</p>
					<p className="text-xs text-muted-foreground">Initializing map and train data</p>
				</div>
			</div>
		</div>
	),
});

export default function MetroMapWrapper() {
	return <MetroMap />;
}
