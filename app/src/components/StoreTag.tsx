import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ItemStore } from '../types';

interface StoreTagProps {
  store: ItemStore;
}

export default function StoreTag({ store }: StoreTagProps) {
  return <View style={[styles.dot, { backgroundColor: store.store_color }]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
    marginTop: 2,
  },
});
