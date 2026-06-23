import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllBuses, getAllBusStops } from "@/lib/busData";
import BusesClient from "./buses-client";

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Buses" });

	return {
		metadataBase: new URL("https://dhakabusfare.vercel.app"),
		title: t("metaTitle"),
		description: t("metaDescription"),
		keywords: t("metaKeywords"),
		alternates: {
			canonical: `https://dhakabusfare.vercel.app/${locale}/buses`,
		},
		openGraph: {
			title: t("metaTitle"),
			description: t("metaDescription"),
			url: `https://dhakabusfare.vercel.app/${locale}/buses`,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: t("metaTitle"),
			description: t("metaDescription"),
		},
	};
}

import { Suspense } from "react";

export default function Page() {
	const buses = getAllBuses();
	const stops = getAllBusStops();

	return (
		<Suspense fallback={null}>
			<BusesClient initialBuses={buses} initialStops={stops} />
		</Suspense>
	);
}
