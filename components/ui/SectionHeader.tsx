import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

interface SectionHeaderProps {
  title: string;
  onPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {onPress && (
        <TouchableOpacity
          onPress={onPress}
          accessibilityLabel={`Voir tout : ${title}`}
          accessibilityHint="Appuyez pour voir toutes les recettes"
          accessibilityRole="button"
        >
          <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
});