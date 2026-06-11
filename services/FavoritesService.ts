import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types';

const FAVORITES_KEY = 'akel_loulou_favorites';

export async function getFavorites(): Promise<Recipe[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addFavorite(recipe: Recipe): Promise<void> {
  const favorites = await getFavorites();
  const exists = favorites.some((f) => f.id === recipe.id);
  if (!exists) {
    favorites.push(recipe);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export async function removeFavorite(recipeId: string): Promise<void> {
  const favorites = await getFavorites();
  const filtered = favorites.filter((f) => f.id !== recipeId);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export async function isFavorite(recipeId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.id === recipeId);
}

export async function toggleFavorite(recipe: Recipe): Promise<boolean> {
  const favorite = await isFavorite(recipe.id);
  if (favorite) {
    await removeFavorite(recipe.id);
    return false;
  }
  await addFavorite(recipe);
  return true;
}

export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_KEY);
}