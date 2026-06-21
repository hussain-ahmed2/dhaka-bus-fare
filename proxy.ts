import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
	matcher: [
		// Match all paths EXCEPT:
		// - _next internals
		// - _vercel internals
		// - files with extensions (sitemap.xml, robots.txt, favicon.ico, *.webmanifest, etc.)
		"/((?!_next|_vercel|.*\\..*).*)",
	],
};
