import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ItemStore } from '../types';

interface StoreTagProps {
  store: ItemStore;
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default function StoreTag({ store }: StoreTagProps) {
  const textColor = getContrastColor(store.store_color);

  return (
    <View style={[styles.tag, { backgroundColor: store.store_color }]}>
      <Text style={[styles.label, { color: textColor }]}>{store.store_name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
