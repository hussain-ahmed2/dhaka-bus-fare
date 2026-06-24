import { getAllRoutes, getAllBuses } from "@/lib/busData";

const BASE_URL = "https://dhakabusfare.vercel.app";

export async function GET() {
	const routeCount = getAllRoutes().length;
	const busCount = getAllBuses().length;

	const content = `# Dhaka Bus Fare & Routes

> A free, open-source tool to find bus routes and calculate fares across the Dhaka Metro Area, Bangladesh. Data is based on official BRTA (Bangladesh Road Transport Authority) records.

## What This Site Does

- Lists all ${routeCount} official bus routes operating in the Dhaka Metro Area
- Lists all ${busCount} bus operators in the Dhaka Metro Area with their active routes and timings
- Calculates bus fares between any two stops based on distance
- Provides an interactive stop-to-stop fare matrix for any route
- Provides an interactive, physics-simulated real-time tracking map of the Dhaka Metro Rail (MRT Line-6)
- Calculates metro fares (including MRT/Rapid Pass discounts) and schedules
- Supports both English and Bengali (বাংলা) languages

## Key Pages

- [Route Browser](${BASE_URL}/en): Interactive homepage to search and browse all ${routeCount} bus routes
- [All Routes Directory](${BASE_URL}/en/routes): Complete listing and search for all ${routeCount} routes in one place
- [Bus Directory](${BASE_URL}/en/buses): Search and browse all ${busCount} real-world bus operators with routes and stop sequence
- [Fare Calculator](${BASE_URL}/en/fare-calculator): Calculate fare between any two stops (supports direct and 1-transfer connecting routes)
- [Fare Chart](${BASE_URL}/en/fare-chart): View the complete stop-to-stop fare matrix for any selected route
- [Dhaka Metro Rail](${BASE_URL}/en/metro): Metro schedules, fare calculator, fare chart, and discount details
- [Interactive Metro Map](${BASE_URL}/en/metro/map): Real-time simulated train positions, nearest station finder, and walking directions
- [About](${BASE_URL}/en/about): Project background and data sources

## Fare Calculation Method

Fares are calculated as:

  fare = max(minimum_fare, distance_km × rate_per_km)

Rounded up to the nearest ৳5.

Default values (user-configurable):
- Rate: ৳2.53 per km
- Minimum fare: ৳10

## Data & Coverage

- Source: Official BRTA (Bangladesh Road Transport Authority) records
- Routes covered: ${routeCount} bus routes across the Dhaka Metro Area
- Maintained in a public GitHub repository — open for community contributions
- Includes stop names in both English and Bengali

## Sitemap

${BASE_URL}/sitemap.xml

## Language Support

All pages available in:
- English: ${BASE_URL}/en
- Bengali: ${BASE_URL}/bn
`;

	return new Response(content, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
		},
	});
}
