import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as AuthService from '../../services/AuthService';
import * as RecipeService from '../../services/RecipeService';
import * as GalleryService from '../../services/GalleryService';
import { Colors } from '../../constants/Colors';

interface Stats {
  totalRecipes: number;
  totalImages: number;
  featured: number;
  premium: number;
}

export default function AdminDashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await AuthService.isAuthenticated();
    if (!authenticated) {
      router.replace('/admin/login');
      return;
    }
    loadStats();
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');

      const [recipes, images] = await Promise.all([
        RecipeService.getRecipes(),
        GalleryService.getGalleryImages(),
      ]);

      setStats({
        totalRecipes: recipes.length,
        totalImages: images.length,
        featured: recipes.filter((r) => r.is_featured).length,
        premium: recipes.filter((r) => r.is_premium).length,
      });
    } catch {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Deconnexion', 'Voulez-vous vous deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Deconnecter',
        style: 'destructive',
        onPress: async () => {
          await AuthService.logout();
          router.replace('/admin/login');
        },
      },
    ]);
  };

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
          onPress={loadStats}
          accessibilityLabel="Reessayer"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Reessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Tableau de bureau</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Gerez votre application
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.error }]}
          accessibilityLabel="Se deconnecter"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Deconnexion</Text>
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalRecipes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Recettes
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="images-outline" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalImages}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Images
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FFD700' + '20' }]}>
              <Ionicons name="star-outline" size={24} color="#FFD700" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.featured}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Vedettes
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#9B59B6' + '20' }]}>
              <Ionicons name="diamond-outline" size={24} color="#9B59B6" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.premium}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Premium
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions rapides</Text>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card }]}
          onPress={() => router.push('/admin/recipes')}
          accessibilityLabel="Gerer les recettes"
          accessibilityRole="button"
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="list-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              Gerer les recettes
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Voir, modifier et supprimer
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card }]}
          onPress={() => router.push('/admin/add')}
          accessibilityLabel="Ajouter une recette"
          accessibilityRole="button"
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="add-circle-outline" size={24} color={colors.success} />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              Ajouter une recette
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Creer une nouvelle recette
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 13,
  },
});