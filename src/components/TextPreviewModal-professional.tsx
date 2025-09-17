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
  const handleDownloadPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { saveAs } = await import('file-saver');
      const { Document, Page, Text, View, StyleSheet, Image } = await import('@react-pdf/renderer');
      
      // Professionelle PDF-Styles basierend auf der Vorschau
      const styles = StyleSheet.create({
        page: { 
          padding: 40, 
          fontSize: 11, 
          fontFamily: 'Helvetica',
          backgroundColor: '#ffffff'
        },
        header: {
          marginBottom: 30,
          borderBottomWidth: 2,
          borderBottomColor: '#2c3e50',
          borderBottomStyle: 'solid',
          paddingBottom: 20
        },
        title: { 
          fontSize: 24, 
          fontFamily: 'Helvetica-Bold',
          color: '#2c3e50',
          marginBottom: 8
        },
        address: {
          fontSize: 14,
          color: '#555555',
          fontFamily: 'Helvetica-Oblique'
        },
        section: { 
          marginBottom: 25 
        },
        sectionTitle: {
          fontSize: 16,
          fontFamily: 'Helvetica-Bold',
          color: '#2c3e50',
          marginBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e9ecef',
          borderBottomStyle: 'solid',
          paddingBottom: 5
        },
        keyFactsContainer: {
          backgroundColor: '#f8f9fa',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20
        },
        keyFactsTitle: {
          fontSize: 14,
          fontFamily: 'Helvetica-Bold',
          color: '#2c3e50',
          marginBottom: 10
        },
        keyFactsGrid: {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap'
        },
        keyFact: {
          width: '33.33%',
          marginBottom: 8
        },
        keyFactLabel: {
          fontSize: 9,
          color: '#666666',
          marginBottom: 2
        },
        keyFactValue: {
          fontSize: 12,
          fontFamily: 'Helvetica-Bold',
          color: '#2c3e50'
        },
        tableRow: {
          display: 'flex',
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: '#e9ecef',
          borderBottomStyle: 'solid',
          paddingVertical: 6
        },
        tableLabel: {
          width: '40%',
          fontSize: 10,
          color: '#666666',
          fontFamily: 'Helvetica-Bold'
        },
        tableValue: {
          width: '60%',
          fontSize: 10,
          color: '#2c3e50'
        },
        description: {
          fontSize: 10,
          lineHeight: 1.5,
          color: '#2c3e50',
          marginBottom: 8
        },
        imageSection: {
          marginTop: 20
        },
        imageGrid: {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 10
        },
        image: {
          width: 120,
          height: 90,
          marginRight: 10,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#e9ecef',
          borderStyle: 'solid'
        },
        watermark: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-45deg)',
          opacity: 0.05,
          fontSize: 48,
          color: '#ffffff',
          fontFamily: 'Helvetica-Bold',
          zIndex: -1
        }
      });

      // Formatierung-Funktionen
      const formatPrice = (price: string) => {
        if (!price || price === '0' || price === '-') return null;
        const numValue = parseFloat(price.replace(/[^\d,.-]/g, '').replace(',', '.'));
        if (isNaN(numValue)) return price;
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(numValue);
      };

      const isFieldEmpty = (value: string) => {
        return !value || value === '0' || value === '-' || value.trim() === '';
      };

      // Key Facts (nur die wichtigsten 3)
      const keyFacts = [
        { label: 'Kaufpreis', value: formatPrice(data.verkaufspreis) },
        { label: 'Wohnfläche', value: data.wohnflaeche ? `${data.wohnflaeche} m²` : null },
        { label: 'Baujahr', value: data.baujahr }
      ].filter(fact => fact.value);

      // Alle anderen Daten für Tabelle
      const tableData = [
        { label: 'Objekttyp', value: data.objektTyp },
        { label: 'Zimmer', value: data.zimmer },
        { label: 'Badezimmer', value: data.badezimmer },
        { label: 'Grundstücksfläche', value: data.grundstuecksflaeche ? `${data.grundstuecksflaeche} m²` : '' },
        { label: 'Heizungsart', value: data.heizungsart },
        { label: 'Energieträger', value: data.energietraeger },
        { label: 'Bauzustand', value: data.bauzustand },
        { label: 'Balkone', value: data.balkone },
        { label: 'Garage', value: data.garage },
        { label: 'Keller', value: data.keller },
        { label: 'Maklercourtage', value: data.maklercourtage }
      ].filter(item => !isFieldEmpty(item.value));

      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Watermark Background */}
            {data.watermark_text && (
              <View style={styles.watermark}>
                <Text>{data.watermark_text}</Text>
              </View>
            )}

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{data.titel || 'Immobilien-Exposé'}</Text>
              <Text style={styles.address}>{data.adresse}</Text>
            </View>

            {/* Key Facts */}
            {keyFacts.length > 0 && (
              <View style={styles.keyFactsContainer}>
                <Text style={styles.keyFactsTitle}>🔑 Eckdaten</Text>
                <View style={styles.keyFactsGrid}>
                  {keyFacts.map((fact, index) => (
                    <View key={index} style={styles.keyFact}>
                      <Text style={styles.keyFactLabel}>{fact.label}</Text>
                      <Text style={styles.keyFactValue}>{fact.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Beschreibung */}
            {data.kurzbeschreibung && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Beschreibung</Text>
                <Text style={styles.description}>{data.kurzbeschreibung}</Text>
              </View>
            )}

            {/* Detaildaten */}
            {tableData.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Detaildaten</Text>
                {tableData.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableLabel}>{row.label}:</Text>
                    <Text style={styles.tableValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Ausstattung */}
            {data.ausstattung && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Ausstattung</Text>
                <Text style={styles.description}>{data.ausstattung}</Text>
              </View>
            )}

            {/* Lage */}
            {data.lage_beschreibung && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Lage</Text>
                <Text style={styles.description}>{data.lage_beschreibung}</Text>
              </View>
            )}

            {/* Bilder */}
            {photos.length > 0 && (
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>📸 Bilder</Text>
                <View style={styles.imageGrid}>
                  {photos.slice(0, 6).map((photo, index) => (
                    <Image key={index} src={photo} style={styles.image} />
                  ))}
                </View>
              </View>
            )}
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      saveAs(blob, `Expose_${data.adresse || 'Immobilie'}.pdf`);
    } catch (error) {
      console.error('PDF-Generation fehlgeschlagen:', error);
      alert('PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.');
    }
  };
  
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
                      <>
                        <div className="photo-watermark">
                          {data.watermark_text}
                        </div>
                        <div className="photo-watermark-1">
                          {data.watermark_text}
                        </div>
                        <div className="photo-watermark-2">
                          {data.watermark_text}
                        </div>
                        <div className="photo-watermark-3">
                          {data.watermark_text}
                        </div>
                        <div className="photo-watermark-4">
                          {data.watermark_text}
                        </div>
                      </>
                    )}
                  </div>
                  {photos.slice(1, 5).length > 0 && (
                    <div className="thumbnail-photos">
                      {photos.slice(1, 5).map((photo, index) => (
                        <div key={index} className="thumbnail-container photo-container">
                          <img src={photo} alt={`Foto ${index + 2}`} />
                          {data.watermark_text && (
                            <>
                              <div className="photo-watermark">
                                {data.watermark_text}
                              </div>
                              <div className="photo-watermark-1">
                                {data.watermark_text}
                              </div>
                              <div className="photo-watermark-2">
                                {data.watermark_text}
                              </div>
                            </>
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
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            📄 PDF erzeugen & herunterladen
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};