import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function AboutScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const socialLinks = [
    {
      name: 'Instagram',
      icon: 'logo-instagram' as const,
      url: 'https://instagram.com/akelloulou',
      color: '#E4405F',
    },
    {
      name: 'Facebook',
      icon: 'logo-facebook' as const,
      url: 'https://facebook.com/akelloulou',
      color: '#1877F2',
    },
    {
      name: 'YouTube',
      icon: 'logo-youtube' as const,
      url: 'https://youtube.com/@akelloulou',
      color: '#FF0000',
    },
    {
      name: 'TikTok',
      icon: 'logo-tiktok' as const,
      url: 'https://tiktok.com/@akelloulou',
      color: '#000000',
    },
  ];

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.card }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Logo Akel Loulou"
          />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>
          Akel Loulou
        </Text>
        <Text style={[styles.tagline, { color: colors.text }]}>
          Les Recettes de Tante Lau
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Ionicons
          name="book-outline"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          A propos
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Bienvenue dans Akel Loulou, votre guide ultime de la cuisine
          libanaise authentique. Decouvrez des recettes traditionnelles
          transmises de generation en generation, des entrees aux desserts,
          en passant par les plats festifs qui font la richesse de la table
          libanaise. Chaque recette est soigneusement documentee pour vous
          permettre de reproduire chez vous les saveurs du Liban.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Ionicons
          name="restaurant-outline"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Nos Recettes
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Notre collection inclut des entrees froides et chaudes, des plats
          principaux, des desserts traditionnels, des boissons rafraichissantes
          et des recettes festives pour les grandes occasions.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Ionicons
          name="share-social-outline"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Suivez-nous
        </Text>
        <View style={styles.socialRow}>
          {socialLinks.map((link) => (
            <TouchableOpacity
              key={link.name}
              style={[styles.socialButton, { backgroundColor: link.color }]}
              onPress={() => openLink(link.url)}
              accessibilityLabel={link.name}
              accessibilityHint={`Ouvrir ${link.name}`}
              accessibilityRole="link"
            >
              <Ionicons name={link.icon} size={24} color="#FFFFFF" />
              <Text style={styles.socialText}>{link.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.versionContainer, { borderColor: colors.border }]}>
        <Ionicons name="code-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Version 1.0.0
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Fait avec amour pour la cuisine libanaise
        </Text>
        <Ionicons name="heart" size={16} color={colors.primary} />
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
    paddingTop: 32,
    paddingBottom: 16,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  socialText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  versionText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
  },
});