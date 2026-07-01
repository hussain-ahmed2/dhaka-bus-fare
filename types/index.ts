export interface LocalizedText {
  bn: string;
  en: string;
}

export interface Stop {
  name: LocalizedText;
  distance: number;
  lat?: number;
  lng?: number;
}

export interface Route {
  code: LocalizedText;
  name: LocalizedText;
  stops: Stop[];
}

export interface BusData {
  routes: Route[];
}

export interface BusStop {
  name: string;
  sortOrder: number;
}

export interface BusOperator {
  title: LocalizedText;
  image: string | null;
  routes: {
    bn: BusStop[];
    en: BusStop[];
  };
  time: {
    start: string;
    close: string;
  };
  service_type: string;
}

// ─── Metro Rail Types ───────────────────────────────────
export interface MetroStation {
  id: string;
  name: LocalizedText;
  lat: number;
  lng: number;
  distanceFromStart: number;
  underConstruction?: boolean;
  segmentPath?: [number, number][];
}

export interface MetroFareSlab {
  minStations: number;
  maxStations: number;
  fare: number;
}

export interface MetroSchedule {
  start: string;
  end: string;
}

export interface MetroLine {
  id: string;
  name: LocalizedText;
  color: string;
  stations: MetroStation[];
  schedule: Record<string, MetroSchedule>;
  frequency: { peak: number; offPeak: number };
  peakHours: { start: string; end: string }[];
  travelTimeBetweenStations: number;
  totalTravelTime: number;
  fareSlabs: MetroFareSlab[];
  cardDiscount: number;
}

export interface SimulatedTrain {
  id: string;
  direction: "northbound" | "southbound";
  lat: number;
  lng: number;
  fromStation: MetroStation;
  toStation: MetroStation;
  progress: number;
}

export interface MetroData {
  lines: MetroLine[];
}

