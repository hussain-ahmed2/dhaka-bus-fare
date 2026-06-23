"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";



interface SearchBarProps {
	placeholder?: string;
	value: string;
	onChange: (val: string) => void;
	onClear: () => void;
}

export default function SearchBar({ placeholder, value, onChange, onClear }: SearchBarProps) {
	return (
		<div className="relative w-full max-w-2xl mx-auto">
			<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 z-10 pointer-events-none" />
			<Input
				id="search-routes"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder ?? "Search routes, stops…"}
				className="pl-10 pr-10 h-12 text-sm rounded-xl border-border/60 bg-background/80 backdrop-blur-sm"
			/>
			{value && (
				<Button
					variant="ghost"
					size="icon"
					onClick={onClear}
					className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
					aria-label="Clear search"
				>
					<X className="h-3.5 w-3.5" />
				</Button>
			)}
		</div>
	);
}
