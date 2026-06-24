"use client";

import dynamic from "next/dynamic";

const AdUnitComponent = dynamic(() => import("./ad-unit"), {
	ssr: false,
	loading: () => <div className="w-full min-h-[250px] bg-muted/10 animate-pulse rounded-lg" />,
});

const MultiplexComponent = dynamic(() => import("./multiplex-ad"), {
	ssr: false,
	loading: () => <div className="w-full min-h-[500px] bg-muted/10 animate-pulse rounded-lg" />,
});

export default function AdBlock({
	className,
	variant = "display",
}: {
	className?: string;
	variant?: "display" | "multiplex";
}) {
	return null;
	if (variant === "multiplex") {
		return <MultiplexComponent className={className} />;
	}
	return <AdUnitComponent className={className} />;
}
