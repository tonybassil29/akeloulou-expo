import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { CATEGORIES, DAYS, MEALS } from '../../constants/Config';
import { Recipe, MenuSlot } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { RecipeCard } from '../../components/ui/RecipeCard';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorView } from '../../components/ui/ErrorView';

const MENU_STORAGE_KEY = 'akel_loulou_menu';

const MEAL_LABELS: Record<string, string> = {
  'petit-dejeuner': 'Petit-dejeuner',
  dejeuner: 'Dejeuner',
  diner: 'Diner',
};

const MEAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'petit-dejeuner': 'sunny-outline',
  dejeuner: 'restaurant-outline',
  diner: 'moon-outline',
};

export default function MenuScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { recipes, loading, error, refetch } = useRecipes();

  const [menu, setMenu] = useState<MenuSlot[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const stored = await AsyncStorage.getItem(MENU_STORAGE_KEY);
      if (stored) {
        setMenu(JSON.parse(stored));
      } else {
        initializeMenu();
      }
    } catch {
      initializeMenu();
    }
    setMenuLoaded(true);
  };

  const initializeMenu = () => {
    const initial: MenuSlot[] = [];
    for (const day of DAYS) {
      for (const meal of MEALS) {
        initial.push({ day, meal, recipeId: undefined, recipe: undefined });
      }
    }
    setMenu(initial);
  };

  const saveMenu = async (updatedMenu: MenuSlot[]) => {
    setMenu(updatedMenu);
    try {
      const simplified = updatedMenu.map((slot) => ({
        day: slot.day,
        meal: slot.meal,
        recipeId: slot.recipeId,
      }));
      await AsyncStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(simplified));
    } catch {
      // ignore storage errors
    }
  };

  const assignRecipeToSlot = useCallback(
    (day: string, meal: string, recipe: Recipe) => {
      const updated = menu.map((slot) =>
        slot.day === day && slot.meal === meal
          ? { ...slot, recipeId: recipe.id, recipe }
          : slot
      );
      saveMenu(updated);
    },
    [menu]
  );

  const removeRecipeFromSlot = useCallback(
    (day: string, meal: string) => {
      const updated = menu.map((slot) =>
        slot.day === day && slot.meal === meal
          ? { ...slot, recipeId: undefined, recipe: undefined }
          : slot
      );
      saveMenu(updated);
    },
    [menu]
  );

  const generateMenu = useCallback(() => {
    if (recipes.length === 0) return;
    const updated = menu.map((slot) => {
      const randomIndex = Math.floor(Math.random() * recipes.length);
      const recipe = recipes[randomIndex];
      return { ...slot, recipeId: recipe.id, recipe };
    });
    saveMenu(updated);
  }, [recipes, menu]);

  const getSlotRecipe = (day: string, meal: string): Recipe | undefined => {
    const slot = menu.find((s) => s.day === day && s.meal === meal);
    if (slot?.recipeId && !slot.recipe) {
      return recipes.find((r) => r.id === slot.recipeId);
    }
    return slot?.recipe;
  };

  if (loading || !menuLoaded) return <LoadingScreen />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  const renderDay = ({ item: day }: { item: string }) => (
    <View style={[styles.dayCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.dayTitle, { color: colors.primary }]}>{day}</Text>
      {MEALS.map((meal) => {
        const recipe = getSlotRecipe(day, meal);
        return (
          <View key={`${day}-${meal}`} style={styles.mealRow}>
            <View style={styles.mealHeader}>
              <Ionicons
                name={MEAL_ICONS[meal]}
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.mealLabel, { color: colors.textSecondary }]}>
                {MEAL_LABELS[meal]}
              </Text>
            </View>
            {recipe ? (
              <View style={styles.mealRecipe}>
                <TouchableOpacity
                  style={styles.mealRecipeContent}
                  onPress={() => router.push(`/recipe/${recipe.id}`)}
                  accessibilityLabel={`Voir ${recipe.name}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[styles.mealRecipeName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {recipe.name}
                  </Text>
                  <Text style={[styles.mealRecipeMeta, { color: colors.textSecondary }]}>
                    {recipe.prep_time} min · {recipe.difficulty}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeRecipeFromSlot(day, meal)}
                  accessibilityLabel={`Supprimer ${recipe.name}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.addSlotButton,
                  { borderColor: colors.border, backgroundColor: colors.background },
                ]}
                onPress={() => {
                  Alert.alert(
                    'Choisir une recette',
                    'Naviguez versAccueil pour rechercher une recette, ou utilisez Generer menu.',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Generer',
                        onPress: generateMenu,
                      },
                    ]
                  );
                }}
                accessibilityLabel={`Ajouter recette pour ${MEAL_LABELS[meal]}`}
                accessibilityRole="button"
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.addSlotText, { color: colors.textSecondary }]}>
                  Ajouter
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Planificateur de Menu
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Organisez vos repas de la semaine
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.generateButton, { backgroundColor: colors.primary }]}
        onPress={generateMenu}
        accessibilityLabel="Generer un menu aleatoire"
        accessibilityHint="Genere un menu aleatoire pour toute la semaine"
        accessibilityRole="button"
      >
        <Ionicons name="shuffle" size={20} color="#FFFFFF" />
        <Text style={styles.generateButtonText}>Generer menu</Text>
      </TouchableOpacity>

      <FlatList
        data={DAYS}
        keyExtractor={(item) => item}
        renderItem={renderDay}
        contentContainerStyle={styles.daysList}
        ItemSeparatorComponent={() => <View style={styles.daySeparator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  daysList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  dayCard: {
    borderRadius: 12,
    padding: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  mealRow: {
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  mealLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  mealRecipe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 22,
  },
  mealRecipeContent: {
    flex: 1,
  },
  mealRecipeName: {
    fontSize: 15,
    fontWeight: '500',
  },
  mealRecipeMeta: {
    fontSize: 12,
  },
  addSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 22,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
    alignSelf: 'flex-start',
  },
  addSlotText: {
    fontSize: 13,
  },
  daySeparator: {
    height: 12,
  },
});