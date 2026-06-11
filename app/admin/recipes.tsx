import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as AuthService from '../../services/AuthService';
import { getAllRecipes, deleteRecipe } from '../../services/RecipeService';
import { Recipe } from '../../types';
import { Colors } from '../../constants/Colors';

export default function AdminRecipesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const filtered = recipes.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  }, [searchQuery, recipes]);

  const checkAuth = async () => {
    const authenticated = await AuthService.isAuthenticated();
    if (!authenticated) {
      router.replace('/admin/login');
      return;
    }
    loadRecipes();
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllRecipes();
      setRecipes(data);
      setFilteredRecipes(data);
    } catch {
      setError('Erreur lors du chargement des recettes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(
    (recipe: Recipe) => {
      Alert.alert(
        'Supprimer la recette',
        `Voulez-vous vraiment supprimer "${recipe.title}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteRecipe(recipe.id);
                setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
              } catch {
                Alert.alert('Erreur', 'Impossible de supprimer la recette');
              }
            },
          },
        ]
      );
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <View style={[styles.recipeItem, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.recipeImage}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`Image de ${item.title}`}
        />
        <View style={styles.recipeInfo}>
          <Text style={[styles.recipeName, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.recipeCategory, { color: colors.textSecondary }]}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
          <View style={styles.recipeBadges}>
            {item.hidden && (
              <View style={[styles.badge, { backgroundColor: '#FFD700' + '20' }]}>
                <Text style={[styles.badgeText, { color: '#FFD700' }]}>Masquee</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.recipeActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => router.push({ pathname: '/admin/edit', params: { id: item.id } })}
            accessibilityLabel={`Modifier ${item.title}`}
            accessibilityRole="button"
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.error + '20' }]}
            onPress={() => handleDelete(item)}
            accessibilityLabel={`Supprimer ${item.title}`}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [colors, handleDelete]
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadRecipes}
          accessibilityLabel="Reessayer"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Reessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Retour" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recettes</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Rechercher une recette..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Rechercher"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Effacer la recherche">
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucune recette trouvee
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/admin/add')}
        accessibilityLabel="Ajouter une recette"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  recipeInfo: {
    flex: 1,
    gap: 2,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  recipeCategory: {
    fontSize: 13,
  },
  recipeBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});