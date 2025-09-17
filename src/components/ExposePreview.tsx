import React from 'react';
import type { ImmobilienData } from '../types';

interface ExposePreviewProps {
  data: ImmobilienData;
  photos: string[];
  logo: string | null;
  theme: 'blue' | 'neutral';
  includeOriginalImages: boolean; // aktuell nicht direkt genutzt, aber Pipeline-kompatibel
  showAgentNotices: boolean;
}

// Hilfsfunktionen aus Modal extrahieren (bei Bedarf vereinfachen)
const formatPrice = (value?: string) => {
  if (!value) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
};

// Tabellen-Render-Logik replizieren: hier minimal generisch, damit wir keinen doppelten Code für die drei Gruppen brauchen.
type TableRow = { label: string; value: string | number | undefined | null };

interface TableConfig {
  title: string;
  icon: string;
  rows: TableRow[];
}

const filterRows = (rows: TableRow[]) => rows.filter(r => r.value !== undefined && r.value !== null && r.value !== '' && r.value !== '0');

const TableBlock: React.FC<TableConfig> = ({ title, icon, rows }) => {
  const visible = filterRows(rows);
  if (!visible.length) return null;
  return (
    <div className="expose-section">
      <h3>{icon} {title}</h3>
      <div className="data-table-wrapper">
        <table className="data-table">
          <tbody>
            {visible.map((row, i) => (
              <tr key={i}>
                <th>{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExposePreview: React.FC<ExposePreviewProps> = ({ data, photos, logo, theme, includeOriginalImages, showAgentNotices }) => {
  // Aufbereitung der Tabellen-Daten analog Modal
  const technicalRows: TableRow[] = [
    { label: 'Objekttyp', value: data.objektTyp },
    { label: 'Wohnfläche (m²)', value: data.wohnflaeche },
    { label: 'Grundstück (m²)', value: data.grundstuecksflaeche },
    { label: 'Zimmer', value: data.zimmer },
    { label: 'Badezimmer', value: data.badezimmer },
    { label: 'Balkone', value: data.balkone },
    { label: 'Garagen', value: data.anzahl_garagen },
    { label: 'Stellplätze', value: data.anzahl_stellplaetze },
    { label: 'Garage/Stellplatz', value: data.garage === 'ja' ? 'Vorhanden' : (data.garage === 'nein' ? 'Nein' : '') },
    { label: 'Keller', value: data.keller === 'ja' ? 'Vorhanden' : (data.keller === 'nein' ? 'Nein' : '') },
    { label: 'Anzahl Wohnungen', value: data.anzahl_wohnungen },
    { label: 'Gewerbeeinheiten', value: data.anzahl_gewerbeeinheiten },
    { label: 'Leerstand Whg.', value: data.leerstehende_wohnungen },
    { label: 'Leerstand Gewerbe', value: data.leerstehende_gewerbe },
    { label: 'm² Leerstand Whg.', value: data.qm_leerstand_wohnungen },
    { label: 'm² Leerstand Gew.', value: data.qm_leerstand_gewerbe }
  ];

  const energyRows: TableRow[] = [
    { label: 'Baujahr', value: data.baujahr },
    { label: 'Heizungsart', value: data.heizungsart },
    { label: 'Bauzustand', value: data.bauzustand },
    { label: 'Energieträger', value: data.energietraeger },
    { label: 'Energieausweis', value: data.energieausweis_art },
    { label: 'Energiebedarf', value: data.energiebedarf ? `${data.energiebedarf} kWh/(m²·a)` : '' },
    { label: 'Energieeffizienzkl.', value: data.energieeffizienzklasse }
  ];

  const commissionEUR = data.verkaufspreis && data.maklercourtage
    ? (parseFloat(data.verkaufspreis) * (parseFloat(data.maklercourtage) / 100))
    : undefined;

  const financialRows: TableRow[] = [
    { label: 'Kaufpreis', value: data.verkaufspreis ? formatPrice(data.verkaufspreis) : '' },
    { label: 'IST-Miete (Monat)', value: data.ist_miete ? formatPrice(data.ist_miete) : '' },
    { label: 'SOLL-Miete (Monat)', value: data.soll_miete ? formatPrice(data.soll_miete) : '' },
    { label: 'Hausgeld/BK (Monat)', value: data.betriebskosten_hausgeld ? formatPrice(data.betriebskosten_hausgeld) : '' },
    { label: 'Maklercourtage (%)', value: data.maklercourtage },
    { label: 'Maklercourtage (EUR)', value: commissionEUR ? commissionEUR.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '' },
    { label: 'IST-Faktor', value: data.ist_faktor },
    { label: 'SOLL-Faktor', value: data.soll_faktor },
    { label: 'Bruttomietrendite', value: data.verkaufspreis && data.ist_miete ? `${((parseFloat(data.ist_miete) * 12 / parseFloat(data.verkaufspreis)) * 100).toFixed(2)} %` : '' },
    { label: 'Preis/m²', value: data.verkaufspreis && data.wohnflaeche ? `${(parseFloat(data.verkaufspreis) / parseFloat(data.wohnflaeche)).toFixed(0)} €/m²` : '' }
  ];

  return (
    <div className={`expose-preview theme-${theme}`}>
      {/* Header */}
      <div className="expose-header">
        <h1 className="expose-title">{data.titel || 'Immobilien-Exposé'}</h1>
        <div className="expose-address">{data.adresse}</div>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="expose-section">
          <h3>📸 Bilder</h3>
          <div className="expose-photos">
            <div className="main-photo photo-container" style={{ position: 'relative' }}>
              <img src={photos[data.titelbildIndex ? Number(data.titelbildIndex) : 0]} alt="Hauptfoto" style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }} />
              {logo && (
                <img src={logo} alt="Logo" style={{ position: 'absolute', top: 8, right: 8, width: 48, height: 24, objectFit: 'contain', background: '#fff', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
              )}
              {data.watermark_text && (
                <>
                  <div className="photo-watermark">{data.watermark_text}</div>
                  <div className="photo-watermark-1">{data.watermark_text}</div>
                  <div className="photo-watermark-2">{data.watermark_text}</div>
                  <div className="photo-watermark-3">{data.watermark_text}</div>
                  <div className="photo-watermark-4">{data.watermark_text}</div>
                </>
              )}
            </div>
            {photos.slice(1, 5).length > 0 && (
              <div className="thumbnail-photos">
                {photos.slice(1, 5).map((photo, index) => (
                  <div key={index} className="thumbnail-container photo-container" style={{ position: 'relative' }}>
                    <img src={photo} alt={`Foto ${index + 2}`} style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }} />
                    {logo && (
                      <img src={logo} alt="Logo" style={{ position: 'absolute', top: 6, right: 6, width: 32, height: 16, objectFit: 'contain', background: '#fff', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
                    )}
                    {data.watermark_text && (
                      <>
                        <div className="photo-watermark">{data.watermark_text}</div>
                        <div className="photo-watermark-1">{data.watermark_text}</div>
                        <div className="photo-watermark-2">{data.watermark_text}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Facts */}
      <div className="expose-section">
        <h3>📊 Eckdaten</h3>
        <div className="key-facts-highlight">
          <div className="key-fact">
            <div className="key-fact-value">{formatPrice(data.verkaufspreis) || '-'}</div>
            <div className="key-fact-label">Kaufpreis</div>
          </div>
          <div className="key-fact">
            <div className="key-fact-value">{data.wohnflaeche ? `${data.wohnflaeche}m²` : '-'}</div>
            <div className="key-fact-label">Wohnfläche</div>
          </div>
            <div className="key-fact">
              <div className="key-fact-value">{data.baujahr || '-'}</div>
              <div className="key-fact-label">Baujahr</div>
            </div>
        </div>
      </div>

      {/* Lage */}
      {(data.lage || data.lage_beschreibung) && (
        <div className="expose-section">
          <h3>📍 Lage</h3>
          <div className="location-content">
            <div className="location-text">
              <p>{data.lage_beschreibung || data.lage}</p>
            </div>
            <div className="location-map">
              <div className="map-placeholder">📍<br/>Karte<br/><small>{data.adresse}</small></div>
            </div>
          </div>
        </div>
      )}

      {/* Tabellen */}
      <TableBlock title="Objektdaten" icon="🏠" rows={technicalRows} />
      <TableBlock title="Energie & Ausstattung" icon="⚡" rows={energyRows} />
      <TableBlock title="Finanzielle Daten" icon="💰" rows={financialRows} />

      {/* Texte */}
      {data.kurzbeschreibung && (
        <div className="expose-section">
          <h3>📝 Kurzbeschreibung</h3>
          <div className="description-text">
            <p>{data.kurzbeschreibung}</p>
          </div>
        </div>
      )}
      {data.langbeschreibung && (
        <div className="expose-section">
          <h3>📋 Ausführliche Beschreibung</h3>
          <div className="description-text">
            <p>{data.langbeschreibung}</p>
          </div>
        </div>
      )}
      {data.ausstattung && (
        <div className="expose-section">
          <h3>⚙️ Ausstattung</h3>
          <div className="description-text">
            {data.ausstattung.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>
      )}

      {(data.kontakt_name || data.kontakt_email || data.kontakt_tel || data.kontakt_firma || data.kontakt_web) && (
        <div className="expose-section">
          <h3>📞 Kontakt</h3>
          <div className="contact-block">
            {data.kontakt_firma && <p><strong>{data.kontakt_firma}</strong></p>}
            {data.kontakt_name && <p>{data.kontakt_name}</p>}
            {data.kontakt_email && <p>E-Mail: <a href={`mailto:${data.kontakt_email}`}>{data.kontakt_email}</a></p>}
            {data.kontakt_tel && <p>Tel: {data.kontakt_tel}</p>}
            {data.kontakt_web && <p>Web: {data.kontakt_web}</p>}
          </div>
        </div>
      )}

      <div className="expose-section" style={{ fontSize: '0.65rem', lineHeight: 1.3, color: '#555' }}>
        <h3 style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Hinweise & Vertraulichkeit</h3>
        <p><strong>Haftungsausschluss:</strong> Alle Angaben ohne Gewähr, basierend auf Informationen des Eigentümers oder Dritter. Irrtum und Zwischenverkauf vorbehalten.</p>
        <p><strong>Keine Haftung:</strong> Für Fehler oder Abweichungen wird – außer bei Vorsatz oder grober Fahrlässigkeit – keine Haftung übernommen.</p>
        <p><strong>Vertraulichkeit:</strong> Dieses Exposé ist vertraulich und nur für den Empfänger bestimmt. Jede Weitergabe, Vervielfältigung oder Veröffentlichung – ganz oder teilweise – ohne vorherige Zustimmung ist untersagt.</p>
        <p><strong>Verwendung:</strong> Nutzung ausschließlich zur internen Prüfung eines möglichen Erwerbs. Bei Verstoß behalten wir uns rechtliche Schritte vor.</p>
        {showAgentNotices && (
          <>
            <p><strong>Maklerhinweis:</strong> Keine direkte Kontaktaufnahme mit dem Eigentümer ohne unsere Zustimmung. Weitergabe kann zu Provisions- oder Schadensersatzansprüchen führen.</p>
            <p><strong>Widerruf:</strong> Verbraucher haben ein Widerrufsrecht nach §§ 312g, 355 BGB. Provisionsanspruch erst nach wirksamer Leistung & Ablauf/Verzicht.</p>
            <p><strong>Energieangaben:</strong> Energieausweis-Daten beruhen auf Eigentümerangaben; fehlende Pflichtfelder werden nachgereicht.</p>
          </>
        )}
        <p style={{ marginTop: '6px', fontSize: '0.6rem', color: '#777' }}>© {new Date().getFullYear()} – Vertrauliches Immobilienexposé. Alle Rechte vorbehalten.</p>
      </div>

      {data.watermark_text && (
        <div className="expose-watermark">
          <small>{data.watermark_text}</small>
        </div>
      )}
    </div>
  );
};

export default ExposePreview;
