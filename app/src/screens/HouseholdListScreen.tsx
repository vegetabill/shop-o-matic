import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHousehold } from '../context/HouseholdContext';
import { Household } from '../types';

export default function HouseholdListScreen() {
  const {
    households,
    isLoading,
    createHousehold,
    joinHousehold,
    setActiveHousehold,
    activeHousehold,
  } = useHousehold();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [shareToken, setShareToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const name = newHouseholdName.trim();
    if (!name) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createHousehold(name);
      setShowCreateModal(false);
      setNewHouseholdName('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to create household');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async () => {
    const token = shareToken.trim();
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await joinHousehold(token);
      setShowJoinModal(false);
      setShareToken('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to join household');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectHousehold = (household: Household) => {
    setActiveHousehold(household);
  };

  const renderHousehold = ({ item }: { item: Household }) => (
    <TouchableOpacity
      style={[
        styles.householdRow,
        activeHousehold?.id === item.id && styles.activeRow,
      ]}
      onPress={() => handleSelectHousehold(item)}
      activeOpacity={0.7}
    >
      <View style={styles.householdIcon}>
        <Text style={styles.householdIconText}>🏠</Text>
      </View>
      <View style={styles.householdInfo}>
        <Text style={styles.householdName}>{item.name}</Text>
      </View>
      {activeHousehold?.id === item.id && (
        <Text style={styles.activeIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Households</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={households}
          keyExtractor={(item) => item.id}
          renderItem={renderHousehold}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏠</Text>
              <Text style={styles.emptyTitle}>No Households Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create a new household or join one with a share token.
              </Text>
            </View>
          }
          contentContainerStyle={households.length === 0 && styles.emptyList}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => { setError(null); setShowCreateModal(true); }}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>+ Create Household</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => { setError(null); setShowJoinModal(true); }}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Join with Token</Text>
        </TouchableOpacity>
      </View>

      {/* Create Household Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Household</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Household Name</Text>
            <TextInput
              style={styles.textInput}
              value={newHouseholdName}
              onChangeText={setNewHouseholdName}
              placeholder="e.g. The Smiths"
              placeholderTextColor="#8E8E93"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
              onPress={handleCreate}
              disabled={isSubmitting || !newHouseholdName.trim()}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Join Household Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Household</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Share Token</Text>
            <TextInput
              style={styles.textInput}
              value={shareToken}
              onChangeText={setShareToken}
              placeholder="Paste share token here"
              placeholderTextColor="#8E8E93"
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleJoin}
            />

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
              onPress={handleJoin}
              disabled={isSubmitting || !shareToken.trim()}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Join</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  householdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  activeRow: {
    backgroundColor: '#F0F8FF',
  },
  householdIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  householdIconText: {
    fontSize: 20,
  },
  householdInfo: {
    flex: 1,
  },
  householdName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  activeIndicator: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 16,
    gap: 10,
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
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
    gap: 12,
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
  inputLabel: {
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
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
});
