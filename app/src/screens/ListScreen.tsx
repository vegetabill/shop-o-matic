import React, { useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useHousehold } from '../context/HouseholdContext';
import { Item, Category, Store, ItemPriority } from '../types';
import AutocompleteInput from '../components/AutocompleteInput';
import { HOUSEHOLD_JOIN_BASE_URL } from '../constants/config';

function relativeTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

interface SectionData {
  title: string;
  data: Item[];
}

interface EditModalState {
  visible: boolean;
  item: Item | null;
  name: string;
  notes: string;
  priority: ItemPriority;
  categoryId: string | null;
  selectedStoreIds: Set<string>;
  isSubmitting: boolean;
  error: string | null;
}

const PRIORITY_OPTIONS: { value: ItemPriority; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: '#8E8E93' },
  { value: 'low', label: 'On Sale', color: '#C7C7CC' },
  { value: 'high', label: 'Need Now', color: '#FF3B30' },
];

export default function ListScreen({ navigation }: any) {
  const {
    activeHousehold,
    items,
    isLoadingItems,
    loadItems,
    addItem,
    updateItem,
    removeItem,
    searchItems,
    categories,
    stores,
  } = useHousehold();

  const [editModal, setEditModal] = useState<EditModalState>({
    visible: false,
    item: null,
    name: '',
    notes: '',
    priority: 'none',
    categoryId: null,
    selectedStoreIds: new Set(),
    isSubmitting: false,
    error: null,
  });

  const onListItems = useMemo(
    () => items.filter((item) => item.on_list),
    [items],
  );

  const sections = useMemo<SectionData[]>(() => {
    const grouped: Record<string, Item[]> = {};
    const uncategorized: Item[] = [];

    onListItems.forEach((item) => {
      if (item.category_id) {
        if (!grouped[item.category_id]) grouped[item.category_id] = [];
        grouped[item.category_id].push(item);
      } else {
        uncategorized.push(item);
      }
    });

    const result: SectionData[] = categories
      .filter((cat) => grouped[cat.id]?.length > 0)
      .map((cat) => ({ title: cat.name, data: grouped[cat.id] }));

    if (uncategorized.length > 0) {
      result.push({ title: 'Uncategorized', data: uncategorized });
    }

    return result;
  }, [onListItems, categories]);

  const openEditModal = useCallback((item: Item) => {
    setEditModal({
      visible: true,
      item,
      name: item.name,
      notes: item.notes ?? '',
      priority: item.priority ?? 'none',
      categoryId: item.category_id ?? null,
      selectedStoreIds: new Set(item.stores.map((s) => s.store_id)),
      isSubmitting: false,
      error: null,
    });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editModal.item) return;
    setEditModal((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      await updateItem(editModal.item.id, {
        name: editModal.name.trim(),
        notes: editModal.notes.trim() || undefined,
        priority: editModal.priority,
        category_id: editModal.categoryId,
        store_ids: Array.from(editModal.selectedStoreIds),
      });
      closeEditModal();
    } catch (e: any) {
      setEditModal((prev) => ({
        ...prev,
        isSubmitting: false,
        error: e.message ?? 'Failed to update item',
      }));
    }
  }, [editModal, updateItem, closeEditModal]);

  const handleDeleteItem = useCallback(async () => {
    if (!editModal.item) return;
    Alert.alert('Remove Item', `Remove "${editModal.item.name}" from the list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          closeEditModal();
          try {
            await removeItem(editModal.item!.id);
          } catch {
            Alert.alert('Error', 'Failed to remove item.');
          }
        },
      },
    ]);
  }, [editModal, removeItem, closeEditModal]);

  const toggleStoreSelection = useCallback((storeId: string) => {
    setEditModal((prev) => {
      const next = new Set(prev.selectedStoreIds);
      if (next.has(storeId)) {
        next.delete(storeId);
      } else {
        next.add(storeId);
      }
      return { ...prev, selectedStoreIds: next };
    });
  }, []);

  const handleAddItem = useCallback(
    async (name: string) => {
      await addItem({ name });
    },
    [addItem],
  );

  const handleSelectSuggestion = useCallback(
    async (item: Item) => {
      // Re-add an existing item to the list
      await updateItem(item.id, { on_list: true });
    },
    [updateItem],
  );

  const handleShare = useCallback(async () => {
    if (!activeHousehold) return;
    const url = `${HOUSEHOLD_JOIN_BASE_URL}/${activeHousehold.share_token}`;
    await Clipboard.setStringAsync(url);
    Alert.alert('Copied!', 'Household join link copied to clipboard.');
  }, [activeHousehold]);

  const handleStartShopping = useCallback(() => {
    navigation.navigate('Shopping');
  }, [navigation]);

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Item }) => {
    const priorityOption = PRIORITY_OPTIONS.find((p) => p.value === item.priority);
    const isLow = item.priority === 'low';
    const showPriority = item.priority && item.priority !== 'none';
    return (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => openEditModal(item)}
        activeOpacity={0.7}
      >
        {showPriority && (
          <View style={[styles.priorityBar, { backgroundColor: priorityOption!.color }]} />
        )}
        <View style={styles.itemContent}>
          <Text style={[styles.itemName, isLow && styles.itemNameLow]}>{item.name}</Text>
          {item.notes ? (
            <Text style={styles.itemNotes} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  if (!activeHousehold) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noHouseholdText}>No household selected.</Text>
          <Text style={styles.noHouseholdSub}>
            Go to the Households tab to create or select one.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => navigation.navigate('HouseholdList')}
          activeOpacity={0.7}
        >
          <Text style={styles.householdName} numberOfLines={1}>
            ‹ {activeHousehold.name}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shoppingButton} onPress={handleStartShopping}>
            <Text style={styles.shoppingButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <AutocompleteInput
          onAddItem={handleAddItem}
          onSelectItem={handleSelectSuggestion}
          searchItems={searchItems}
        />

        {isLoadingItems ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : sections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>List is empty</Text>
            <Text style={styles.emptySub}>Add items using the field above.</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={renderSectionHeader}
            renderItem={renderItem}
            onRefresh={loadItems}
            refreshing={isLoadingItems}
            stickySectionHeadersEnabled
            contentContainerStyle={styles.listContent}
          />
        )}
      </KeyboardAvoidingView>

      {/* Edit Item Modal */}
      <Modal
        visible={editModal.visible}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {editModal.error ? (
                <Text style={styles.errorText}>{editModal.error}</Text>
              ) : null}

              {editModal.item?.last_purchased_at ? (
                <View style={styles.lastPurchasedRow}>
                  <Text style={styles.lastPurchasedText}>
                    {'Purchased'}
                    {editModal.item.last_purchased_store_name
                      ? ` at ${editModal.item.last_purchased_store_name}`
                      : ''}
                    {` ${relativeTime(editModal.item.last_purchased_at)}`}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editModal.name}
                onChangeText={(v) => setEditModal((p) => ({ ...p, name: v }))}
                placeholder="Item name"
                placeholderTextColor="#8E8E93"
              />

              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={editModal.notes}
                onChangeText={(v) => setEditModal((p) => ({ ...p, notes: v }))}
                placeholder="Optional notes..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = editModal.priority === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.priorityOption,
                        selected && { backgroundColor: opt.color, borderColor: opt.color },
                      ]}
                      onPress={() => setEditModal((p) => ({ ...p, priority: opt.value }))}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.priorityOptionText, selected && styles.priorityOptionTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                <TouchableOpacity
                  style={[
                    styles.categoryPill,
                    editModal.categoryId === null && styles.categoryPillSelected,
                  ]}
                  onPress={() => setEditModal((p) => ({ ...p, categoryId: null }))}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      editModal.categoryId === null && styles.categoryPillTextSelected,
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      editModal.categoryId === cat.id && styles.categoryPillSelected,
                    ]}
                    onPress={() => setEditModal((p) => ({ ...p, categoryId: cat.id }))}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        editModal.categoryId === cat.id && styles.categoryPillTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Available at Stores</Text>
              {stores.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={styles.storeToggleRow}
                  onPress={() => toggleStoreSelection(store.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.storeColorDot, { backgroundColor: store.color }]} />
                  <Text style={styles.storeToggleName}>{store.name}</Text>
                  <Switch
                    value={editModal.selectedStoreIds.has(store.id)}
                    onValueChange={() => toggleStoreSelection(store.id)}
                    trackColor={{ true: '#007AFF' }}
                  />
                </TouchableOpacity>
              ))}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!editModal.name.trim() || editModal.isSubmitting) && styles.disabledButton,
                  ]}
                  onPress={handleSaveEdit}
                  disabled={!editModal.name.trim() || editModal.isSubmitting}
                >
                  {editModal.isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteItem}
                >
                  <Text style={styles.deleteButtonText}>Remove from List</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  householdName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  shoppingButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shoppingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    overflow: 'hidden',
  },
  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  itemContent: { flex: 1 },
  itemName: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  itemNameLow: {
    color: '#8E8E93',
    fontWeight: '400',
  },
  itemNotes: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 6 },
  emptySub: { fontSize: 15, color: '#8E8E93', textAlign: 'center' },
  noHouseholdText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  noHouseholdSub: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  modalCancel: {
    fontSize: 17,
    color: '#007AFF',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#F9F9F9',
  },
  multilineInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  priorityOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  priorityOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
    backgroundColor: '#F2F2F7',
  },
  categoryPillSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryPillText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  categoryPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  storeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  storeColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  storeToggleName: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  modalActions: {
    marginTop: 20,
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  lastPurchasedRow: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  lastPurchasedText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 8,
  },
});
