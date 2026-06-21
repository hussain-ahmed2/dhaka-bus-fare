import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Route, Stop } from "@/types";
import { formatNumber } from "@/lib/utils";

interface FareResultCardProps {
  route: Route;
  distance: string;
  fare: number;
  path: Stop[];
  locale: string;
  index: number;
}

export function FareResultCard({
  route,
  distance,
  fare,
  path,
  locale,
  index,
}: FareResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge
                variant="secondary"
                className="text-[10px] font-bold tracking-widest text-primary"
              >
                {locale === "en" ? route.code.en : route.code.bn}
              </Badge>
              <CardTitle className="text-lg">
                {locale === "en" ? route.name.en : route.name.bn}
              </CardTitle>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div className="text-2xl font-extrabold text-foreground leading-none">
                ৳{formatNumber(fare, locale)}
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">
                {formatNumber(distance, locale)} km
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 bg-background">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
            {path.map((stop, sIdx) => (
              <div key={stop.name.en} className="flex items-center gap-2">
                <span
                  className={
                    sIdx === 0 || sIdx === path.length - 1
                      ? "text-foreground font-medium"
                      : ""
                  }
                >
                  {locale === "en" ? stop.name.en : stop.name.bn}
                </span>
                {sIdx < path.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
