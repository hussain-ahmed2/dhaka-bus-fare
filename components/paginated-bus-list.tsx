import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BusOperatorProfileCard } from "@/components/bus-operator-profile-card";
import type { BusOperator } from "@/types";

const ITEMS_PER_PAGE = 12;

export function PaginatedBusList({
	buses,
	locale,
	settings,
}: {
	buses: BusOperator[];
	locale: string;
	settings: { minFare: number; farePerKm: number };
}) {
	const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

	const displayedBuses = useMemo(() => {
		return buses.slice(0, visibleCount);
	}, [buses, visibleCount]);

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
	};

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{displayedBuses.map((bus, i) => (
					<BusOperatorProfileCard
						key={`${bus.title.en}-${bus.routes?.en?.[0]?.name || ""}-${bus.routes?.en?.[bus.routes.en.length - 1]?.name || ""}-${i}`}
						bus={bus}
						locale={locale}
						settings={settings}
						priority={i < 4}
					/>
				))}
			</div>

			{/* Load More Button */}
			{buses.length > visibleCount && (
				<div className="mt-12 text-center">
					<Button onClick={handleLoadMore} size="lg" variant="outline" className="px-8 shadow-xs">
						{locale === "en" ? "Load More Operators" : "আরো অপারেটর দেখুন"}
					</Button>
				</div>
			)}
		</>
	);
}
