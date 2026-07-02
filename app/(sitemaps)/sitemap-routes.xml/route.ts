import { NextResponse } from 'next/server';
import { getAllRoutes, routeToSlug } from "@/lib/busData";

const BASE_URL = "https://dhakabusfare.vercel.app";

export async function GET() {
	let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
	
	const routes = getAllRoutes();
	
	for (const route of routes) {
		const slug = routeToSlug(route);
		const enUrl = `${BASE_URL}/en/routes/${slug}`;
		const bnUrl = `${BASE_URL}/bn/routes/${slug}`;
		
		xml += `
  <url>
    <loc>${enUrl}</loc>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>${bnUrl}</loc>
    <changefreq>weekly</changefreq>
  </url>`;
	}
	
	xml += `\n</urlset>`;

	return new NextResponse(xml, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
