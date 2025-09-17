import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  address: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  
  // Eckdaten-Sektion
  keyFactsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  keyFactsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  keyFact: {
    alignItems: 'center',
    flex: 1,
  },
  keyFactValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  keyFactLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Tabellen-Styles
  table: {
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingVertical: 8,
  },
  tableRowHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  tableCellLabel: {
    width: '40%',
    paddingRight: 15,
    fontSize: 11,
    color: '#34495e',
    fontWeight: 'bold',
  },
  tableCellValue: {
    width: '60%',
    fontSize: 11,
    color: '#2c3e50',
  },
  
  // Foto-Grid
  imageSection: {
    marginBottom: 25,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  image: {
    width: '48%',
    height: 180,
    objectFit: 'cover',
    borderRadius: 4,
  },
  
  // Lage mit Karte
  locationSection: {
    marginBottom: 25,
  },
  locationContent: {
    flexDirection: 'row',
    gap: 15,
  },
  locationText: {
    flex: 1,
  },
  mapPlaceholder: {
    width: 150,
    height: 120,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  mapText: {
    fontSize: 10,
    color: '#95a5a6',
    textAlign: 'center',
  },
  
  // Beschreibungen
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#2c3e50',
    textAlign: 'justify',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  footerText: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  watermark: {
    fontSize: 8,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 5,
  },
  
  // Watermark Hintergrund
  watermarkBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
  watermarkText: {
  position: 'absolute',
  fontSize: 48,
  color: '#ffffff',
  fontWeight: 'bold',
  opacity: 0.05,
  transform: 'rotate(-45deg)',
  transformOrigin: 'center',
  userSelect: 'none',
  pointerEvents: 'none',
  },
  
  // Foto mit Watermark
  imageContainer: {
    position: 'relative',
    width: '48%',
    height: 180,
    marginBottom: 10,
  },
  imageWithWatermark: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 4,
  },
  photoWatermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    opacity: 0.4,
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    transformOrigin: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
    userSelect: 'none',
    pointerEvents: 'none',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '8px 16px',
    borderRadius: 4,
  },
});

interface ExposePDFProps {
  data: Record<string, string>;
  photos: string[];
  color?: string;
}

