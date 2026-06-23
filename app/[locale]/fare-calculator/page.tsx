import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllRoutes } from "@/lib/busData";
import FareCalculatorClient from "./fare-calculator-client";

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const routes = getAllRoutes();
const stopTranslations: Record<string, string> = {};
routes.forEach((r) => {
	r.stops.forEach((s) => {
		stopTranslations[s.name.en] = s.name.bn;
	});
});

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	const sParams = await searchParams;
	const from = typeof sParams.from === "string" ? sParams.from : undefined;
	const to = typeof sParams.to === "string" ? sParams.to : undefined;

	const t = await getTranslations({ locale, namespace: "Calculator" });

	if (from && to) {
		const fromName = locale === "bn" ? (stopTranslations[from] || from) : from;
		const toName = locale === "bn" ? (stopTranslations[to] || to) : to;

		const title = locale === "en"
			? `Bus Fare from ${fromName} to ${toName} - Dhaka Bus`
			: `${fromName} থেকে ${toName} বাস ভাড়া হিসেব - ঢাকা বাস`;

		const description = locale === "en"
			? `Calculate ticket prices and find the best routes (direct & connecting) from ${fromName} to ${toName} in Dhaka Metro Area.`
			: `ঢাকার ${fromName} থেকে ${toName} বাস ভাড়া এবং রুট খুঁজুন। স্থানান্তর (১টি পরিবর্তন) সহ বাসের রুট এবং ভাড়ার তথ্য।`;

		return {
			metadataBase: new URL("https://dhakabusfare.vercel.app"),
			title,
			description,
			keywords: `${fromName} to ${toName} bus, ${fromName} to ${toName} fare, ${t("metaKeywords")}`,
			alternates: {
				canonical: `https://dhakabusfare.vercel.app/${locale}/fare-calculator?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
			},
			openGraph: {
				title,
				description,
				url: `https://dhakabusfare.vercel.app/${locale}/fare-calculator?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
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
			canonical: `https://dhakabusfare.vercel.app/${locale}/fare-calculator`,
		},
		openGraph: {
			title: t("metaTitle"),
			description: t("metaDescription"),
			url: `https://dhakabusfare.vercel.app/${locale}/fare-calculator`,
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
	return <FareCalculatorClient />;
}
