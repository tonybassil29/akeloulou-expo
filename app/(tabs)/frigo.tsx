import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Recipe } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { RecipeCard } from '../../components/ui/RecipeCard';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorView } from '../../components/ui/ErrorView';
import { EmptyState } from '../../components/ui/EmptyState';

export default function FrigoScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { recipes, loading, error, refetch } = useRecipes();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState<Recipe[] | null>(null);

  const addIngredient = useCallback(() => {
    const trimmed = ingredientInput.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setIngredientInput('');
  }, [ingredientInput, ingredients]);

  const removeIngredient = useCallback((ingredient: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
    setMatchedRecipes(null);
  }, []);

  const findRecipes = useCallback(() => {
    if (ingredients.length === 0 || !recipes) return;
    const matched = recipes.filter((recipe) =>
      ingredients.every((ingredient) =>
        recipe.ingredients.some((ri) =>
          ri.name.toLowerCase().includes(ingredient)
        )
      )
    );
    setMatchedRecipes(matched);
  }, [ingredients, recipes]);

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.id}`);
    },
    [router]
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  const displayRecipes = matchedRecipes ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="search" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Frigo Magique
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ajoutez vos ingredients et trouvez des recettes
        </Text>
      </View>

      <View style={[styles.inputRow, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Ajouter un ingredient..."
          placeholderTextColor={colors.textSecondary}
          value={ingredientInput}
          onChangeText={setIngredientInput}
          onSubmitEditing={addIngredient}
          returnKeyType="done"
          accessibilityLabel="Ajouter un ingredient"
          accessibilityHint="Tapez un ingredient puis appuyez sur Entree"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addIngredient}
          accessibilityLabel="Ajouter"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {ingredients.length > 0 && (
        <View style={styles.ingredientsContainer}>
          <FlatList
            data={ingredients}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.ingredientChip,
                  { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.ingredientText, { color: colors.primary }]}>
                  {item}
                </Text>
                <TouchableOpacity
                  onPress={() => removeIngredient(item)}
                  accessibilityLabel={`Supprimer ${item}`}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.chipsList}
          />
          <TouchableOpacity
            style={[styles.findButton, { backgroundColor: colors.primary }]}
            onPress={findRecipes}
            disabled={ingredients.length === 0}
            accessibilityLabel="Trouver des recettes"
            accessibilityHint="Rechercher des recettes correspondant aux ingredients"
            accessibilityRole="button"
          >
            <Ionicons name="restaurant" size={20} color="#FFFFFF" />
            <Text style={styles.findButtonText}>
              Trouver des recettes ({ingredients.length} ingredient{ingredients.length > 1 ? 's' : ''})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {matchedRecipes !== null && (
        <View style={styles.resultsSection}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            {displayRecipes.length} recette{displayRecipes.length !== 1 ? 's' : ''} trouvee{displayRecipes.length !== 1 ? 's' : ''}
          </Text>
          {displayRecipes.length === 0 ? (
            <EmptyState
              icon="sad-outline"
              message="Aucune recette ne correspond a vos ingredients"
            />
          ) : (
            <FlatList
              data={displayRecipes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RecipeCard
                  recipe={item}
                  onPress={() => handleRecipePress(item)}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </View>
      )}
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
    paddingBottom: 8,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chipsList: {
    gap: 8,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  ingredientText: {
    fontSize: 14,
    fontWeight: '500',
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsSection: {
    flex: 1,
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
});