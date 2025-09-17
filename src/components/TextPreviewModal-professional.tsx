import React from 'react';

interface TextPreviewModalProps {
  data: any;
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const TextPreviewModal: React.FC<TextPreviewModalProps> = ({ 
  data, 
  photos, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  // Funktion zum Prüfen ob ein Feld leer/null ist
  const isFieldEmpty = (value: string): boolean => {
    return !value || value === '0' || value === '-' || value.trim() === '';
  };

  // Funktion zum Formatieren von Preisen
  const formatPrice = (price: string) => {
    if (isFieldEmpty(price)) return null;
    const numValue = parseFloat(price.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(numValue)) return price;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Funktion zum Anzeigen eines Feldes nur wenn es nicht leer ist
  const renderField = (label: string, value: string, formatter?: (v: string) => string | null) => {
    const formattedValue = formatter ? formatter(value) : value;
    if (isFieldEmpty(value) || formattedValue === null) return null;
    
    return (
      <div className="table-row">
        <div className="table-label">{label}:</div>
        <div className="table-value">{formattedValue}</div>
      </div>
    );
  };

  // Gruppiere Daten nach Kategorien
  const technicalData = [
    { label: 'Objekttyp', value: data.objektTyp },
    { label: 'Zimmer', value: data.zimmer },
    { label: 'Badezimmer', value: data.badezimmer },
    { label: 'Balkone', value: data.balkone },
    { label: 'Grundstücksfläche', value: data.grundstuecksflaeche, formatter: (v: string) => `${v}m²` },
    { label: 'Garagen', value: data.anzahl_garagen },
    { label: 'Stellplätze', value: data.anzahl_stellplaetze },
    { label: 'Keller', value: data.keller },
  ].filter(item => !isFieldEmpty(item.value));

  const energyData = [
    { label: 'Heizungsart', value: data.heizungsart },
    { label: 'Energieträger', value: data.energietraeger },
    { label: 'Bauzustand', value: data.bauzustand },
  ].filter(item => !isFieldEmpty(item.value));

  const financialData = [
    { label: 'IST-Miete/Jahr', value: data.ist_miete, formatter: formatPrice },
    { label: 'SOLL-Miete/Jahr', value: data.soll_miete, formatter: formatPrice },
    { label: 'IST-Faktor', value: data.ist_faktor },
    { label: 'SOLL-Faktor', value: data.soll_faktor },
    { label: 'Betriebskosten', value: data.betriebskosten_hausgeld, formatter: formatPrice },
    { label: 'Maklercourtage', value: data.maklercourtage, formatter: formatPrice },
  ].filter(item => !isFieldEmpty(item.value));

  const renderTable = (tableData: Array<{label: string, value: string, formatter?: (v: string) => string | null}>, title: string, icon: string) => {
    if (tableData.length === 0) return null;
    
    return (
      <div className="expose-section">
        <h3>{icon} {title}</h3>
        <div className="data-table">
          {tableData.map((item, index) => 
            renderField(item.label, item.value, item.formatter)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content expose-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📄 Exposé-Vorschau</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="expose-preview">
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
                  <div className="main-photo photo-container">
                    <img src={photos[0]} alt="Hauptfoto" />
                    {data.watermark_text && (
                      <div className="photo-watermark">
                        {data.watermark_text}
                      </div>
                    )}
                  </div>
                  {photos.slice(1, 5).length > 0 && (
                    <div className="thumbnail-photos">
                      {photos.slice(1, 5).map((photo, index) => (
                        <div key={index} className="thumbnail-container photo-container">
                          <img src={photo} alt={`Foto ${index + 2}`} />
                          {data.watermark_text && (
                            <div className="photo-watermark">
                              {data.watermark_text}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Facts - nur die wichtigsten */}
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

            {/* Lage mit Karte */}
            {(data.lage || data.lage_beschreibung) && (
              <div className="expose-section">
                <h3>📍 Lage</h3>
                <div className="location-content">
                  <div className="location-text">
                    <p>{data.lage_beschreibung || data.lage}</p>
                  </div>
                  <div className="location-map">
                    <div className="map-placeholder">
                      📍<br/>
                      Karte<br/>
                      <small>{data.adresse}</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Objektdaten Tabelle */}
            {renderTable(technicalData, 'Objektdaten', '🏠')}

            {/* Energie & Ausstattung Tabelle */}
            {renderTable(energyData, 'Energie & Ausstattung', '⚡')}

            {/* Finanzielle Daten Tabelle */}
            {renderTable(financialData, 'Finanzielle Daten', '💰')}

            {/* Beschreibungen */}
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
                  {data.ausstattung.split('\n').map((line: string, index: number) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Watermark */}
            {data.watermark_text && (
              <div className="expose-watermark">
                <small>{data.watermark_text}</small>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};