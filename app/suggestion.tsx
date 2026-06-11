import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/Colors';
import { CATEGORIES, DIFFICULTIES } from '../constants/Config';
import { Recipe } from '../types';
import { useRecipeSearch, useRecipesByCategory } from '../hooks/useRecipes';
import { RecipeCard } from '../components/ui/RecipeCard';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { ErrorView } from '../components/ui/ErrorView';
import { EmptyState } from '../components/ui/EmptyState';

type SortOption = 'name' | 'date' | 'difficulty' | 'prep_time';

export default function SuggestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState(params.query ?? '');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [hasSearched, setHasSearched] = useState(false);

  const { results: searchResults, loading: searchLoading, error: searchError, search } = useRecipeSearch();
  const { recipes: categoryRecipes, loading: catLoading, error: catError } =
    useRecipesByCategory(selectedCategory);

  const isSearchMode = hasSearched && searchQuery.trim().length > 0;

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      search(searchQuery.trim());
    }
  }, [searchQuery, search]);

  useEffect(() => {
    if (params.query && params.query.trim()) {
      setSearchQuery(params.query);
      setHasSearched(true);
      search(params.query);
    }
  }, [params.query]);

  const sortRecipes = useCallback(
    (recipesToSort: Recipe[]): Recipe[] => {
      const sorted = [...recipesToSort];
      switch (sortBy) {
        case 'name':
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'date':
          return sorted.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case 'difficulty':
          return sorted.sort((a, b) => {
            const order: Record<string, number> = { Facile: 1, Moyen: 2, Difficile: 3 };
            return (order[a.difficulty] ?? 2) - (order[b.difficulty] ?? 2);
          });
        case 'prep_time':
          return sorted.sort((a, b) => a.prep_time - b.prep_time);
        default:
          return sorted;
      }
    },
    [sortBy]
  );

  const displayRecipes = isSearchMode
    ? sortRecipes(searchResults)
    : sortRecipes(categoryRecipes);

  const loading = isSearchMode ? searchLoading : catLoading;
  const error = isSearchMode ? searchError : catError;

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.id}`);
    },
    [router]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Suggestions
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Rechercher une recette..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          accessibilityLabel="Rechercher"
          accessibilityHint="Entrez votre recherche"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setHasSearched(false);
            }}
            accessibilityLabel="Effacer"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedCategory === category ? colors.primary : colors.card,
                borderColor:
                  selectedCategory === category ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
            accessibilityLabel={`Catégorie ${category}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === category }}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedCategory === category ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>
          Trier par :
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'name' as SortOption, label: 'Nom', icon: 'sort-alphabetical' },
            { key: 'date' as SortOption, label: 'Date', icon: 'calendar-outline' },
            { key: 'difficulty' as SortOption, label: 'Difficulte', icon: 'speedometer-outline' },
            { key: 'prep_time' as SortOption, label: 'Temps', icon: 'time-outline' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                {
                  backgroundColor:
                    sortBy === option.key ? colors.primary : colors.card,
                  borderColor: sortBy === option.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSortBy(option.key)}
              accessibilityLabel={`Trier par ${option.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: sortBy === option.key }}
            >
              <Ionicons
                name={option.icon as any}
                size={14}
                color={sortBy === option.key ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.sortText,
                  {
                    color: sortBy === option.key ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <ErrorView message={error} onRetry={handleSearch} />
      ) : displayRecipes.length === 0 ? (
        <EmptyState
          icon="search-outline"
          message="Aucune recette trouvee"
        />
      ) : (
        <FlatList
          data={displayRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
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
  filtersRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
});