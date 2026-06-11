import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as AuthService from '../../services/AuthService';
import { Colors } from '../../constants/Colors';

export default function AdminLoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await AuthService.login(username.trim(), password.trim());
      if (success) {
        router.replace('/admin');
      } else {
        setError('Identifiants incorrects');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Ionicons name="lock-closed" size={64} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Administration</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Akel Loulou
        </Text>
      </View>

      <View style={[styles.form, { backgroundColor: colors.card }]}>
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Nom d'utilisateur"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Nom d'utilisateur"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Mot de passe"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Mot de passe"
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={loading}
          accessibilityLabel="Se connecter"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Se connecter</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    borderRadius: 16,
    padding: 24,
    gap: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  loginButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});