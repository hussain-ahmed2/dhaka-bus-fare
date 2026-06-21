import type { MetadataRoute } from "next";

const BASE_URL = "https://dhakabusfare.vercel.app";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				// Allow all well-behaved crawlers full access
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",     // No API routes to expose
					"/_next/",   // Internal Next.js assets
					"/cdn-cgi/", // Cloudflare internal paths
				],
			},
			{
				// Explicitly allow AI/LLM crawlers — good for AI search visibility
				// (e.g. ChatGPT, Gemini, Perplexity answers, Apple Intelligence)
				userAgent: [
					"GPTBot",            // OpenAI ChatGPT browsing & training
					"Google-Extended",   // Google Gemini / AI Overviews
					"ClaudeBot",         // Anthropic Claude
					"anthropic-ai",      // Anthropic general crawler
					"PerplexityBot",     // Perplexity AI
					"YouBot",            // You.com AI search
					"Applebot-Extended", // Apple Intelligence
					"meta-externalagent",// Meta AI
					"cohere-ai",         // Cohere
					"Amazonbot",         // Amazon Alexa / AI
				],
				allow: "/",
			},
			{
				// Block aggressive SEO scrapers — consume bandwidth, send no real users
				userAgent: [
					"AhrefsBot",
					"SemrushBot",
					"DotBot",
					"MJ12bot",
					"BLEXBot",
					"PetalBot",
				],
				disallow: "/",
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
		host: BASE_URL,
	};
}
