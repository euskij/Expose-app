export interface ImmobilienData {
  titel: string;
  adresse: string;
  lage: string;
  baujahr: string;
  heizungsart: string;
  wohnflaeche: string;
  grundstuecksflaeche: string;
  ist_miete: string;
  soll_miete: string;
  verkaufspreis: string;
  faktor: string;
  maklercourtage: string;
  kontakt_name: string;
  kontakt_tel: string;
  kontakt_mail: string;
  zimmer?: string;
  etage?: string;
  etagenanzahl?: string;
  gewerbeflaeche?: string;
  letzte_sanierung?: string;
}

export interface OptimSettings {
  maxWidth: number;
  maxHeight: number;
  contrastStrength: number;
  sharpen: boolean;
  brightness: number;
}