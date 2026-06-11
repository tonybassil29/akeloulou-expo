import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CATEGORIES } from '../../constants/Config';
import { Recipe } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { RecipeCard } from '../../components/ui/RecipeCard';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorView } from '../../components/ui/ErrorView';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { recipes, featured, loading, error, refetch } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/suggestion',
        params: { query: searchQuery.trim() },
      });
    }
  }, [searchQuery, router]);

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.id}`);
    },
    [router]
  );

  const filteredRecipes =
    selectedCategory === 'Toutes'
      ? recipes
      : recipes.filter((r) => r.category === selectedCategory);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Logo Akel Loulou"
        />
        <Text style={[styles.title, { color: colors.primary }]}>
          Akel Loulou
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Les Recettes de Tante Lau
        </Text>
      </View>

      <View
        style={[styles.searchContainer, { backgroundColor: colors.card }]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Rechercher une recette..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          accessibilityLabel="Rechercher une recette"
          accessibilityHint="Tapez une recherche puis appuyez sur Entrée"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Effacer la recherche"
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedCategory === category
                    ? colors.primary
                    : colors.card,
                borderColor:
                  selectedCategory === category
                    ? colors.primary
                    : colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
            accessibilityLabel={`Catégorie ${category}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === category }}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    selectedCategory === category
                      ? '#FFFFFF'
                      : colors.text,
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory === 'Toutes' && featured.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recettes en vedette
          </Text>
          <FlatList
            horizontal
            data={featured}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.featuredCard}>
                <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Nouvelles recettes
        </Text>
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          contentContainerStyle={styles.recipesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune recette trouvée
              </Text>
            </View>
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
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
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredCard: {
    width: 260,
  },
  recipesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cardSeparator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});