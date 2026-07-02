import { NextResponse } from 'next/server';

export async function GET() {
	const BASE_URL = "https://dhakabusfare.vercel.app";
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-routes.xml</loc>
  </sitemap>
</sitemapindex>`;

	return new NextResponse(xml, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
