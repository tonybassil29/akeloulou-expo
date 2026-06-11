import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useRecipe } from '../../hooks/useRecipe';
import { useFavorites } from '../../hooks/useFavorites';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorView } from '../../components/ui/ErrorView';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { recipe, loading, error, refetch } = useRecipe(id ?? '');
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorite = recipe ? isFavorite(recipe.id) : false;

  const handleToggleFavorite = useCallback(() => {
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  }, [recipe, toggleFavorite]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;
  if (!recipe) return <ErrorView message="Recette introuvable" onRetry={refetch} />;

  const difficultyColor =
    recipe.difficulty === 'Facile'
      ? colors.success
      : recipe.difficulty === 'Moyen'
        ? '#FFA500'
        : colors.error;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.favButton, { backgroundColor: colors.card }]}
          onPress={handleToggleFavorite}
          accessibilityLabel={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          accessibilityRole="button"
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={favorite ? colors.primary : colors.text}
          />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: recipe.image_url }}
        style={styles.heroImage}
        contentFit="cover"
        transition={300}
        accessibilityLabel={`Image de ${recipe.title}`}
      />

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
        </View>

        <View style={styles.badges}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
            </Text>
          </View>
          {recipe.country ? (
            <View style={[styles.categoryBadge, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="globe-outline" size={14} color={colors.secondary} />
              <Text style={[styles.badgeText, { color: colors.secondary }]}>{recipe.country}</Text>
            </View>
          ) : null}
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
            <Ionicons name="speedometer-outline" size={14} color={difficultyColor} />
            <Text style={[styles.badgeText, { color: difficultyColor }]}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        <View style={[styles.metaRow, { backgroundColor: colors.card }]}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              Prep
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {recipe.prep_time} min
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={20} color={colors.primary} />
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              Cuisson
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {recipe.cook_time} min
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              Portions
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {recipe.servings}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Ingredients
        </Text>
        <View style={[styles.ingredientsCard, { backgroundColor: colors.card }]}>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={[styles.ingredientBullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.ingredientText, { color: colors.text }]}>
                {ingredient}
              </Text>
            </View>
          ))}
        </View>

        {recipe.spices && recipe.spices.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Epices
            </Text>
            <View style={[styles.ingredientsCard, { backgroundColor: colors.card }]}>
              {recipe.spices.map((spice, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={[styles.ingredientBullet, { backgroundColor: colors.secondary }]} />
                  <Text style={[styles.ingredientText, { color: colors.text }]}>
                    {spice}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {recipe.equipment && recipe.equipment.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Equipement
            </Text>
            <View style={[styles.ingredientsCard, { backgroundColor: colors.card }]}>
              {recipe.equipment.map((eq, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={[styles.ingredientBullet, { backgroundColor: '#FFA500' }]} />
                  <Text style={[styles.ingredientText, { color: colors.text }]}>
                    {eq.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Preparation
        </Text>
        <View style={[styles.stepsCard, { backgroundColor: colors.card }]}>
          {recipe.instructions.split('\n').filter((line) => line.trim()).map((instruction, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>{instruction}</Text>
            </View>
          ))}
        </View>

        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {recipe.tags.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: colors.secondary + '20' }]}
              >
                <Text style={[styles.tagText, { color: colors.secondary }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  favButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 12,
    padding: 16,
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  ingredientsCard: {
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ingredientText: {
    fontSize: 15,
    flex: 1,
  },
  stepsCard: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
});