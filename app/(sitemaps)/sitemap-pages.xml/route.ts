import { NextResponse } from 'next/server';

const BASE_URL = "https://dhakabusfare.vercel.app";

const pages = [
	{ path: "", priority: "1.0", changefreq: "daily" },
	{ path: "/buses", priority: "0.9", changefreq: "daily" },
	{ path: "/routes", priority: "0.9", changefreq: "daily" },
	{ path: "/fare-calculator", priority: "0.9", changefreq: "weekly" },
	{ path: "/fare-chart", priority: "0.9", changefreq: "weekly" },
	{ path: "/metro", priority: "0.9", changefreq: "weekly" },
	{ path: "/metro/map", priority: "0.9", changefreq: "weekly" },
	{ path: "/about", priority: "0.5", changefreq: "monthly" },
];

export async function GET() {
	let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
	
	for (const page of pages) {
		const enUrl = `${BASE_URL}/en${page.path}`;
		const bnUrl = `${BASE_URL}/bn${page.path}`;
		
		xml += `
  <url>
    <loc>${enUrl}</loc>
    <changefreq>${page.changefreq}</changefreq>
  </url>
  <url>
    <loc>${bnUrl}</loc>
    <changefreq>${page.changefreq}</changefreq>
  </url>`;
	}
	
	xml += `\n</urlset>`;

	return new NextResponse(xml, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
