import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatNumber(num: number | string, locale: string = "en"): string {
	const numObj = typeof num === "string" ? parseFloat(num) : num;
	if (isNaN(numObj)) return num.toString();

	return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US", {
		useGrouping: false,
		maximumFractionDigits: 1,
	}).format(numObj);
}

export function debounce<A extends unknown[], R>(fn: (...args: A) => R, wait: number = 500) {
	let timeout: ReturnType<typeof setTimeout> | undefined;
	return (...args: A) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), wait);
	};
}
