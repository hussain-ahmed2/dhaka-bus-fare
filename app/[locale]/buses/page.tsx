import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BusesClient from "./buses-client";

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Buses" });

	return {
		metadataBase: new URL("https://dhakabusfare.vercel.app"),
		title: t("metaTitle"),
		description: t("metaDescription"),
		keywords: t("metaKeywords"),
	};
}

export default function Page() {
	return <BusesClient />;
}
