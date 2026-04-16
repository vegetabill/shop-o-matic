import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Item } from '../types';
import StoreTag from './StoreTag';

interface ItemRowProps {
  item: Item;
  onPress: (item: Item) => void;
  purchased?: boolean;
}

export default function ItemRow({ item, onPress, purchased = false }: ItemRowProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.name, purchased && styles.purchasedText]}>{item.name}</Text>
        {item.notes ? (
          <Text style={[styles.notes, purchased && styles.purchasedText]} numberOfLines={1}>
            {item.notes}
          </Text>
        ) : null}
        {item.stores.length > 0 ? (
          <View style={styles.storeRow}>
            {item.stores.map((store) => (
              <StoreTag key={store.store_id} store={store} />
            ))}
          </View>
        ) : null}
      </View>
      {purchased && <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '400',
  },
  purchasedText: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  notes: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  storeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  checkmark: {
    marginLeft: 8,
  },
  checkmarkText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
  },
});
