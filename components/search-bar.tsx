"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			onSearch(value);
		}, 200);
		return () => clearTimeout(timer);
	}, [value, onSearch]);

  const clear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 z-10 pointer-events-none" />
      <Input
        ref={inputRef}
        id="search-routes"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Search routes, stops…"}
        className="pl-10 pr-10 h-12 text-sm rounded-xl border-border/60 bg-background/80 backdrop-blur-sm"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
