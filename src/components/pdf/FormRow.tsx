import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    marginRight: 8,
  },
  value: {
    flex: 1,
    borderBottom: '1px solid #000',
    paddingBottom: 2,
    fontSize: 10,
  },
  customValue: {
    flex: 1,
  }
});

interface FormRowItem {
  label: string;
  value: string | React.ReactNode;
  start?: number;
  type?: 'text' | 'custom';
}

interface FormRowProps {
  items: FormRowItem[];
  style?: any;
}

const FormRow: React.FC<FormRowProps> = ({ items, style }) => (
  <View style={[styles.row, style]}>
    {items.map((item, index) => (
      <View key={index} style={{ flex: 1, flexDirection: 'row', marginRight: index < items.length - 1 ? 16 : 0 }}>
        <Text style={[styles.label, { minWidth: item.start }]}>{item.label}:</Text>
        {item.type === 'custom' ? (
          <View style={styles.customValue}>{item.value}</View>
        ) : (
          <Text style={styles.value}>{item.value}</Text>
        )}
      </View>
    ))}
  </View>
);

export default FormRow;