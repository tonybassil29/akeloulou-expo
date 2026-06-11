import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search-outline',
  message,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name={icon} size={64} color={colors.textSecondary} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});