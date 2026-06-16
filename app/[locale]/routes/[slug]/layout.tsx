import { getAllRoutes, getRouteBySlug } from "@/lib/busData";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

// Enable static generation with ISR (revalidate every 24 hours)
export const revalidate = 86400;

export function generateStaticParams() {
	return getAllRoutes().flatMap((route) =>
		routing.locales.map((locale) => ({
			slug: route.code.en.toLowerCase().replace(/\s/g, "-"),
			locale,
		})),
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
	const { slug, locale } = await params;
	const route = getRouteBySlug(slug);
	const t = await getTranslations({ locale, namespace: "Route" });
	if (!route) return { title: "Route Not Found" };
	const routeName = locale === "bn" ? route.name.bn : route.name.en;
	const routeCode = locale === "bn" ? route.code.bn : route.code.en;
	const lastStop = route.stops.at(-1);
	const dist = lastStop?.distance ?? 0;
	return {
		metadataBase: new URL("https://dhakabusfare.vercel.app"),
		title: `${routeCode} – ${routeName}`,
		description: `${route.stops.length} ${t("stops")} · ${dist} ${t("km")} · ${t("metaSuffix")}`,
	};
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
