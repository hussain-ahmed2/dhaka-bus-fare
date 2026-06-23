import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Clock, ChevronDown } from "lucide-react";

export function BusOperatorCardSkeleton() {
	return (
		<Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-all border-border bg-card">
			{/* Top Panel - Main details skeleton */}
			<div className="flex p-4 gap-4 items-center">
				{/* Image Container Skeleton */}
				<div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
					<Skeleton className="absolute inset-0 w-full h-full rounded-none" />
				</div>

				{/* Info Panel Skeletons */}
				<div className="flex-1 min-w-0 space-y-2">
					{/* Title Skeleton */}
					<Skeleton className="h-5 w-2/3 rounded-md" />

					{/* Badge Wrapper Skeleton */}
					<div className="flex flex-wrap gap-1.5 items-center">
						<Skeleton className="h-4.5 w-16 rounded-md" />
					</div>

					{/* Hours Wrapper Skeleton */}
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Clock className="h-3.5 w-3.5 shrink-0 opacity-25" />
						<Skeleton className="h-3.5 w-28 rounded-md" />
					</div>
				</div>
			</div>

			<Separator />

			{/* Toggle stops sequence panel skeleton */}
			<div className="px-4 py-2 bg-muted/10 flex justify-between items-center">
				<div className="flex items-center gap-1">
					<Skeleton className="h-3.5 w-28 rounded-md" />
					<ChevronDown className="h-3.5 w-3.5 opacity-25 text-primary" />
				</div>

				<Skeleton className="h-4.5 w-12 rounded-md" />
			</div>
		</Card>
	);
}

export function PaginatedBusListSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{Array.from({ length: 4 }).map((_, i) => (
				<BusOperatorCardSkeleton key={i} />
			))}
		</div>
	);
}
