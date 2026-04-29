import React, { useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHousehold } from '../context/HouseholdContext';
import { Item, Store } from '../types';

export default function ShoppingScreen({ navigation }: any) {
  const { items, stores, endShopping } = useHousehold();

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [isDone, setIsDone] = useState(false);

  const shoppingItems = useMemo(() => {
    if (!selectedStore) return [];
    return items.filter(
      (item) =>
        item.on_list &&
        !hiddenIds.has(item.id) &&
        (item.stores.length === 0 || item.stores.some((s) => s.store_id === selectedStore.id)),
    );
  }, [items, selectedStore, hiddenIds]);

  const handleSelectStore = useCallback((store: Store) => {
    setSelectedStore(store);
    setPurchasedIds(new Set());
    setHiddenIds(new Set());
  }, []);

  const handleChangeStore = useCallback(() => {
    setSelectedStore(null);
    setPurchasedIds(new Set());
    setHiddenIds(new Set());
  }, []);

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

  const handleLongPress = useCallback((item: Item) => {
    Alert.alert(
      'Not Available Here',
      `Hide "${item.name}" for this shopping session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          style: 'destructive',
          onPress: () => setHiddenIds((prev) => new Set([...prev, item.id])),
        },
      ],
    );
  }, []);

  const handleDoneShopping = useCallback(async () => {
    setIsDone(true);
    try {
      await endShopping(Array.from(purchasedIds), Array.from(hiddenIds), selectedStore?.id);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to end shopping session.');
      setIsDone(false);
    }
  }, [endShopping, purchasedIds, hiddenIds, selectedStore, navigation]);

  // ── Store picker ──────────────────────────────────────────────────────────

  if (!selectedStore) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Where are you shopping?</Text>
          <Text style={styles.pickerSubtitle}>Choose a store to see your list for it.</Text>
        </View>

        {stores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏪</Text>
            <Text style={styles.emptyTitle}>No stores yet</Text>
            <Text style={styles.emptySubtitle}>Add stores in the Stores tab first.</Text>
          </View>
        ) : (
          <FlatList
            data={stores}
            keyExtractor={(s) => s.id}
            contentContainerStyle={styles.pickerList}
            renderItem={({ item: store }) => (
              <TouchableOpacity
                style={styles.storeCard}
                onPress={() => handleSelectStore(store)}
                activeOpacity={0.7}
              >
                <View style={[styles.storeCardColor, { backgroundColor: store.color }]} />
                <Text style={styles.storeCardName}>{store.name}</Text>
                <Text style={styles.storeCardChevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // ── Shopping list ─────────────────────────────────────────────────────────

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
      {/* Store header */}
      <View style={styles.storeHeader}>
        <View style={[styles.storeHeaderDot, { backgroundColor: selectedStore.color }]} />
        <Text style={styles.storeHeaderName} numberOfLines={1}>
          {selectedStore.name}
        </Text>
        <TouchableOpacity onPress={handleChangeStore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.changeStoreText}>Change</Text>
        </TouchableOpacity>
      </View>

      {shoppingItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Nothing to buy here</Text>
          <Text style={styles.emptySubtitle}>No list items are tagged for {selectedStore.name}.</Text>
        </View>
      ) : (
        <FlatList
          data={shoppingItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>Tap to check off · Long press to hide</Text>
      </View>

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

  // Store picker
  pickerHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  pickerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  pickerSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  pickerList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  storeCardColor: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  storeCardName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  storeCardChevron: {
    fontSize: 22,
    color: '#C7C7CC',
  },

  // Store header bar
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    gap: 10,
  },
  storeHeaderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  storeHeaderName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  changeStoreText: {
    fontSize: 15,
    color: '#007AFF',
  },

  // Items list
  list: { flex: 1 },
  listContent: { paddingBottom: 8 },
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
  itemRowPurchased: { backgroundColor: '#F9F9F9' },
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
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  itemContent: { flex: 1 },
  itemName: { fontSize: 17, color: '#1C1C1E' },
  itemNamePurchased: { textDecorationLine: 'line-through', color: '#8E8E93' },
  itemNotes: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  itemNotesPurchased: { textDecorationLine: 'line-through' },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 6 },
  emptySubtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center' },

  // Footer
  hintContainer: { paddingVertical: 6, alignItems: 'center' },
  hintText: { fontSize: 12, color: '#C7C7CC' },
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
  doneButtonDisabled: { opacity: 0.6 },
  doneButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
