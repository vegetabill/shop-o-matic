import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHousehold } from '../context/HouseholdContext';
import { Store } from '../types';
import ColorPicker from '../components/ColorPicker';

interface StoreModalState {
  visible: boolean;
  store: Store | null;
  name: string;
  color: string;
  isSubmitting: boolean;
  error: string | null;
}

const DEFAULT_COLOR = '#007AFF';

export default function StoresScreen() {
  const { stores, isLoadingStores, loadStores, addStore, updateStore, removeStore } =
    useHousehold();

  const [modal, setModal] = useState<StoreModalState>({
    visible: false,
    store: null,
    name: '',
    color: DEFAULT_COLOR,
    isSubmitting: false,
    error: null,
  });

  const openCreate = useCallback(() => {
    setModal({
      visible: true,
      store: null,
      name: '',
      color: DEFAULT_COLOR,
      isSubmitting: false,
      error: null,
    });
  }, []);

  const openEdit = useCallback((store: Store) => {
    setModal({
      visible: true,
      store,
      name: store.name,
      color: store.color,
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
    setModal((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      if (modal.store) {
        await updateStore(modal.store.id, { name, color: modal.color });
      } else {
        await addStore({ name, color: modal.color });
      }
      closeModal();
    } catch (e: any) {
      setModal((prev) => ({
        ...prev,
        isSubmitting: false,
        error: e.message ?? 'Failed to save store',
      }));
    }
  }, [modal, addStore, updateStore, closeModal]);

  const handleDelete = useCallback(
    (store: Store) => {
      Alert.alert('Delete Store', `Delete "${store.name}"? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeStore(store.id);
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to delete store.');
            }
          },
        },
      ]);
    },
    [removeStore],
  );

  const renderStore = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeRow}
      onPress={() => openEdit(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
      <Text style={styles.storeName}>{item.name}</Text>
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
        <Text style={styles.title}>Stores</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoadingStores ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderStore}
          onRefresh={loadStores}
          refreshing={isLoadingStores}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏪</Text>
              <Text style={styles.emptyTitle}>No Stores</Text>
              <Text style={styles.emptySub}>Add stores to tag items with where to buy them.</Text>
            </View>
          }
          contentContainerStyle={stores.length === 0 && styles.emptyList}
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
                {modal.store ? 'Edit Store' : 'Add Store'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {modal.error ? (
                <Text style={styles.errorText}>{modal.error}</Text>
              ) : null}

              <Text style={styles.fieldLabel}>Store Name</Text>
              <TextInput
                style={styles.textInput}
                value={modal.name}
                onChangeText={(v) => setModal((p) => ({ ...p, name: v }))}
                placeholder="e.g. Whole Foods"
                placeholderTextColor="#8E8E93"
                autoFocus={!modal.store}
              />

              <Text style={styles.fieldLabel}>Color</Text>
              <ColorPicker
                selectedColor={modal.color}
                onColorChange={(color) => setModal((p) => ({ ...p, color }))}
              />

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
                    {modal.store ? 'Save Changes' : 'Add Store'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  storeName: {
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
    maxHeight: '80%',
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
    marginBottom: 8,
    marginTop: 16,
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
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
    marginBottom: 8,
  },
});
