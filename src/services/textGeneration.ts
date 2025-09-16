import type { ImmobilienData } from '../types';
import { analyzeLocation } from './locationAnalysis';
import type { Location, LocationContext } from '../types/location';

interface GeneratedTexts {
  title: string;
  shortDescription: string;
  longDescription: string;
  highlights: string[];
  locationAnalysis?: {
    positives: string[];
    negatives: string[];
    score: number;
  };
}

const PROPERTY_TYPES: Record<string, string> = {
  wohnung: "Wohnung",
  mfh: "Mehrfamilienhaus",
  efh: "Einfamilienhaus",
  doppel: "Doppelhaushälfte"
};

function generatePropertyHighlights(data: ImmobilienData): string[] {
  const highlights: string[] = [];

  if (data.wohnflaeche) {
    highlights.push(`${data.wohnflaeche} m² Wohnfläche`);
  }

  if (data.zimmer) {
    highlights.push(`${data.zimmer} Zimmer`);
  }

  if (data.grundstuecksflaeche) {
    highlights.push(`${data.grundstuecksflaeche} m² Grundstücksfläche`);
  }

  if (data.baujahr) {
    highlights.push(`Baujahr ${data.baujahr}`);
  }

  if (data.heizungsart) {
    highlights.push(data.heizungsart);
  }

  return highlights;
}

function generateTitle(data: ImmobilienData): string {
  const propertyType = PROPERTY_TYPES[data.objektTyp || 'wohnung'];
  return `${propertyType} in ${data.adresse}`;
}

function generateShortDescription(data: ImmobilienData, highlights: string[]): string {
  const propertyType = PROPERTY_TYPES[data.objektTyp || 'wohnung'];
  return `${propertyType} mit ${data.wohnflaeche || 'k.A.'} m² Wohnfläche in ${data.adresse}`;
}

function generateLongDescription(data: ImmobilienData, highlights: string[]): string {
  const propertyType = PROPERTY_TYPES[data.objektTyp || 'wohnung'];
  let description = `Diese attraktive ${propertyType.toLowerCase()} befindet sich in einer ausgezeichneten Lage in ${data.adresse}. `;
  
  if (data.baujahr) {
    description += `Das im Jahr ${data.baujahr} erbaute Objekt `;
  } else {
    description += 'Das Objekt ';
  }
  
  description += `verfügt über ${data.wohnflaeche || 'k.A.'} m² Wohnfläche`;
  
  if (data.zimmer) {
    description += ` und ${data.zimmer} Zimmer`;
  }
  description += '. ';
  
  if (data.heizungsart) {
    description += `Die Immobilie ist mit ${data.heizungsart} ausgestattet. `;
  }
  
  if (data.letzte_sanierung) {
    description += `Die letzte Sanierung erfolgte ${data.letzte_sanierung}. `;
  }
  
  if (data.ist_miete && data.soll_miete) {
    description += `Die aktuelle Jahresnettomiete beträgt ${data.ist_miete} `;
    description += `mit einem Steigerungspotential auf ${data.soll_miete}. `;
  }
  
  if (data.verkaufspreis) {
    description += `Der Verkaufspreis beträgt ${data.verkaufspreis}. `;
  }
  
  if (data.maklercourtage) {
    description += `Die Maklercourtage beträgt ${data.maklercourtage}. `;
  }

  return description;
}

export async function generateTexts(
  data: ImmobilienData,
  location: Location
): Promise<GeneratedTexts> {
  try {
    // Analyse der Umgebung
    const locationContext = await analyzeLocation(location);
    
    // Generiere Basis-Texte
    const highlights = generatePropertyHighlights(data);
    const title = generateTitle(data);
    const shortDescription = generateShortDescription(data, highlights);
    
    // Generiere erweiterte Lageinformationen
    const locationScore = 85; // Mock value
    const locationDescription = `Attraktive Lage in ${data.adresse || 'zentraler Lage'}`;
    const locationAnalysis = "Sehr gute Lage mit ausgezeichneter Verkehrsanbindung"; // Mock value
    
    // Kombiniere Langbeschreibung mit Lageinfos
    const longDescription = generateLongDescription(data, highlights) + '\n\n' + locationDescription;
    
    return {
      title,
      shortDescription,
      longDescription,
      highlights,
      locationAnalysis: {
        positives: ["Gute Verkehrsanbindung", "Zentrale Lage"],
        negatives: ["Stadtnahe Lage"],
        score: locationScore
      }
    };
  } catch (error) {
    console.error('Fehler bei der Textgenerierung:', error);
    // Fallback ohne Lageanalyse
    const highlights = generatePropertyHighlights(data);
    return {
      title: generateTitle(data),
      shortDescription: generateShortDescription(data, highlights),
      longDescription: generateLongDescription(data, highlights),
      highlights
    };
  }
}

function calculateLocationScore(context: LocationContext): number {
  const scores = {
    amenities: 0,
    environment: 0,
    accessibility: 0
  };
  
  // Bewerte Einrichtungen (0-100)
  const amenityTypes = Object.values(context.amenities);
  scores.amenities = Math.min(100, 
    amenityTypes.reduce((sum, type) => sum + type.length * 10, 0)
  );
  
  // Bewerte Umgebung (0-100)
  scores.environment = (
    context.environment.green + 
    context.environment.residential + 
    (100 - context.environment.noise)
  ) / 3;
  
  // Bewerte Erreichbarkeit (0-100)
  scores.accessibility = (
    context.accessibility.publicTransport + 
    (100 - Math.min(100, context.accessibility.highway * 10)) + 
    (100 - Math.min(100, context.accessibility.center * 5))
  ) / 3;
  
  // Gewichteter Gesamtscore
  return Math.round(
    (scores.amenities * 0.3) + 
    (scores.environment * 0.4) + 
    (scores.accessibility * 0.3)
  );
}

function analyzeLocationFeatures(context: LocationContext): { positives: string[], negatives: string[] } {
  const positives: string[] = [];
  const negatives: string[] = [];
  
  // Analysiere Einrichtungen
  if (context.amenities.shopping.length >= 3) {
    positives.push('Vielfältige Einkaufsmöglichkeiten');
  } else if (context.amenities.shopping.length === 0) {
    negatives.push('Begrenzte Einkaufsmöglichkeiten');
  }
  
  if (context.amenities.transport.length >= 2) {
    positives.push('Gute ÖPNV-Anbindung');
  } else {
    negatives.push('Eingeschränkte ÖPNV-Anbindung');
  }
  
  // Analysiere Umgebung
  if (context.environment.green > 40) {
    positives.push('Grüne, naturnahe Lage');
  }
  if (context.environment.noise < 30) {
    positives.push('Ruhige Wohnlage');
  } else if (context.environment.noise > 70) {
    negatives.push('Erhöhte Lärmbelastung');
  }
  
  // Analysiere Erreichbarkeit
  if (context.accessibility.publicTransport > 70) {
    positives.push('Hervorragende Verkehrsanbindung');
  }
  if (context.accessibility.highway < 2) {
    positives.push('Schnelle Anbindung an Hauptverkehrsstraßen');
  }
  if (context.accessibility.center < 5) {
    positives.push('Zentrale Lage');
  } else if (context.accessibility.center > 15) {
    negatives.push('Außerhalb des Stadtzentrums');
  }
  
  return { positives, negatives };
}