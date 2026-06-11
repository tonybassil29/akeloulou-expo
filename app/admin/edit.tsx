import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as AuthService from '../../services/AuthService';
import { getRecipeByIdAdmin, updateRecipe as updateRecipeService, deleteRecipe as deleteRecipeService } from '../../services/RecipeService';
import * as CloudinaryService from '../../services/CloudinaryService';
import { CATEGORIES, DIFFICULTIES } from '../../constants/Config';
import { RecipeFormData } from '../../types';
import { Colors } from '../../constants/Colors';

export default function AdminEditScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hidden, setHidden] = useState(false);
  const [country, setCountry] = useState('');
  const [spices, setSpices] = useState('');
  const [showPortions, setShowPortions] = useState(false);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryModal, setCategoryModal] = useState(false);
  const [difficultyModal, setDifficultyModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await AuthService.isAuthenticated();
    if (!authenticated) {
      router.replace('/admin/login');
      return;
    }
    if (id) {
      loadRecipe();
    }
  };

  const loadRecipe = async () => {
    try {
      setLoadingRecipe(true);
      const recipe = await getRecipeByIdAdmin(id);
      if (recipe) {
        setTitle(recipe.title);
        setDescription(recipe.description ?? '');
        setCategory(recipe.category);
        setPrepTime(String(recipe.prep_time ?? ''));
        setCookTime(String(recipe.cook_time ?? ''));
        setServings(String(recipe.servings));
        setDifficulty(recipe.difficulty ?? '');
        setIngredients(
          recipe.ingredients.length > 0
            ? recipe.ingredients
            : ['']
        );
        setInstructions(recipe.instructions ?? '');
        setImageUrl(recipe.image_url);
        setHidden(recipe.hidden);
        setCountry(recipe.country ?? '');
        setSpices(recipe.spices.join(', '));
        setShowPortions(recipe.show_portions);
        setTags(recipe.tags.join(', '));
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger la recette');
      router.back();
    } finally {
      setLoadingRecipe(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Titre requis';
    if (!description.trim()) newErrors.description = 'Description requise';
    if (!category) newErrors.category = 'Categorie requise';
    if (!prepTime) newErrors.prepTime = 'Temps de preparation requis';
    if (!cookTime) newErrors.cookTime = 'Temps de cuisson requis';
    if (!servings) newErrors.servings = 'Portions requises';
    if (!difficulty) newErrors.difficulty = 'Difficulte requise';
    if (!imageUrl) newErrors.imageUrl = 'Image requise';
    const validIngredients = ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) newErrors.ingredients = 'Au moins un ingredient requis';
    if (!instructions.trim()) newErrors.instructions = 'Instructions requises';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const url = await CloudinaryService.uploadImage(result.assets[0].uri);
        setImageUrl(url);
      } catch {
        Alert.alert('Erreur', "Erreur lors de l'upload de l'image");
      } finally {
        setUploading(false);
      }
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const handleUpdate = async () => {
    if (!validate()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      const recipeData: Partial<RecipeFormData> = {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        category,
        prep_time: Number(prepTime),
        cook_time: Number(cookTime),
        servings: Number(servings),
        difficulty,
        ingredients: ingredients.filter((i) => i.trim()),
        instructions: instructions.trim(),
        hidden,
        country: country.trim() || null,
        is_secondary: false,
        show_portions: showPortions,
        spices: spices ? spices.split(',').map((s) => s.trim()).filter((s) => s) : [],
        equipment: [],
        related_recipes: null,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
      };

      await updateRecipeService(id, recipeData);
      Alert.alert('Succes', 'Recette mise a jour avec succes', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre a jour la recette');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(() => {
    Alert.alert('Supprimer la recette', 'Voulez-vous vraiment supprimer cette recette ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecipeService(id);
            router.back();
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer la recette');
          }
        },
      },
    ]);
  }, [id]);

  if (loadingRecipe) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Retour" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Modifier la recette</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Titre *</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: errors.title ? colors.error : colors.border, backgroundColor: colors.background }]}
          placeholder="Titre de la recette"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
          accessibilityLabel="Titre de la recette"
        />
        {errors.title ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.title}</Text> : null}
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
        <TextInput
          style={[styles.textArea, { color: colors.text, borderColor: errors.description ? colors.error : colors.border, backgroundColor: colors.background }]}
          placeholder="Description de la recette"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); }}
          multiline
          numberOfLines={4}
          accessibilityLabel="Description"
        />
        {errors.description ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.description}</Text> : null}
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Categorie *</Text>
        <TouchableOpacity
          style={[styles.pickerButton, { borderColor: errors.category ? colors.error : colors.border, backgroundColor: colors.background }]}
          onPress={() => setCategoryModal(true)}
          accessibilityLabel="Selectionner une categorie"
          accessibilityRole="button"
        >
          <Text style={[styles.pickerText, { color: category ? colors.text : colors.textSecondary }]}>
            {category || 'Selectionner...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        {errors.category ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.category}</Text> : null}
      </View>

      <Modal visible={categoryModal} transparent animationType="fade" onRequestClose={() => setCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choisir une categorie</Text>
            {CATEGORIES.filter((c) => c !== 'Toutes').map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.modalOption, { borderColor: colors.border }]}
                onPress={() => { setCategory(cat); setCategoryModal(false); setErrors((e) => ({ ...e, category: '' })); }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{cat}</Text>
                {category === cat && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.modalCancel, { borderColor: colors.border }]} onPress={() => setCategoryModal(false)}>
              <Text style={{ color: colors.textSecondary }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.row}>
        <View style={[styles.formGroup, { backgroundColor: colors.card }, styles.halfInput]}>
          <Text style={[styles.label, { color: colors.text }]}>Prep (min) *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: errors.prepTime ? colors.error : colors.border, backgroundColor: colors.background }]}
            placeholder="15"
            placeholderTextColor={colors.textSecondary}
            value={prepTime}
            onChangeText={(t) => { setPrepTime(t); setErrors((e) => ({ ...e, prepTime: '' })); }}
            keyboardType="number-pad"
            accessibilityLabel="Temps de preparation en minutes"
          />
          {errors.prepTime ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.prepTime}</Text> : null}
        </View>
        <View style={[styles.formGroup, { backgroundColor: colors.card }, styles.halfInput]}>
          <Text style={[styles.label, { color: colors.text }]}>Cuisson (min) *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: errors.cookTime ? colors.error : colors.border, backgroundColor: colors.background }]}
            placeholder="30"
            placeholderTextColor={colors.textSecondary}
            value={cookTime}
            onChangeText={(t) => { setCookTime(t); setErrors((e) => ({ ...e, cookTime: '' })); }}
            keyboardType="number-pad"
            accessibilityLabel="Temps de cuisson en minutes"
          />
          {errors.cookTime ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.cookTime}</Text> : null}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { backgroundColor: colors.card }, styles.halfInput]}>
          <Text style={[styles.label, { color: colors.text }]}>Portions *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: errors.servings ? colors.error : colors.border, backgroundColor: colors.background }]}
            placeholder="4"
            placeholderTextColor={colors.textSecondary}
            value={servings}
            onChangeText={(t) => { setServings(t); setErrors((e) => ({ ...e, servings: '' })); }}
            keyboardType="number-pad"
            accessibilityLabel="Nombre de portions"
          />
          {errors.servings ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.servings}</Text> : null}
        </View>
        <View style={[styles.formGroup, { backgroundColor: colors.card }, styles.halfInput]}>
          <Text style={[styles.label, { color: colors.text }]}>Difficulte *</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { borderColor: errors.difficulty ? colors.error : colors.border, backgroundColor: colors.background }]}
            onPress={() => setDifficultyModal(true)}
            accessibilityLabel="Selectionner la difficulte"
            accessibilityRole="button"
          >
            <Text style={[styles.pickerText, { color: difficulty ? colors.text : colors.textSecondary }]}>
              {difficulty || 'Choisir...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {errors.difficulty ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.difficulty}</Text> : null}
        </View>
      </View>

      <Modal visible={difficultyModal} transparent animationType="fade" onRequestClose={() => setDifficultyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choisir la difficulte</Text>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.modalOption, { borderColor: colors.border }]}
                onPress={() => { setDifficulty(d); setDifficultyModal(false); setErrors((e) => ({ ...e, difficulty: '' })); }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{d}</Text>
                {difficulty === d && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.modalCancel, { borderColor: colors.border }]} onPress={() => setDifficultyModal(false)}>
              <Text style={{ color: colors.textSecondary }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: colors.text }]}>Ingredients *</Text>
          <TouchableOpacity onPress={addIngredient} accessibilityLabel="Ajouter un ingredient" accessibilityRole="button">
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.dynamicRow}>
            <TextInput
              style={[styles.ingredientInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="300g de farine"
              placeholderTextColor={colors.textSecondary}
              value={ingredient}
              onChangeText={(v) => updateIngredient(index, v)}
              accessibilityLabel={`Ingredient ${index + 1}`}
            />
            {ingredients.length > 1 && (
              <TouchableOpacity onPress={() => removeIngredient(index)} accessibilityLabel={`Supprimer ingredient ${index + 1}`}>
                <Ionicons name="remove-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {errors.ingredients ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.ingredients}</Text> : null}
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Instructions *</Text>
        <TextInput
          style={[styles.textArea, { color: colors.text, borderColor: errors.instructions ? colors.error : colors.border, backgroundColor: colors.background }]}
          placeholder="Ecrivez chaque etape sur une nouvelle ligne"
          placeholderTextColor={colors.textSecondary}
          value={instructions}
          onChangeText={(t) => { setInstructions(t); setErrors((e) => ({ ...e, instructions: '' })); }}
          multiline
          numberOfLines={8}
          accessibilityLabel="Instructions de la recette"
        />
        {errors.instructions ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.instructions}</Text> : null}
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Image *</Text>
        <TouchableOpacity
          style={[styles.imagePicker, { borderColor: errors.imageUrl ? colors.error : colors.border, backgroundColor: colors.background }]}
          onPress={pickImage}
          disabled={uploading}
          accessibilityLabel="Choisir une image"
          accessibilityRole="button"
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} contentFit="cover" transition={200} />
          ) : uploading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.imagePickerText, { color: colors.textSecondary }]}>
                Choisir une image
              </Text>
            </>
          )}
        </TouchableOpacity>
        {errors.imageUrl ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.imageUrl}</Text> : null}
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.text }]}>Masquee</Text>
          <Switch value={hidden} onValueChange={setHidden} trackColor={{ false: colors.border, true: colors.error }} thumbColor="#FFFFFF" accessibilityLabel="Masquer la recette" />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.text }]}>Afficher les portions</Text>
          <Switch value={showPortions} onValueChange={setShowPortions} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" accessibilityLabel="Afficher les portions" />
        </View>
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Pays</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Ex: Liban"
          placeholderTextColor={colors.textSecondary}
          value={country}
          onChangeText={setCountry}
          accessibilityLabel="Pays d'origine"
        />
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Epices</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Epices separees par des virgules"
          placeholderTextColor={colors.textSecondary}
          value={spices}
          onChangeText={setSpices}
          accessibilityLabel="Epices separees par des virgules"
        />
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Tags separes par des virgules"
          placeholderTextColor={colors.textSecondary}
          value={tags}
          onChangeText={setTags}
          accessibilityLabel="Tags separes par des virgules"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleUpdate}
        disabled={submitting}
        accessibilityLabel="Mettre a jour la recette"
        accessibilityRole="button"
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Mettre a jour</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, { borderColor: colors.error }]}
        onPress={handleDelete}
        accessibilityLabel="Supprimer la recette"
        accessibilityRole="button"
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
        <Text style={[styles.deleteButtonText, { color: colors.error }]}>
          Supprimer cette recette
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  formGroup: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  pickerText: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dynamicRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  ingredientInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 38,
    fontSize: 13,
  },
  imagePicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePickerText: {
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  errorText: {
    fontSize: 12,
  },
  submitButton: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  deleteButton: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});