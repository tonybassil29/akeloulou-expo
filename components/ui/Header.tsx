import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface HeaderAction {
  iconName: string;
  onPress: () => void;
}

interface HeaderProps {
  title: string;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
}

export const Header: React.FC<HeaderProps> = ({ title, leftAction, rightAction }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.side}>
        {leftAction && (
          <TouchableOpacity
            onPress={leftAction.onPress}
            style={styles.actionButton}
            accessibilityLabel={`Action : ${leftAction.iconName}`}
            accessibilityRole="button"
          >
            <Ionicons name={leftAction.iconName as any} size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.actionButton}
            accessibilityLabel={`Action : ${rightAction.iconName}`}
            accessibilityRole="button"
          >
            <Ionicons name={rightAction.iconName as any} size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: {
    width: 48,
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
});