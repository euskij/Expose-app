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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#eef5fa',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    marginTop: 18,
    marginBottom: 10,
    borderRadius: 3,
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#dbe5eb',
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
  objectPosition: 'center',
    borderRadius: 4,
  },
  photoWatermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    opacity: 0.25,
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    transformOrigin: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
    userSelect: 'none',
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
  },
});

interface ExposePDFProps {
  data: Record<string, string>;
  photos: string[];
  color?: string;
  logo?: string;
  theme?: 'blue' | 'neutral';
  includeOriginalImages?: boolean;
  showAgentNotices?: boolean;
}

export function ExposePDF({ data, photos, color = '#3498db', logo, theme = 'blue', includeOriginalImages = true, showAgentNotices = true }: ExposePDFProps) {
  const palette = theme === 'neutral' ? {
    primary: '#555555',
    accent: '#2c3e50',
    bgSoft: '#f4f4f4'
  } : {
    primary: '#3498db',
    accent: '#2c3e50',
    bgSoft: '#eef5fa'
  };
  const primaryColor = color || palette.primary;
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
    { label: 'Maklercourtage (%)', value: formatValue(data.maklercourtage) },
    data.verkaufspreis && data.maklercourtage ? {
      label: 'Maklercourtage (EUR)',
      value: ((parseFloat(data.verkaufspreis) * parseFloat(data.maklercourtage) / 100) || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
    } : null,
  ].filter(item => item && item.value !== '-');

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
        {/* Cover Page */}
        <Page size="A4" style={[styles.page, {padding: 0}]}>          
          {/* Optional reduziertes Watermark */}
          {data.watermark_text && (
            <View style={styles.watermarkBackground}>
              <Text style={[styles.watermarkText, {fontSize: 64, opacity: 0.04, left: 80, top: 200}]}> {data.watermark_text} </Text>
              <Text style={[styles.watermarkText, {fontSize: 64, opacity: 0.04, left: 260, top: 420}]}> {data.watermark_text} </Text>
            </View>
          )}
          {/* Titelbild Vollbreite */}
          {photos[(data.titelbildIndex ? Number(data.titelbildIndex) : 0)] && (
            <Image src={photos[(data.titelbildIndex ? Number(data.titelbildIndex) : 0)]} style={{width: '100%', height: '60%', objectFit: 'cover'}} />
          )}
          {/* Overlay Box unten */}
          <View style={{position: 'absolute', bottom: 60, left: 40, right: 40, backgroundColor: '#ffffffee', padding: 20, borderLeftWidth: 6, borderLeftColor: primaryColor, borderRadius: 6}}>
            <Text style={{fontSize: 26, fontWeight: 'bold', color: '#2c3e50', marginBottom: 6}}>{formatValue(data.titel) || 'Immobilien-Exposé'}</Text>
            <Text style={{fontSize: 14, color: '#555'}}>{formatValue(data.adresse)}</Text>
            {(data.kontakt_firma || data.kontakt_name) && (
              <Text style={{fontSize: 10, color: '#777', marginTop: 12}}>
                {(data.kontakt_firma ? data.kontakt_firma + (data.kontakt_name ? ' • ' : '') : '') + (data.kontakt_name || '')}
              </Text>
            )}
          </View>
          {logo && (
            <View style={{position: 'absolute', top: 25, right: 25, backgroundColor: '#ffffffcc', padding: 8, borderRadius: 8}}>
              <Image src={logo} style={{width: 90, height: 36}} />
            </View>
          )}
        </Page>
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
            <Text style={[styles.title, { color: primaryColor }]}>{formatValue(data.titel)}</Text>
            <Text style={styles.address}>{formatValue(data.adresse)}</Text>
          </View>

          {/* Titelbild falls vorhanden */}
          {photos.length > 0 && (
            <View style={{marginBottom: 20, position: 'relative'}}>
              <Image src={photos[(data.titelbildIndex ? Number(data.titelbildIndex) : 0)]} style={{width: '100%', height: 260, objectFit: 'cover', borderRadius: 6}} />
              {logo && (
                <View style={{position: 'absolute', top: 10, right: 10, backgroundColor: '#ffffffcc', padding: 6, borderRadius: 6}}>
                  <Image src={logo} style={{width: 70, height: 28}} />
                </View>
              )}
              {data.watermark_text && (
                <Text style={[styles.photoWatermark, {fontSize: 42}]}> {data.watermark_text} </Text>
              )}
            </View>
          )}

          {/* Eckdaten - nur die wichtigsten */}
          <View style={styles.keyFactsSection}>
            <Text style={[styles.sectionTitle, {marginTop: 8, borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Eckdaten</Text>
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

          {/* Weitere Fotos (ohne erstes Titelbild) */}
          {photos.length > 1 && (
            <View style={styles.imageSection}>
              <Text style={[styles.sectionTitle, {borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Bilder</Text>
              <View style={styles.imageGrid}>
                {photos.slice(1, 7).map((photo, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image src={photo} style={styles.imageWithWatermark} />
                    {logo && (
                      <View style={{position: 'absolute', top: 4, right: 4, backgroundColor: '#ffffffcc', padding: 4, borderRadius: 4}}>
                        <Image src={logo} style={{width: 50, height: 20}} />
                      </View>
                    )}
                    {data.watermark_text && (
                      <Text style={styles.photoWatermark}>
                        {data.watermark_text}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              {/* Originalbilder am Ende der PDF (alle inkl. Titelbild) */}
              {includeOriginalImages && photos.length <= 4 && (
                <View style={{marginTop: 24}}>
                  <Text style={[styles.sectionTitle, {marginTop: 10, borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Originalbilder</Text>
                  {photos.map((photo, idx) => (
                    <View key={idx} style={{marginBottom: 12, position: 'relative'}}>
                      <Image src={photo} style={{width: '100%', height: 320, objectFit: 'contain'}} />
                      {data.watermark_text && (
                        <Text style={[styles.photoWatermark, {fontSize: 36}]}> {data.watermark_text} </Text>
                      )}
                      {logo && (
                        <View style={{position: 'absolute', top: 6, right: 6, backgroundColor: '#ffffffcc', padding: 4, borderRadius: 4}}>
                          <Image src={logo} style={{width: 60, height: 24}} />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
              {logo && (
                <View style={{marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Image src={logo} style={{width: 80, height: 30}} />
                </View>
              )}
            </View>
          )}

          {/* Lage mit Karte */}
          {(data.lage || data.lage_beschreibung) && (
            <View style={styles.locationSection}>
              <Text style={[styles.sectionTitle, {borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Lage</Text>
              <View style={styles.locationContent}>
                <View style={styles.locationText}>
                  <Text style={styles.descriptionText}>
                    {formatValue(data.lage_beschreibung || data.lage)}
                  </Text>
                </View>
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapText}>Karte{'\n'}{formatValue(data.adresse)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Kontaktinformationen Footer (auf Seite) */}
          {(data.kontakt_name || data.kontakt_email || data.kontakt_tel || data.kontakt_firma || data.kontakt_web) && (
            <View style={{marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ccc'}}>
              <Text style={{fontSize: 10, marginBottom: 4}}>Kontakt</Text>
              {data.kontakt_firma ? <Text style={{fontSize: 10}}>{data.kontakt_firma}</Text> : null}
              {data.kontakt_name ? <Text style={{fontSize: 10}}>{data.kontakt_name}</Text> : null}
              {data.kontakt_email ? <Text style={{fontSize: 10}}>E-Mail: {data.kontakt_email}</Text> : null}
              {data.kontakt_tel ? <Text style={{fontSize: 10}}>Tel: {data.kontakt_tel}</Text> : null}
              {data.kontakt_web ? <Text style={{fontSize: 10}}>Web: {data.kontakt_web}</Text> : null}
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
              <Text style={[styles.sectionTitle, {borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Kurzbeschreibung</Text>
              <Text style={styles.descriptionText}>{data.kurzbeschreibung}</Text>
            </View>
          )}

          {data.langbeschreibung && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.sectionTitle, {borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Ausführliche Beschreibung</Text>
              <Text style={styles.descriptionText}>{data.langbeschreibung}</Text>
            </View>
          )}

          {data.ausstattung && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.sectionTitle, {borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Ausstattung</Text>
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
        {includeOriginalImages && photos.length > 4 && (
          <Page size="A4" style={styles.page}>
            <Text style={[styles.sectionTitle, {marginTop: 0, borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Originalbilder</Text>
            {photos.map((photo, idx) => (
              <View key={idx} style={{marginBottom: 14, position: 'relative'}}>
                <Image src={photo} style={{width: '100%', height: 360, objectFit: 'contain'}} />
                {data.watermark_text && (
                  <Text style={[styles.photoWatermark, {fontSize: 42}]}> {data.watermark_text} </Text>
                )}
                {logo && (
                  <View style={{position: 'absolute', top: 8, right: 8, backgroundColor: '#ffffffcc', padding: 6, borderRadius: 6}}>
                    <Image src={logo} style={{width: 70, height: 28}} />
                  </View>
                )}
              </View>
            ))}
          </Page>
        )}
        {/* Disclaimer / Vertraulichkeit */}
        <Page size="A4" style={[styles.page, {fontSize: 9}]}>          
          <Text style={[styles.sectionTitle, {marginTop: 0, borderLeftColor: primaryColor, backgroundColor: palette.bgSoft}]}>Hinweise & Vertraulichkeit</Text>
          <View style={{lineHeight: 1.4, fontSize: 9, color: '#444'}}>
            <Text style={{marginBottom: 6}}>
              Haftungsausschluss: Alle Angaben in diesem Exposé basieren ausschließlich auf Informationen, die uns vom Eigentümer bzw. von Dritten zur Verfügung gestellt wurden. Eine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität dieser Angaben kann nicht übernommen werden. Zwischenverkauf, Irrtum und Auslassungen bleiben ausdrücklich vorbehalten. Dieses Dokument dient ausschließlich der unverbindlichen Vorabinformation und stellt kein vertragliches Angebot dar.
            </Text>
            <Text style={{marginBottom: 6}}>
              Keine Haftung: Für etwaige Fehler oder Abweichungen wird – außer bei Vorsatz oder grober Fahrlässigkeit – keine Haftung übernommen. Verbindliche Grundlagen für einen Erwerb sind ausschließlich ein notarieller Kaufvertrag sowie die darin enthaltenen Regelungen.
            </Text>
            <Text style={{marginBottom: 6}}>
              Vertraulichkeit / Geheimhaltung: Dieses Exposé enthält vertrauliche und geschützte Informationen und ist ausschließlich für den adressierten Empfänger bestimmt. Jede Weitergabe, Vervielfältigung, Veröffentlichung oder sonstige Verwertung – ganz oder in Teilen – ohne unsere vorherige schriftliche Zustimmung ist untersagt. Mit dem Erhalt erklären Sie sich zur strikten Vertraulichkeit und Nichtweitergabe verpflichtet.
            </Text>
            <Text style={{marginBottom: 6}}>
              Nutzung: Der Empfänger verpflichtet sich, die erhaltenen Informationen ausschließlich zur internen Prüfung eines möglichen Erwerbs zu verwenden und sie Dritten nicht zugänglich zu machen. Bei Zuwiderhandlung behalten wir uns rechtliche Schritte sowie ggf. Schadensersatzansprüche vor.
            </Text>
            {showAgentNotices && (
              <>
                <Text style={{marginBottom: 6}}>
                  Maklerrechtlicher Hinweis: Dieses Exposé stellt kein Provisionsangebot an unbeteiligte Dritte dar. Eine Kontaktaufnahme mit dem Eigentümer sowie eigenständige Verhandlungen ohne unsere Einbindung sind untersagt. Die Weitergabe dieses Exposés an Dritte ohne unsere Zustimmung kann eine Provisionspflicht oder Schadensersatzansprüche auslösen.
                </Text>
                <Text style={{marginBottom: 6}}>
                  Widerrufsbelehrung: Sofern der Empfänger Verbraucher ist, gilt das gesetzliche Widerrufsrecht nach §§ 312g, 355 BGB. Ein vorzeitiger Provisionsanspruch entsteht erst mit wirksamem Nachweis oder der Vermittlung und nach Ablauf bzw. Verzicht der Widerrufsfrist.
                </Text>
                <Text style={{marginBottom: 6}}>
                  Energieangaben / Gesetzliche Pflichten: Angaben zum Energieausweis basieren auf den vorliegenden Dokumenten des Eigentümers. Sollten Pflichtangaben gem. GEG (vormals EnEV) fehlen, werden diese nachgereicht, sobald verfügbar.
                </Text>
              </>
            )}
            <Text style={{marginTop: 12, fontSize: 8, color: '#666'}}>
              © {new Date().getFullYear()} – Vertrauliches Immobilienexposé. Alle Rechte vorbehalten.
            </Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}