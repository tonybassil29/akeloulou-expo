import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { CATEGORIES } from '../../constants/Config';
import { GalleryImage } from '../../types';
import { useGallery } from '../../hooks/useGallery';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorView } from '../../components/ui/ErrorView';
import { EmptyState } from '../../components/ui/EmptyState';

export default function GalleryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const { images, loading, error, refetch } = useGallery(selectedCategory);

  const filteredImages =
    selectedCategory === 'Toutes'
      ? images
      : images.filter((img) => img.category === selectedCategory);

  const renderItem = useCallback(
    ({ item }: { item: GalleryImage }) => (
      <TouchableOpacity
        style={[styles.imageCard, { backgroundColor: colors.card }]}
        activeOpacity={0.8}
        accessibilityLabel={item.caption || 'Image de galerie'}
        accessibilityHint="Appuyez pour agrandir"
        accessibilityRole="imagebutton"
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          accessibilityLabel={item.caption}
        />
        {item.caption ? (
          <View style={[styles.captionContainer, { backgroundColor: colors.card }]}>
            <Text
              style={[styles.captionText, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.caption}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    ),
    [colors]
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Galerie</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Photos de nos recettes
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {['Toutes', ...CATEGORIES.filter((c) => c !== 'Toutes')].map(
          (category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
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
              accessibilityLabel={`Filtrer par ${category}`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === category }}
            >
              <Text
                style={[
                  styles.filterText,
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
          )
        )}
      </ScrollView>

      {filteredImages.length === 0 ? (
        <EmptyState
          icon="images-outline"
          message="Aucune image dans cette catégorie"
        />
      ) : (
        <FlatList
          data={filteredImages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  filterContainer: {
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
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    gap: 12,
  },
  imageCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  captionContainer: {
    padding: 10,
  },
  captionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});