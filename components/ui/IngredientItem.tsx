import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

interface IngredientItemProps {
  ingredient: string;
}

export const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.name, { color: colors.text }]}>{ingredient}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '400',
  },
});