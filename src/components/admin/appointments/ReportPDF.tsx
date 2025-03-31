import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// PDF-Stile basierend auf dem alten Projekt
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 0,
    margin: 0,
    fontFamily: 'Helvetica'
  },
  container: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  letterheadContainer: {
    position: 'absolute',
    width: '100%',
    height: 'auto',
    top: 0,
    left: 0,
    padding: 0
  },
  body: {
    marginLeft: 40,
    marginTop: 140, // Wichtig! Genügend Abstand zum Briefkopf
    width: '80%'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottom: '1px solid #ccc',
    paddingBottom: 5
  },
  patientInfo: {
    marginBottom: 20
  },
  patientRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    fontSize: 10
  },
  value: {
    flex: 1,
    fontSize: 10
  },
  greeting: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 5,
    textDecoration: 'underline'
  },
  content: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 15
  },
  signature: {
    marginTop: 30,
    fontSize: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #ccc',
    paddingTop: 5,
    fontSize: 8,
    color: '#666'
  }
});

interface ReportPDFProps {
  data: {
    title: string;
    patientName: string;
    patientGender: string;
    patientBirthDate: string;
    examinationName: string;
    examinationDate: string;
    indication: string;
    report: string;
    assessment: string;
    doctorName: string;
    isComplete: boolean;
    location?: {
      id: string;
      name: string;
      letterhead_url: string | null;
      use_default_letterhead: boolean;
    };
  };
  defaultLetterheadUrl?: string;
}

// Hilfsfunktion zum Entfernen von HTML-Tags aus Rich-Text
const stripHtml = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n/g, '\n');
};

// Hilfsfunktion für die korrekte Anrede basierend auf Geschlecht
const getFormOfAddress = (gender: string) => {
  if (gender === 'männlich') return 'Sehr geehrter Herr';
  if (gender === 'weiblich') return 'Sehr geehrte Frau';
  return 'Sehr geehrte(r)';
};

const ReportPDF = ({ data, defaultLetterheadUrl = '/default-letterhead.png' }: ReportPDFProps) => {
  // Bestimme, welches Briefpapier verwendet werden soll
  let letterheadUrl = defaultLetterheadUrl;
  
  if (data.location) {
    if (!data.location.use_default_letterhead && data.location.letterhead_url) {
      letterheadUrl = data.location.letterhead_url;
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Briefpapier - wichtig: als erstes Element */}
          <View style={styles.letterheadContainer}>
            <Image src={letterheadUrl} />
          </View>
          
          {/* Hauptinhalt - mit genügend Abstand zum Briefkopf */}
          <View style={styles.body}>
            <Text style={styles.title}>{data.title}</Text>
            
            <View style={styles.patientInfo}>
              <View style={styles.patientRow}>
                <Text style={styles.label}>Patient:</Text>
                <Text style={styles.value}>{data.patientName}</Text>
              </View>
              <View style={styles.patientRow}>
                <Text style={styles.label}>Geschlecht:</Text>
                <Text style={styles.value}>{data.patientGender}</Text>
              </View>
              <View style={styles.patientRow}>
                <Text style={styles.label}>Geburtsdatum:</Text>
                <Text style={styles.value}>{data.patientBirthDate}</Text>
              </View>
              <View style={styles.patientRow}>
                <Text style={styles.label}>Untersuchung:</Text>
                <Text style={styles.value}>{data.examinationName}</Text>
              </View>
              <View style={styles.patientRow}>
                <Text style={styles.label}>Datum:</Text>
                <Text style={styles.value}>{data.examinationDate}</Text>
              </View>
            </View>

            <View style={styles.greeting}>
              <Text>{getFormOfAddress(data.patientGender)} {data.patientName.split(' ').pop()},</Text>
              <Text style={{ fontSize: 10, marginTop: 3 }}>ich berichte über Ihre Untersuchung.</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Indikation</Text>
              <Text style={styles.content}>{stripHtml(data.indication) || 'Keine Angabe'}</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Befund</Text>
              <Text style={styles.content}>{stripHtml(data.report) || 'Befundbericht ausstehend'}</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Beurteilung</Text>
              <Text style={styles.content}>{stripHtml(data.assessment) || 'Beurteilung ausstehend'}</Text>
            </View>

            <View style={styles.signature}>
              <Text>Mit freundlichen Grüßen</Text>
              <Text style={{ marginTop: 20 }}>{data.doctorName}</Text>
              <Text style={{ fontSize: 9 }}>Facharzt für Radiologie</Text>
            </View>
          </View>
          
          {/* Footer am Ende der Seite */}
          <View style={styles.footer} fixed>
            <Text>Befund erstellt am: {data.examinationDate}</Text>
            <Text>Status: {data.isComplete ? 'Befund abgeschlossen' : 'Vorläufiger Befund'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;