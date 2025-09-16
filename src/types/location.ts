// Gemeinsame Typdefinitionen für Location-basierte Services
export interface Location {
  lat: number;
  lon: number;
}

export interface LocationFeature {
  type: string;
  name: string;
  distance: number;
}

export interface LocationContext {
  amenities: {
    shopping: string[];
    education: string[];
    transport: string[];
    leisure: string[];
  };
  environment: {
    noise: number;
    green: number;
    residential: number;
  };
  accessibility: {
    publicTransport: number;
    highway: number;
    center: number;
  };
}

export interface LocationAnalysis {
  positives: string[];
  negatives: string[];
  score: number;
}

export type LocationWithFeatures = {
  amenities: {
    shopping: LocationFeature[];
    education: LocationFeature[];
    transport: LocationFeature[];
    leisure: LocationFeature[];
  };
  environment: LocationContext['environment'];
  accessibility: LocationContext['accessibility'];
}