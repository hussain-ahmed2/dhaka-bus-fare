import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RoutesClient from "./routes-client";

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Navbar" });

	const title = locale === "en"
		? "All Bus Routes in Dhaka - Dhaka Bus"
		: "ঢাকার সকল বাস রুট - ঢাকা বাস";

	const description = locale === "en"
		? "Browse the complete list of 110+ official and unofficial bus routes operating across the Dhaka Metro Area."
		: "ঢাকা মেট্রো এলাকায় চলাচলকারী ১১০টিরও বেশি বাসের সম্পূর্ণ রুটের তালিকা দেখুন।";

	return {
		metadataBase: new URL("https://dhakabusfare.vercel.app"),
		title,
		description,
		keywords: t("navRoutes"),
	};
}

export default function Page() {
	return <RoutesClient />;
}