export function ExposePDF({ data, photos, color = '#3498db' }: ExposePDFProps) {
  // Hilfsfunktion um leere Werte zu filtern
  const formatValue = (value: string) => {
    if (!value || value === '0' || value === '-' || value.trim() === '') {
      return '-';
    }
    return value;
  };

  // Formatiere Preis
  const formatPrice = (price: string) => {
    const numValue = parseFloat(price.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(numValue)) return formatValue(price);
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Gruppiere Daten nach Kategorien
  const technicalData = [
    { label: 'Objekttyp', value: formatValue(data.objektTyp) },
    { label: 'Zimmer', value: formatValue(data.zimmer) },
    { label: 'Badezimmer', value: formatValue(data.badezimmer) },
    { label: 'Balkone', value: formatValue(data.balkone) },
    { label: 'Grundstücksfläche', value: formatValue(data.grundstuecksflaeche) },
    { label: 'Garagen', value: formatValue(data.anzahl_garagen) },
    { label: 'Stellplätze', value: formatValue(data.anzahl_stellplaetze) },
    { label: 'Keller', value: formatValue(data.keller) },
  ].filter(item => item.value !== '-');

  const energyData = [
    { label: 'Heizungsart', value: formatValue(data.heizungsart) },
    { label: 'Energieträger', value: formatValue(data.energietraeger) },
    { label: 'Bauzustand', value: formatValue(data.bauzustand) },
  ].filter(item => item.value !== '-');

  const financialData = [
    { label: 'IST-Miete/Jahr', value: formatValue(data.ist_miete) },
    { label: 'SOLL-Miete/Jahr', value: formatValue(data.soll_miete) },
    { label: 'IST-Faktor', value: formatValue(data.ist_faktor) },
    { label: 'SOLL-Faktor', value: formatValue(data.soll_faktor) },
    { label: 'Betriebskosten', value: formatValue(data.betriebskosten_hausgeld) },
    { label: 'Maklercourtage', value: formatValue(data.maklercourtage) },
  ].filter(item => item.value !== '-');

  const renderTable = (tableData: Array<{label: string, value: string}>, title: string) => {
    if (tableData.length === 0) return null;
    
    return (
      <View style={styles.table}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {tableData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCellLabel}>{item.label}:</Text>
            <Text style={styles.tableCellValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Generiere Watermark-Positionen für Hintergrund
  const generateWatermarkPositions = () => {
    const positions = [];
    const watermarkText = data.watermark_text || 'EXPOSÉ';
    
    // Erstelle ein Raster von Watermarks über die ganze Seite
    for (let x = 0; x < 600; x += 200) {
      for (let y = 0; y < 800; y += 150) {
        positions.push({
          text: watermarkText,
          left: x,
          top: y,
        });
      }
    }
    return positions;
  };

  const watermarkPositions = generateWatermarkPositions();

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Watermark Hintergrund */}
          {data.watermark_text && (
            <View style={styles.watermarkBackground}>
              {watermarkPositions.map((pos, index) => (
                <Text
                  key={index}
                  style={[
                    styles.watermarkText,
                    {
                      left: pos.left,
                      top: pos.top,
                    }
                  ]}
                >
                  {pos.text}
                </Text>
              ))}
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color }]}>{formatValue(data.titel)}</Text>
            <Text style={styles.address}>{formatValue(data.adresse)}</Text>
          </View>

          {/* Eckdaten - nur die wichtigsten */}
          <View style={styles.keyFactsSection}>
            <Text style={styles.sectionTitle}>Eckdaten</Text>
            <View style={styles.keyFactsGrid}>
              <View style={styles.keyFact}>
                <Text style={styles.keyFactValue}>{formatPrice(data.verkaufspreis)}</Text>
                <Text style={styles.keyFactLabel}>Kaufpreis</Text>
              </View>
              <View style={styles.keyFact}>
                <Text style={styles.keyFactValue}>{formatValue(data.wohnflaeche)}</Text>
                <Text style={styles.keyFactLabel}>Wohnfläche</Text>
              </View>
              <View style={styles.keyFact}>
                <Text style={styles.keyFactValue}>{formatValue(data.baujahr)}</Text>
                <Text style={styles.keyFactLabel}>Baujahr</Text>
              </View>
            </View>
          </View>

          {/* Fotos */}
          {photos.length > 0 && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Bilder</Text>
              <View style={styles.imageGrid}>
                {photos.slice(0, 6).map((photo, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image src={photo} style={styles.imageWithWatermark} />
                    {data.watermark_text && (
                      <Text style={styles.photoWatermark}>
                        {data.watermark_text}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Lage mit Karte */}
          {(data.lage || data.lage_beschreibung) && (
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>Lage</Text>
              <View style={styles.locationContent}>
                <View style={styles.locationText}>
                  <Text style={styles.descriptionText}>
                    {formatValue(data.lage_beschreibung || data.lage)}
                  </Text>
                </View>
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapText}>📍{'\n'}Karte{'\n'}{formatValue(data.adresse)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Technische Daten Tabelle */}
          {renderTable(technicalData, 'Objektdaten')}

          {/* Energie & Ausstattung Tabelle */}
          {renderTable(energyData, 'Energie & Ausstattung')}

          {/* Finanzielle Daten Tabelle */}
          {renderTable(financialData, 'Finanzielle Daten')}

          {/* Beschreibungen */}
          {data.kurzbeschreibung && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Kurzbeschreibung</Text>
              <Text style={styles.descriptionText}>{data.kurzbeschreibung}</Text>
            </View>
          )}

          {data.langbeschreibung && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Ausführliche Beschreibung</Text>
              <Text style={styles.descriptionText}>{data.langbeschreibung}</Text>
            </View>
          )}

          {data.ausstattung && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Ausstattung</Text>
              <Text style={styles.descriptionText}>{data.ausstattung}</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Professionelles Immobilien-Exposé
            </Text>
            {data.watermark_text && (
              <Text style={styles.watermark}>{data.watermark_text}</Text>
            )}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}