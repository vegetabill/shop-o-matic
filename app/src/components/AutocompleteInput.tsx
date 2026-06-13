import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Item } from '../types';

interface AutocompleteInputProps {
  onAddItem: (name: string) => Promise<void>;
  onSelectItem: (item: Item) => Promise<void>;
  searchItems: (query: string) => Promise<Item[]>;
}

export default function AutocompleteInput({
  onAddItem,
  onSelectItem,
  searchItems,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (text.trim().length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchItems(text.trim());
          // Filter out items that are already on the list
          const filtered = results.filter((item) => !item.on_list);
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        } catch {
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsSearching(false);
        }
      }, 1000);
    },
    [searchItems],
  );

  const handleSelectSuggestion = useCallback(
    async (item: Item) => {
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      Keyboard.dismiss();
      await onSelectItem(item);
    },
    [onSelectItem],
  );

  const handleAdd = useCallback(async () => {
    const name = query.trim();
    if (!name) return;
    setIsAdding(true);
    Keyboard.dismiss();
    try {
      await onAddItem(name);
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsAdding(false);
    }
  }, [query, onAddItem]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder="Add item..."
          placeholderTextColor="#8E8E93"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          autoCorrect={false}
        />
        {isSearching ? (
          <ActivityIndicator size="small" color="#007AFF" style={styles.spinner} />
        ) : null}
        <TouchableOpacity
          style={[styles.addButton, !query.trim() && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!query.trim() || isAdding}
          activeOpacity={0.7}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionName}>{item.name}</Text>
                {item.category_name ? (
                  <Text style={styles.suggestionCategory}>{item.category_name}</Text>
                ) : null}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
  },
  spinner: {
    position: 'absolute',
    right: 100,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  addButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionName: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  suggestionCategory: {
    fontSize: 13,
    color: '#8E8E93',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 16,
  },
});
