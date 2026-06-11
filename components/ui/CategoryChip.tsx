import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

interface CategoryChipProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ name, isActive, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const backgroundColor = isActive ? colors.primary : colors.border;
  const textColor = isActive ? '#FFFFFF' : colors.textSecondary;

  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`Catégorie : ${name}`}
      accessibilityHint={isActive ? 'Catégorie sélectionnée' : 'Appuyez pour sélectionner cette catégorie'}
      accessibilityState={{ selected: isActive }}
      accessibilityRole="button"
    >
      <Text style={[styles.text, { color: textColor }]}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});