import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";

export function useSearchQueries(paramNames: string[], delay: number = 300) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const urlValues = paramNames.map((paramName) => searchParams.get(paramName) || "");
	const [values, setValues] = useState(urlValues);

	// Debounce updates to the URL parameter
	useEffect(() => {
		const timer = setTimeout(() => {
			const params = new URLSearchParams(window.location.search);
			paramNames.forEach((paramName, index) => {
				const value = values[index];
				const currentVal = params.get(paramName) || "";
				if (value !== currentVal) {
					if (value) {
						params.set(paramName, value);
					} else {
						params.delete(paramName);
					}
					router.replace(`${pathname}?${params.toString()}`, { scroll: false });
				}
			});
		}, delay);
		return () => clearTimeout(timer);
	}, [values, paramNames, pathname, router, delay]);

	const clearValues = () => {
		setValues(urlValues);
		const params = new URLSearchParams(window.location.search);
		paramNames.forEach((paramName) => {
			params.delete(paramName);
		});
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return {
		values,
		setValues,
		clearValues,
	};
}
