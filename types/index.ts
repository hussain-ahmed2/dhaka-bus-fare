export interface LocalizedText {
  bn: string;
  en: string;
}

export interface Stop {
  name: LocalizedText;
  distance: number;
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

