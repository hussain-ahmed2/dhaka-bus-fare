"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Bus, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import type { BusOperator } from "@/types";
import Image from "next/image";
import { formatTime } from "@/lib/utils";
import { translateServiceType } from "@/lib/busData";

interface RouteOperatorsProps {
	operators: BusOperator[];
	locale: string;
}

export default function RouteOperators({ operators, locale }: RouteOperatorsProps) {
	const t = useTranslations("Route");

	if (!operators || operators.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2 bg-muted/5">
				<Bus className="h-8 w-8 text-muted-foreground/45 mx-auto" />
				<p className="font-semibold text-foreground text-sm">{t("noOperatingBuses")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
				<Bus className="h-5 w-5 text-primary" />
				{t("operatingBuses")}
			</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
				{operators.map((operator) => (
					<motion.div
						key={operator.title.en}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<OperatorCard operator={operator} locale={locale} />
					</motion.div>
				))}
			</div>
		</div>
	);
}

function OperatorCard({ operator, locale }: { operator: BusOperator; locale: string }) {
	const [imageSrc] = useState<string>(operator.image || "");
	const [hasError, setHasError] = useState(!operator.image);

	const handleImageError = () => {
		setHasError(true);
	};

	return (
		<Card className="flex flex-row items-center gap-3.5 p-3.5 hover:shadow-md transition-shadow h-28">
			{/* Image */}
			<div className="relative w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
				{hasError ? (
					<Bus className="h-8 w-8 text-muted-foreground/50" />
				) : (
					<Image
						src={imageSrc}
						alt={locale === "en" ? operator.title.en : operator.title.bn}
						fill
						className="object-cover"
						onError={handleImageError}
						sizes="80px"
					/>
				)}
			</div>

			{/* Metadata */}
			<div className="flex-1 min-w-0 space-y-1.5">
				<h4 className="font-bold text-sm sm:text-base text-foreground leading-tight truncate">
					{locale === "en" ? operator.title.en : operator.title.bn}
				</h4>

				<div className="flex flex-wrap gap-1">
					<Badge
						variant="secondary"
						className="text-[10px] py-0 px-2 font-bold bg-primary/10 text-primary border-transparent"
					>
						{operator.service_type ? translateServiceType(operator.service_type, locale) : (locale === "en" ? "Standard Service" : "সাধারণ সার্ভিস")}
					</Badge>
				</div>

				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" />
					<span className="truncate">
						{formatTime(operator.time.start, locale)} - {formatTime(operator.time.close, locale)}
					</span>
				</div>
			</div>
		</Card>
	);
}
