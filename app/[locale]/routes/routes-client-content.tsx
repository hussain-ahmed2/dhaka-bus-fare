"use client";

import dynamic from "next/dynamic";
import { RouteGridSkeleton } from "@/components/route-card-skeleton";
import type { Route } from "@/types";

const RouteGrid = dynamic(
	() => import("@/components/route-grid"),
	{
		loading: () => <RouteGridSkeleton />,
		ssr: false,
	}
);

export default function RoutesClientContent({ initialRoutes }: { initialRoutes: Route[] }) {
	return <RouteGrid initialRoutes={initialRoutes} />;
}
