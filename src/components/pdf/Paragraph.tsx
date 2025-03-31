import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
  }
});

interface ParagraphProps {
  heading?: string;
  text: string;
  style?: any;
}

const Paragraph: React.FC<ParagraphProps> = ({ heading, text, style }) => (
  <View style={[styles.container, style]}>
    {heading && <Text style={styles.heading}>{heading}</Text>}
    <Text style={styles.text}>{text}</Text>
  </View>
);

export default Paragraph;