import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  signatureLine: {
    borderTop: '1px solid black',
    width: '40%',
    marginTop: 30,
  },
  signatureText: {
    fontSize: 8,
    color: '#666666',
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  dateLine: {
    borderTop: '1px solid black',
    width: '40%',
  },
  dateText: {
    fontSize: 8,
    color: '#666666',
    marginTop: 4,
  }
});

const Signature = () => (
  <View style={styles.container}>
    <View style={styles.dateContainer}>
      <View>
        <View style={styles.dateLine} />
        <Text style={styles.dateText}>Ort, Datum</Text>
      </View>
      <View>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureText}>Unterschrift Patient/in bzw. gesetzlicher Vertreter</Text>
      </View>
    </View>
  </View>
);

export default Signature;