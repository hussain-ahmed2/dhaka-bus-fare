"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/routing";
import { MapPin, ArrowRight } from "lucide-react";
import { getRouteBySlug } from "@/lib/busData";
import { getMetroLine } from "@/lib/metroData";
import type { Route, MetroLine } from "@/types";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

interface SavedRouteCardProps {
  routeId: string;
  routeType: "bus" | "metro";
  locale: string;
}

export default function SavedRouteCard({ routeId, routeType, locale }: SavedRouteCardProps) {
  const routeData = useMemo(() => {
    if (routeType === "bus") {
      return getRouteBySlug(routeId);
    }
    return getMetroLine();
  }, [routeId, routeType]);

  if (!routeData) return null;

  let name = "";
  let path: [number, number][] = [];
  let linkHref = "";

  let stopCount = 0;

  if (routeType === "bus") {
    const busRoute = routeData as Route;
    name = locale === "en" ? busRoute.name.en : busRoute.name.bn;
    linkHref = `/routes/${routeId}`;
    stopCount = busRoute.stops.length;
    // Bus routes don't have GPS coordinates in the dataset yet
    path = []; 
  } else {
    const metro = routeData as MetroLine;
    name = locale === "en" ? metro.name.en : metro.name.bn;
    linkHref = `/metro`;
    path = metro.stations.map(s => [s.lat, s.lng]);
    stopCount = metro.stations.length;
  }

  // Calculate center of the path if it exists
  const centerLat = path.length > 0 ? path.reduce((sum, p) => sum + p[0], 0) / path.length : 23.8103;
  const centerLng = path.length > 0 ? path.reduce((sum, p) => sum + p[1], 0) / path.length : 90.4125;

  return (
    <div className="flex flex-col md:flex-row overflow-hidden border rounded-lg bg-card shadow-sm group hover:shadow-md transition-shadow">
      <div className="w-full md:w-48 h-32 md:h-full min-h-[120px] bg-muted relative z-0 flex items-center justify-center">
        {path.length > 0 ? (
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={11}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            className="w-full h-full absolute inset-0 z-0"
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <Polyline positions={path} pathOptions={{ color: "var(--primary)", weight: 4 }} />
          </MapContainer>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
            <MapPin className="h-6 w-6 opacity-50" />
            <span className="text-xs uppercase tracking-wider font-semibold opacity-50">Map not available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none" />
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg mb-1">{name}</h3>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <MapPin className="h-3 w-3" />
              <span>{stopCount} Stops</span>
              <span className="px-1.5 py-0.5 ml-2 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase tracking-wider">
                {routeType}
              </span>
            </div>
          </div>
          <Link href={linkHref} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
