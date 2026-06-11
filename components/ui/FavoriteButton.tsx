import React from 'react';
import { TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onPress: () => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorite, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      accessibilityHint={isFavorite ? 'Appuyez pour retirer des favoris' : 'Appuyez pour ajouter aux favoris'}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={colors.error}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});