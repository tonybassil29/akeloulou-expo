import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

interface StepItemProps {
  step: string;
  index: number;
}

export const StepItem: React.FC<StepItemProps> = ({ step, index }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
        <Text style={styles.badgeText}>{index + 1}</Text>
      </View>
      <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
});