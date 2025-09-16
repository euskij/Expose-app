// Mock implementation für Energieausweis-Parser
export interface EnergieausweisData {
  type: "Verbrauchsausweis" | "Bedarfsausweis";
  validUntil: string;
  energyDemand?: number;
  energyConsumption?: number;
  primaryEnergyDemand?: number;
  energyEfficiencyClass: string;
  heatingType: string;
  energySources: string[];
  buildingType: string;
  constructionYear: string;
  isResidential: boolean;
}

export async function parseEnergieausweis(file: File): Promise<EnergieausweisData> {
  // Mock implementation für Tests
  console.log("Parsing file:", file.name);
  return {
    type: "Verbrauchsausweis",
    validUntil: "2034-12-31",
    energyConsumption: 120,
    energyEfficiencyClass: "C",
    heatingType: "Gas-Brennwert",
    energySources: ["Erdgas"],
    buildingType: "Wohngebäude",
    constructionYear: "2010",
    isResidential: true
  };
}
