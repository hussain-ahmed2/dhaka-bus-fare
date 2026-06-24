import { getTranslations } from "next-intl/server";
import MetroMapWrapper from "@/components/metro-map-wrapper";
import { Suspense } from "react";
import { TrainFront } from "lucide-react";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Metro" });

	return {
		title: t("mapMetaTitle"),
		description: t("mapMetaDescription"),
	};
}

export default async function MetroMapPage() {
	return (
		<main className="container mx-auto px-0 sm:px-4 md:px-6 py-0 sm:py-6 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-3.5rem-3rem)] flex flex-col">
			<div className="w-full flex-1 sm:rounded-2xl border-0 sm:border border-border shadow-none sm:shadow-lg overflow-hidden bg-background relative">
				<Suspense fallback={
					<div className="w-full h-full flex items-center justify-center bg-muted/20">
						<div className="text-center space-y-3">
							<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
								<TrainFront className="h-6 w-6 text-primary" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-semibold text-foreground">Loading Metro Map...</p>
								<p className="text-xs text-muted-foreground">Initializing map and train data</p>
							</div>
						</div>
					</div>
				}>
					<MetroMapWrapper />
				</Suspense>
			</div>
		</main>
	);
}
