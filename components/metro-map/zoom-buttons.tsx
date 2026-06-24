"use client";

import { useMap } from "react-leaflet";
import { Plus, Minus } from "lucide-react";

export function ZoomButtons() {
	const map = useMap();
	return (
		<div className="absolute right-3 bottom-24 sm:bottom-4 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
			<button
				onClick={() => map.zoomIn()}
				className="w-9 h-9 bg-background/90 backdrop-blur-md border border-border rounded-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer"
				aria-label="Zoom in"
			>
				<Plus className="w-4 h-4 text-foreground" />
			</button>
			<button
				onClick={() => map.zoomOut()}
				className="w-9 h-9 bg-background/90 backdrop-blur-md border border-border rounded-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer"
				aria-label="Zoom out"
			>
				<Minus className="w-4 h-4 text-foreground" />
			</button>
		</div>
	);
}
