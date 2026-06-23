"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Bus, Clock, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import type { BusOperator } from "@/types";
import Image from "next/image";
import { formatTime } from "@/lib/utils";

interface RouteOperatorsProps {
	operators: BusOperator[];
	locale: string;
}

export default function RouteOperators({ operators, locale }: RouteOperatorsProps) {
	const t = useTranslations("Route");

	if (operators.length === 0) {
		return (
			<Card className="border-dashed mt-8 p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
				<Bus className="h-10 w-10 opacity-30" />
				<p className="font-medium">{t("noOperatingBuses")}</p>
			</Card>
		);
	}

	return (
		<div className="space-y-6 mt-8">
			<div>
				<h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
					<Bus className="h-5 w-5 text-primary" />
					{t("operatingBuses")}
				</h3>
				<div className="h-0.5 w-16 bg-primary rounded-full mt-2" />
			</div>

			<motion.div
				className="grid grid-cols-1 sm:grid-cols-2 gap-4"
				initial="hidden"
				animate="show"
				variants={{
					hidden: { opacity: 0 },
					show: {
						opacity: 1,
						transition: {
							staggerChildren: 0.05,
						},
					},
				}}
			>
				{operators.map((operator, i) => (
					<motion.div
						key={`${operator.title.en}-${operator.routes?.en?.[0]?.name || ""}-${operator.routes?.en?.[operator.routes.en.length - 1]?.name || ""}-${i}`}
						variants={{
							hidden: { opacity: 0, y: 15 },
							show: { opacity: 1, y: 0 },
						}}
					>
						<OperatorCard operator={operator} locale={locale} />
					</motion.div>
				))}
			</motion.div>
		</div>
	);
}

function OperatorCard({ operator, locale }: { operator: BusOperator; locale: string }) {
	const t = useTranslations("Route");
	const [imageSrc, setImageSrc] = useState<string>(operator.image || "");
	const [hasError, setHasError] = useState(!operator.image);

	const handleImageError = () => {
		setHasError(true);
	};

	return (
		<Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-row items-center p-3 gap-4 border-border bg-card">
			{/* Bus Operator Image/Logo */}
			<div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
				{hasError ? (
					<div className="flex flex-col items-center justify-center text-muted-foreground/40 w-full h-full">
						<Bus className="h-8 w-8" />
					</div>
				) : (
					<Image
						src={imageSrc}
						alt={locale === "en" ? operator.title.en : operator.title.bn}
						fill
						className="object-cover object-center"
						onError={handleImageError}
						sizes="(max-width: 768px) 96px, 96px"
					/>
				)}
			</div>

			{/* Metadata */}
			<div className="flex-1 min-w-0 space-y-1.5">
				<h4 className="font-bold text-sm sm:text-base text-foreground leading-tight truncate">
					{locale === "en" ? operator.title.en : operator.title.bn}
				</h4>

				<div className="flex flex-wrap gap-1">
					<Badge variant="secondary" className="text-[10px] py-0 px-2 font-bold bg-primary/10 text-primary border-transparent">
						{operator.service_type || (locale === "en" ? "Standard Service" : "সাধারণ সার্ভিস")}
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
