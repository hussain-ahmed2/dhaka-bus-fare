import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
export function useSearchQuery(paramName: string = "search", delay: number = 300) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const urlValue = searchParams.get(paramName) || "";
	const [value, setValue] = useState(urlValue);

	// Debounce updates to the URL parameter
	useEffect(() => {
		const timer = setTimeout(() => {
			const params = new URLSearchParams(window.location.search);
			const currentVal = params.get(paramName) || "";
			const trimmedValue = value.trim();
			if (trimmedValue !== currentVal) {
				if (trimmedValue) {
					params.set(paramName, trimmedValue);
				} else {
					params.delete(paramName);
				}
				router.replace(`${pathname}?${params.toString()}`, { scroll: false });
			}
		}, delay);
		return () => clearTimeout(timer);
	}, [value, paramName, pathname, router, delay]);

	const clearValue = () => {
		setValue("");
		const params = new URLSearchParams(window.location.search);
		params.delete(paramName);
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return {
		value,
		setValue,
		clearValue,
	};
}
