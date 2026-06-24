import { getAllRoutes, routeToSlug } from "@/lib/busData";
import type { MetadataRoute } from "next";

const BASE_URL = "https://dhakabusfare.vercel.app";

// Use a pinned date — avoids unnecessary re-crawl on every deploy.
// Update this when content actually changes.
const STATIC_LAST_MODIFIED = new Date("2026-06-21");
const ROUTE_LAST_MODIFIED = new Date("2026-06-01");

type SitemapEntry = MetadataRoute.Sitemap[number];

function staticEntry(
  path: string,
  opts: Partial<SitemapEntry> = {},
): SitemapEntry {
  const enUrl = `${BASE_URL}/en${path}`;
  const bnUrl = `${BASE_URL}/bn${path}`;

  return {
    url: enUrl,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        en: enUrl,
        bn: bnUrl,
        "x-default": enUrl,
      },
    },
    ...opts,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // ─── Static pages ────────────────────────────────────────
  entries.push(
    staticEntry("", {
      changeFrequency: "daily",
      priority: 1.0,
    }),
    staticEntry("/buses", {
      changeFrequency: "daily",
      priority: 0.9,
    }),
    staticEntry("/routes", {
      changeFrequency: "daily",
      priority: 0.9,
    }),
    staticEntry("/fare-calculator", {
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    staticEntry("/fare-chart", {
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    staticEntry("/metro", {
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    staticEntry("/metro/map", {
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    staticEntry("/about", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  // ─── Route pages (one entry per route, with both locale alternates) ──
  for (const route of getAllRoutes()) {
    const slug = routeToSlug(route);
    const enUrl = `${BASE_URL}/en/routes/${slug}`;
    const bnUrl = `${BASE_URL}/bn/routes/${slug}`;

    entries.push({
      url: enUrl,
      lastModified: ROUTE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: enUrl,
          bn: bnUrl,
          "x-default": enUrl,
        },
      },
    });
  }

  return entries;
}
