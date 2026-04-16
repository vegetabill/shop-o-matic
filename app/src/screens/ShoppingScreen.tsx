import React, { useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  GestureResponderEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHousehold } from '../context/HouseholdContext';
import { Item, Store } from '../types';

const ALL_STORES_SENTINEL = '__all__';

export default function ShoppingScreen({ navigation }: any) {
  const { items, stores, endShopping, updateItem } = useHousehold();

  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    stores.length > 0 ? stores[0].id : ALL_STORES_SENTINEL,
  );
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [isDone, setIsDone] = useState(false);

  const shoppingItems = useMemo(() => {
    return items.filter((item) => item.on_list && !hiddenIds.has(item.id));
  }, [items, hiddenIds]);

  const filteredItems = useMemo(() => {
    if (selectedStoreId === ALL_STORES_SENTINEL) {
      return shoppingItems;
    }
    return shoppingItems.filter(
      (item) =>
        item.stores.length === 0 ||
        item.stores.some((s) => s.store_id === selectedStoreId),
    );
  }, [shoppingItems, selectedStoreId]);

  const handleTogglePurchased = useCallback((item: Item) => {
    setPurchasedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  }, []);

  const handleNotAvailable = useCallback((item: Item) => {
    setHiddenIds((prev) => new Set([...prev, item.id]));
  }, []);

  const handleLongPress = useCallback(
    (item: Item) => {
      Alert.alert(
        'Not Available Here',
        `Hide "${item.name}" for this shopping session?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Hide',
            style: 'destructive',
            onPress: () => handleNotAvailable(item),
          },
        ],
      );
    },
    [handleNotAvailable],
  );

  const handleDoneShopping = useCallback(async () => {
    setIsDone(true);
    try {
      await endShopping(Array.from(purchasedIds));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to end shopping session.');
      setIsDone(false);
    }
  }, [endShopping, purchasedIds, navigation]);

  const renderStoreTab = (store: Store) => (
    <TouchableOpacity
      key={store.id}
      style={[
        styles.storeTab,
        selectedStoreId === store.id && styles.storeTabActive,
        selectedStoreId === store.id && { borderBottomColor: store.color },
      ]}
      onPress={() => setSelectedStoreId(store.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.storeTabDot, { backgroundColor: store.color }]} />
      <Text
        style={[
          styles.storeTabText,
          selectedStoreId === store.id && styles.storeTabTextActive,
        ]}
      >
        {store.name}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Item }) => {
    const isPurchased = purchasedIds.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.itemRow, isPurchased && styles.itemRowPurchased]}
        onPress={() => handleTogglePurchased(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isPurchased && styles.checkboxChecked]}>
          {isPurchased && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemName, isPurchased && styles.itemNamePurchased]}>
            {item.name}
          </Text>
          {item.notes ? (
            <Text style={[styles.itemNotes, isPurchased && styles.itemNotesPurchased]}>
              {item.notes}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Store tabs */}
      {stores.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            style={[
              styles.storeTab,
              selectedStoreId === ALL_STORES_SENTINEL && styles.storeTabActive,
            ]}
            onPress={() => setSelectedStoreId(ALL_STORES_SENTINEL)}
          >
            <Text
              style={[
                styles.storeTabText,
                selectedStoreId === ALL_STORES_SENTINEL && styles.storeTabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {stores.map(renderStoreTab)}
        </ScrollView>
      ) : null}

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Nothing to buy</Text>
          <Text style={styles.emptySubtitle}>
            {selectedStoreId === ALL_STORES_SENTINEL
              ? 'Your list is empty.'
              : 'No items for this store.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Info about long press */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          Tap to check off · Long press to hide from this store
        </Text>
      </View>

      {/* Done button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneButton, isDone && styles.doneButtonDisabled]}
          onPress={handleDoneShopping}
          disabled={isDone}
          activeOpacity={0.8}
        >
          {isDone ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.doneButtonText}>
              Done Shopping{purchasedIds.size > 0 ? ` (${purchasedIds.size})` : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    maxHeight: 48,
  },
  tabsContent: {
    paddingHorizontal: 12,
  },
  storeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 4,
    gap: 6,
  },
  storeTabActive: {
    borderBottomWidth: 2,
  },
  storeTabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storeTabText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  storeTabTextActive: {
    color: '#1C1C1E',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    gap: 12,
  },
  itemRowPurchased: {
    backgroundColor: '#F9F9F9',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  itemContent: { flex: 1 },
  itemName: {
    fontSize: 17,
    color: '#1C1C1E',
  },
  itemNamePurchased: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  itemNotes: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  itemNotesPurchased: {
    textDecorationLine: 'line-through',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 6 },
  emptySubtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center' },
  hintContainer: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 4 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonDisabled: {
    opacity: 0.6,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
