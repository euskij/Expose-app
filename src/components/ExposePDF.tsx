import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  image: {
    width: '48%',
    height: 200,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
  },
});

interface ExposePDFProps {
  data: Record<string, string>;
  photos: string[];
  color: string;
}

export function ExposePDF({ data, photos, color }: ExposePDFProps) {
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={[styles.title, { color }]}>{data.titel}</Text>
            <Text style={styles.text}>{data.adresse}</Text>
          </View>

          <View style={styles.imageGrid}>
            {photos.map((photo, index) => (
              <Image key={index} src={photo} style={styles.image} />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.text}>Lage: {data.lage}</Text>
            <Text style={styles.text}>Baujahr: {data.baujahr}</Text>
            <Text style={styles.text}>Wohnfläche: {data.wohnflaeche}</Text>
            <Text style={styles.text}>Grundstücksfläche: {data.grundstuecksflaeche}</Text>
            <Text style={styles.text}>Verkaufspreis: {data.verkaufspreis}</Text>
          </View>

          <View style={styles.footer}>
            <Text>Kontakt: {data.kontakt_name} - Tel: {data.kontakt_tel} - Email: {data.kontakt_mail}</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}