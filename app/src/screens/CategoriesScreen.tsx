import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHousehold } from '../context/HouseholdContext';
import { Category } from '../types';

interface CategoryModalState {
  visible: boolean;
  category: Category | null;
  name: string;
  sortOrder: string;
  isSubmitting: boolean;
  error: string | null;
}

export default function CategoriesScreen() {
  const {
    categories,
    isLoadingCategories,
    loadCategories,
    addCategory,
    updateCategory,
    removeCategory,
  } = useHousehold();

  const [modal, setModal] = useState<CategoryModalState>({
    visible: false,
    category: null,
    name: '',
    sortOrder: '0',
    isSubmitting: false,
    error: null,
  });

  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  const openCreate = useCallback(() => {
    const nextOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.sort_order)) + 1
      : 0;
    setModal({
      visible: true,
      category: null,
      name: '',
      sortOrder: String(nextOrder),
      isSubmitting: false,
      error: null,
    });
  }, [categories]);

  const openEdit = useCallback((category: Category) => {
    setModal({
      visible: true,
      category,
      name: category.name,
      sortOrder: String(category.sort_order),
      isSubmitting: false,
      error: null,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleSave = useCallback(async () => {
    const name = modal.name.trim();
    if (!name) return;
    const sortOrder = parseInt(modal.sortOrder, 10) || 0;
    setModal((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      if (modal.category) {
        await updateCategory(modal.category.id, { name, sort_order: sortOrder });
      } else {
        await addCategory({ name, sort_order: sortOrder });
      }
      closeModal();
    } catch (e: any) {
      setModal((prev) => ({
        ...prev,
        isSubmitting: false,
        error: e.message ?? 'Failed to save category',
      }));
    }
  }, [modal, addCategory, updateCategory, closeModal]);

  const handleDelete = useCallback(
    (category: Category) => {
      Alert.alert(
        'Delete Category',
        `Delete "${category.name}"? Items in this category will become uncategorized.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeCategory(category.id);
              } catch (e: any) {
                Alert.alert('Error', e.message ?? 'Failed to delete category.');
              }
            },
          },
        ],
      );
    },
    [removeCategory],
  );

  const renderCategory = ({ item, index }: { item: Category; index: number }) => (
    <TouchableOpacity
      style={styles.categoryRow}
      onPress={() => openEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.orderBadge}>
        <Text style={styles.orderText}>{item.sort_order}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoadingCategories ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={sortedCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          onRefresh={loadCategories}
          refreshing={isLoadingCategories}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📂</Text>
              <Text style={styles.emptyTitle}>No Categories</Text>
              <Text style={styles.emptySub}>
                Add categories to organize your shopping list.
              </Text>
            </View>
          }
          contentContainerStyle={categories.length === 0 && styles.emptyList}
        />
      )}

      <Modal
        visible={modal.visible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modal.category ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {modal.error ? (
              <Text style={styles.errorText}>{modal.error}</Text>
            ) : null}

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={modal.name}
              onChangeText={(v) => setModal((p) => ({ ...p, name: v }))}
              placeholder="e.g. Produce"
              placeholderTextColor="#8E8E93"
              autoFocus={!modal.category}
            />

            <Text style={styles.fieldLabel}>Sort Order</Text>
            <TextInput
              style={styles.textInput}
              value={modal.sortOrder}
              onChangeText={(v) => setModal((p) => ({ ...p, sortOrder: v }))}
              placeholder="0"
              placeholderTextColor="#8E8E93"
              keyboardType="number-pad"
            />
            <Text style={styles.fieldHint}>Lower numbers appear first on the list.</Text>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!modal.name.trim() || modal.isSubmitting) && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!modal.name.trim() || modal.isSubmitting}
            >
              {modal.isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {modal.category ? 'Save Changes' : 'Add Category'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: { flex: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 6 },
  emptySub: { fontSize: 15, color: '#8E8E93', textAlign: 'center' },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryName: {
    flex: 1,
    fontSize: 17,
    color: '#1C1C1E',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontSize: 14,
  },
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
    gap: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  fieldHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: -4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
});
