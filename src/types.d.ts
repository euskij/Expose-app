export interface ImmobilienData {
  [key: string]: string | undefined;
  objektTyp?: string;
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
  ist_faktor: string;
  soll_faktor: string;
  maklercourtage: string;
  kontakt_name: string;
  kontakt_tel: string;
  kontakt_email: string;
  kontakt_firma?: string;
  kontakt_web?: string;
  zimmer?: string;
  badezimmer?: string;
  balkone?: string;
  anzahl_garagen?: string;
  anzahl_stellplaetze?: string;
  garage?: string;
  keller?: string;
  anzahl_wohnungen?: string;
  anzahl_gewerbeeinheiten?: string;
  leerstehende_wohnungen?: string;
  leerstehende_gewerbe?: string;
  qm_leerstand_wohnungen?: string;
  qm_leerstand_gewerbe?: string;
  betriebskosten_hausgeld?: string;
  watermark_text?: string;
  energietraeger?: string;
  bauzustand?: string;
  kurzbeschreibung?: string;
  langbeschreibung?: string;
  ausstattung?: string;
  lage_beschreibung?: string;
  energieausweis_art?: string;
  energiebedarf?: string;
  energieeffizienzklasse?: string;
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