import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Chart" });
	return {
		metadataBase: new URL("https://dhakabusfare.vercel.app"),
		title: t("metaTitle"),
		description: t("metaDescription"),
	};
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
