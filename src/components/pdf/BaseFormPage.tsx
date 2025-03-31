import React from 'react';
import { Page, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    padding: '25px 30px',
    margin: 0,
    fontFamily: 'Roboto',
    fontSize: '11px',
  }
});

const BaseFormPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Page size="A4" style={styles.page}>
    {children}
  </Page>
);

export default BaseFormPage;