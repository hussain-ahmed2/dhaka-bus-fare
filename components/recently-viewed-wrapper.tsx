"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

function RecentlyViewedSkeleton() {
	return (
		<>
			<Separator />
			<section className="container mx-auto px-4 sm:px-6 py-10">
			<div className="space-y-4">
				{/* Heading — same height as "h2 text-xl font-bold" */}
				<Skeleton className="h-7 w-48" />

				{/* Cards — exact mirror of RouteCard's Card/CardHeader/CardContent */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div
							key={i}
							className="rounded-2xl ring-1 ring-foreground/10 bg-card py-6 flex flex-col gap-6"
						>
							{/* CardHeader: px-6, grid gap-2 */}
							<div className="px-6 flex flex-col gap-2">
								{/* Badge + ArrowRight row */}
								<div className="flex items-start justify-between gap-2">
									<Skeleton className="h-5 w-14 rounded-full" />
									<Skeleton className="h-4 w-4 shrink-0" />
								</div>
								{/* Route name: text-sm leading-snug line-clamp-2 — 2 lines × ~20px */}
								<div className="space-y-1.5">
									<Skeleton className="h-5 w-full" />
									<Skeleton className="h-5 w-3/4" />
								</div>
							</div>

							{/* CardContent: px-6 pt-0, flex-1 flex flex-col justify-end space-y-3 */}
							<div className="px-6 flex-1 flex flex-col justify-end space-y-3">
								{/* Stop endpoints */}
								<div className="flex flex-col gap-1.5">
									<div className="flex items-center gap-2">
										<Skeleton className="h-3 w-3 shrink-0 rounded-sm" />
										<Skeleton className="h-3 flex-1" />
									</div>
									{/* Connector line: ml-[5px] w-px h-3 */}
									<div className="ml-[5px] w-px h-3 bg-border" />
									<div className="flex items-center gap-2">
										<Skeleton className="h-3 w-3 shrink-0 rounded-sm" />
										<Skeleton className="h-3 w-3/4" />
									</div>
								</div>
								{/* Footer */}
								<div className="flex items-center justify-between pt-2 border-t border-border/50">
									<Skeleton className="h-3 w-24" />
									<Skeleton className="h-3 w-14" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
		</>
	);
}

const RecentlyViewedSection = dynamic(
	() => import("@/components/recently-viewed-section"),
	{ ssr: false, loading: () => <RecentlyViewedSkeleton /> }
);

export default RecentlyViewedSection;

