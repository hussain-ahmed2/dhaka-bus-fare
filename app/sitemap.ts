import { getAllRoutes, routeToSlug } from "@/lib/busData";
import { routing } from "@/i18n/routing";
import type { MetadataRoute } from "next";

const baseUrl = "https://dhakabusfare.vercel.app";

const staticPages = ["", "/about", "/fare-calculator", "/fare-chart"];

export default function sitemap(): MetadataRoute.Sitemap {
	const entries: MetadataRoute.Sitemap = [];

	for (const locale of routing.locales) {
		for (const page of staticPages) {
			entries.push({
				url: `${baseUrl}/${locale}${page}`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: page === "" ? 1 : 0.8,
			});
		}

		for (const route of getAllRoutes()) {
			entries.push({
				url: `${baseUrl}/${locale}/routes/${routeToSlug(route)}`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.6,
			});
		}
	}

	return entries;
}
