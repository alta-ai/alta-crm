import React from 'react';
import { View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 'auto',
  },
  children: {
    flex: 1,
    marginLeft: 20,
  }
});

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => (
  <View style={styles.header}>
    <Image 
      src="/src/assets/alta-letterhead.png"
      style={styles.logo}
    />
    {children && <View style={styles.children}>{children}</View>}
  </View>
);

export default Header;