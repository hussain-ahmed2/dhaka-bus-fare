import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Navigation, MapPin } from "lucide-react";

export function RouteCardSkeleton() {
	return (
		<Card className="h-full border-border flex flex-col bg-card">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<Skeleton className="h-5 w-12 rounded-md" />
					<ArrowRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
				</div>
				<div className="pt-1">
					<Skeleton className="h-5 w-3/4 rounded-md" />
				</div>
			</CardHeader>

			<CardContent className="pt-0 space-y-3 flex-1 flex flex-col justify-end">
				{/* Route endpoints skeleton */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Navigation className="h-3 w-3 text-green-500/20 shrink-0" />
						<Skeleton className="h-3.5 w-24 rounded-md" />
					</div>
					<div className="ml-[5px] w-px h-3 bg-border" />
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<MapPin className="h-3 w-3 text-red-500/20 shrink-0" />
						<Skeleton className="h-3.5 w-28 rounded-md" />
					</div>
				</div>

				{/* Footer stats skeleton */}
				<div className="flex items-center justify-between pt-2 border-t border-border/50">
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<Skeleton className="h-3.5 w-24 rounded-md" />
					</div>
					<Skeleton className="h-3.5 w-16 rounded-md" />
				</div>
			</CardContent>
		</Card>
	);
}

export function RouteGridSkeleton() {
	return (
		<div className="space-y-8">
			{/* Search Input Skeleton */}
			<div className="relative w-full h-11 bg-muted/10 border border-border rounded-xl">
				<Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
			</div>

			{/* Results Label Skeleton */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-48 rounded-md" />
			</div>

			{/* Grid of Skeletons */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<RouteCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
