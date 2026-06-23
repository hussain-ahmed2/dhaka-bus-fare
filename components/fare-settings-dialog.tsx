"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FareSettings } from "@/hooks/use-fare-settings";
import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/utils";

interface FareSettingsDialogProps {
  settings: FareSettings;
  onSave: (s: FareSettings) => void;
}

export default function FareSettingsDialog({
  settings,
  onSave,
}: FareSettingsDialogProps) {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [minFare, setMinFare] = useState(String(settings.minFare));
  const [farePerKm, setFarePerKm] = useState(String(settings.farePerKm));

  const handleOpen = () => {
    setMinFare(String(settings.minFare));
    setFarePerKm(String(settings.farePerKm));
    setOpen(true);
  };

  const handleSave = () => {
    const min = parseFloat(minFare);
    const rate = parseFloat(farePerKm);
    if (isNaN(min) || isNaN(rate) || min < 0 || rate <= 0) return;
    onSave({ minFare: min, farePerKm: rate });
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        title="Configure fare settings"
        aria-label={t("dialogTitle")}
        aria-haspopup="dialog"
        id="open-settings-btn"
        className="h-8 w-8 rounded-full"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              {t("dialogTitle")}
            </DialogTitle>
            <DialogDescription>{t("dialogDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="min-fare"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                {t("minFare")}
              </Label>
              <Input
                id="min-fare"
                type="number"
                min={0}
                step={1}
                value={minFare}
                onChange={(e) => setMinFare(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="fare-per-km"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                {t("farePerKm")}
              </Label>
              <Input
                id="fare-per-km"
                type="number"
                min={0.01}
                step={0.05}
                value={farePerKm}
                onChange={(e) => setFarePerKm(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5 text-xs text-muted-foreground space-y-0.5">
              <p>
                {t("current", {
                  rate: formatNumber(settings.farePerKm, locale),
                  min: formatNumber(settings.minFare, locale),
                })}
              </p>
              <p>{t("rounded")}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {t("save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
