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
		title: t("title"),
		description: t("description"),
		icons: {
			icon: [
				{ url: "/logo.png" },
				{ url: "/logo.png", sizes: "192x192", type: "image/png" },
				{ url: "/logo.png", sizes: "512x512", type: "image/png" },
			],
			apple: { url: "/logo.png" },
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

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Dhaka Bus" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="theme-color" content="#0f172a" />
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
