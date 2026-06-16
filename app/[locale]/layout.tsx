import { Inter, Noto_Sans_Bengali } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { cn } from "@/lib/utils";
import ClarityInit from "@/components/clarity";

// Enable static generation with ISR (revalidate every 24 hours)
export const revalidate = 86400;

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

const fontSans = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
});

const fontBengali = Noto_Sans_Bengali({
	variable: "--font-bengali",
	subsets: ["bengali"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Metadata" });

	return {
		metadataBase: new URL("https://dhakabusfare.vercel.app"),
		title: t("title"),
		description: t("description"),
		keywords: t("keywords"),
		icons: {
			icon: [
				{ url: "/logo.png" },
				{ url: "/logo.png", sizes: "192x192", type: "image/png" },
				{ url: "/logo.png", sizes: "512x512", type: "image/png" },
			],
			apple: { url: "/logo.png" },
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			url: `https://dhakabusfare.vercel.app/${locale}`,
			siteName: "Dhaka Bus",
			locale: locale === "bn" ? "bn_BD" : "en_US",
			type: "website",
			images: [{ url: "/og-image.png", width: 1200, height: 630 }],
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("description"),
		},
		alternates: {
			canonical: `https://dhakabusfare.vercel.app/${locale}`,
		},
	};
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	const { locale } = await params;

	if (!routing.locales.includes(locale as "en" | "bn")) {
		notFound();
	}

	setRequestLocale(locale);
	const messages = await getMessages();
	const md = await getTranslations({ locale, namespace: "Metadata" });

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: "Dhaka Bus Fare & Routes",
		alternateName: "ঢাকা বাস ভাড়া ও রুট",
		description: md("description"),
		applicationCategory: "TravelApplication",
		operatingSystem: "All",
		url: `https://dhakabusfare.vercel.app/${locale}`,
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "BDT",
		},
	};

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Dhaka Bus" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="theme-color" content="#0f172a" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body
				className={cn(
					`text-sm antialiased min-h-screen bg-background text-foreground tracking-tight selection:bg-primary/20`,
					locale === "bn" ? fontBengali.className : fontSans.className,
				)}
			>
				<ClarityInit />
				<NextIntlClientProvider messages={messages}>
					<Navbar />
					{children}
					<Footer />
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
