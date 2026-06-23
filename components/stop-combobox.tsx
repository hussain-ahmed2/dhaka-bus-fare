"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

interface StopComboboxProps {
  label: string;
  value: string | null;
  onValueChange: (v: string | null) => void;
  placeholder: string;
  availableStops: string[];
  stopTranslations: Record<string, string>;
  locale: string;
  noStopsText: string;
  hideContainer?: boolean;
  triggerClassName?: string;
}

export function StopCombobox({
  label,
  value,
  onValueChange,
  placeholder,
  availableStops,
  stopTranslations,
  locale,
  noStopsText,
  hideContainer = false,
  triggerClassName = "",
}: StopComboboxProps) {
  const [search, setSearch] = useState("");

  const getLabel = (stop: string) => {
    if (!stop) return "";
    if (stop === "all") return locale === "en" ? "All Stops" : "সবগুলো স্টপ";
    return locale === "en" ? stop : (stopTranslations[stop] || stop);
  };

  const fuse = useMemo(() => {
    const items = availableStops.map((stop) => ({
      en: stop,
      bn: stopTranslations[stop] || "",
    }));
    return new Fuse(items, {
      keys: [
        { name: "en", weight: 1.5 },
        { name: "bn", weight: 1.5 },
      ],
      threshold: 0.4,
      minMatchCharLength: 1,
    });
  }, [availableStops, stopTranslations]);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return availableStops;
    return fuse.search(q).map((r) => r.item.en);
  }, [search, availableStops, fuse]);

  const comboboxContent = (
    <Combobox
      value={value}
      onValueChange={(v) => onValueChange(v as string | null)}
      onInputValueChange={(v) => setSearch(v)}
      itemToStringLabel={(v) => getLabel(v as string)}
      filter={null}
      onOpenChange={(open) => {
        if (open) setSearch("");
      }}
    >
      <ComboboxInput
        placeholder={placeholder}
        className={triggerClassName || "w-full bg-background"}
        showClear={!!value && value !== "all"}
      />
      <ComboboxContent>
        <ComboboxList>
          {filtered.map((stop) => (
            <ComboboxItem key={stop} value={stop}>
              {getLabel(stop)}
            </ComboboxItem>
          ))}
          {filtered.length === 0 && (
            <div className="text-muted-foreground py-4 text-center text-sm">
              {noStopsText}
            </div>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );

  if (hideContainer) {
    return comboboxContent;
  }

  return (
    <div className="space-y-1.5 border border-border p-3 rounded-xl bg-muted/20">
      <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
        {label}
      </Label>
      {comboboxContent}
    </div>
  );
}
