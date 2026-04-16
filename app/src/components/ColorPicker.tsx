import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from 'react-native';

const PRESET_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#00C7BE', // Teal
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Violet
  '#FF2D55', // Pink
  '#A2845E', // Brown
  '#8E8E93', // Gray
  '#1C1C1E', // Black
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = React.useState('');

  const handleCustomColorSubmit = () => {
    const trimmed = customColor.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
      onColorChange(trimmed);
    }
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
        {PRESET_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              selectedColor === color && styles.selected,
            ]}
            onPress={() => onColorChange(color)}
            activeOpacity={0.8}
          />
        ))}
      </ScrollView>
      <View style={styles.customRow}>
        <View style={[styles.previewSwatch, { backgroundColor: selectedColor }]} />
        <TextInput
          style={styles.hexInput}
          value={customColor}
          onChangeText={setCustomColor}
          placeholder="#RRGGBB"
          placeholderTextColor="#8E8E93"
          autoCapitalize="none"
          maxLength={7}
          onSubmitEditing={handleCustomColorSubmit}
          onBlur={handleCustomColorSubmit}
        />
        <Text style={styles.selectedLabel}>{selectedColor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  presetRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  selected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  hexInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#1C1C1E',
  },
  selectedLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: 'Courier',
  },
});
