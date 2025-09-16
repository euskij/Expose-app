// Simple location analysis mock
interface Location {
  lat: number;
  lon: number;
}

interface LocationContext {
  distanceToCenter: number;
  transitAccessibility: string;
  noise: string;
  greenScore: number;
}

export async function analyzeLocation(location: Location): Promise<LocationContext> {
  // Mock implementation
  return {
    distanceToCenter: 2500,
    transitAccessibility: "Gut",
    noise: "Moderat",
    greenScore: 75
  };
}
