import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllRoutes, routeToSlug } from "@/lib/busData";
import FareChartClient from "./fare-chart-client";

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const routes = getAllRoutes();

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	const sParams = await searchParams;
	const routeSlug = typeof sParams.route === "string" ? sParams.route : undefined;

	const t = await getTranslations({ locale, namespace: "Chart" });

	const matchedRoute = routeSlug
		? routes.find((r) => routeToSlug(r) === routeSlug.toLowerCase())
		: routes[0];

	if (matchedRoute) {
		const code = locale === "en" ? matchedRoute.code.en : matchedRoute.code.bn;
		const name = locale === "en" ? matchedRoute.name.en : matchedRoute.name.bn;
		
		const title = locale === "en"
			? `Bus Route ${code} Fare Chart & Stops Matrix - Dhaka Bus`
			: `রুট ${code} বাস ভাড়ার চার্ট ও স্টপ ম্যাট্রিক্স - ঢাকা বাস`;

		const description = locale === "en"
			? `View the complete stop-to-stop fare matrix and distance summary for Dhaka bus route ${code} (${name}).`
			: `ঢাকা সিটি বাস রুট ${code} (${name})-এর প্রতিটি স্টপের দূরত্ব এবং ভাড়ার চার্ট দেখুন।`;

		return {
			metadataBase: new URL("https://dhakabusfare.vercel.app"),
			title,
			description,
			keywords: `route ${code} fare, route ${code} chart, ${name} bus, Dhaka bus fare list, ${t("metaKeywords")}`,
			alternates: {
				canonical: routeSlug
					? `https://dhakabusfare.vercel.app/${locale}/fare-chart?route=${encodeURIComponent(routeSlug)}`
					: `https://dhakabusfare.vercel.app/${locale}/fare-chart`,
			},
			openGraph: {
				title,
				description,
				url: routeSlug
					? `https://dhakabusfare.vercel.app/${locale}/fare-chart?route=${encodeURIComponent(routeSlug)}`
					: `https://dhakabusfare.vercel.app/${locale}/fare-chart`,
				type: "website",
			},
			twitter: {
				card: "summary_large_image",
				title,
				description,
			},
		};
	}

	return {
		metadataBase: new URL("https://dhakabusfare.vercel.app"),
		title: t("metaTitle"),
		description: t("metaDescription"),
		keywords: t("metaKeywords"),
		alternates: {
			canonical: `https://dhakabusfare.vercel.app/${locale}/fare-chart`,
		},
		openGraph: {
			title: t("metaTitle"),
			description: t("metaDescription"),
			url: `https://dhakabusfare.vercel.app/${locale}/fare-chart`,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: t("metaTitle"),
			description: t("metaDescription"),
		},
	};
}

export default function Page() {
	return <FareChartClient />;
}
