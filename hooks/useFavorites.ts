import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'akel_loulou_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      // ignore storage errors
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    const updated = favorites.includes(recipeId)
      ? favorites.filter((id) => id !== recipeId)
      : [...favorites, recipeId];
    setFavorites(updated);
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  };

  const isFavorite = (recipeId: string): boolean => {
    return favorites.includes(recipeId);
  };

  return { favorites, toggleFavorite, isFavorite };
}