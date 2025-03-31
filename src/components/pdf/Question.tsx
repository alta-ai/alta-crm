import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  question: {
    fontSize: 10,
    marginBottom: 4,
  }
});

interface QuestionProps {
  question: string;
  children: React.ReactNode;
  style?: any;
}

const Question: React.FC<QuestionProps> = ({ question, children, style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.question}>{question}</Text>
    {children}
  </View>
);

export default Question;