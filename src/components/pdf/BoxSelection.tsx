import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  box: {
    width: 10,
    height: 10,
    border: '1px solid black',
    marginRight: 4,
  },
  checkedBox: {
    backgroundColor: 'black',
  },
  label: {
    fontSize: 10,
  }
});

interface BoxSelectionProps {
  options: string[];
  selected?: string;
  style?: any;
}

const BoxSelection: React.FC<BoxSelectionProps> = ({ options, selected, style }) => (
  <View style={[styles.container, style]}>
    {options.map((option, index) => (
      <View key={index} style={[styles.option, style?.option]}>
        <View style={[
          styles.box,
          selected === option && styles.checkedBox,
          style?.box
        ]} />
        <Text style={[styles.label, style?.label]}>{option}</Text>
      </View>
    ))}
  </View>
);

export default BoxSelection;