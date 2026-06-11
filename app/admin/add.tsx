import React, { useEffect, useState } from 'react';
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
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as AuthService from '../../services/AuthService';
import * as RecipeService from '../../services/RecipeService';
import * as CloudinaryService from '../../services/CloudinaryService';
import { CATEGORIES, DIFFICULTIES } from '../../constants/Config';
import { Ingredient, RecipeFormData } from '../../types';
import { Colors } from '../../constants/Colors';

export default function AdminAddScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '', unit: '' },
  ]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nom requis';
    if (!description.trim()) newErrors.description = 'Description requise';
    if (!category) newErrors.category = 'Categorie requise';
    if (!prepTime) newErrors.prepTime = 'Temps de preparation requis';
    if (!cookTime) newErrors.cookTime = 'Temps de cuisson requis';
    if (!servings) newErrors.servings = 'Portions requises';
    if (!difficulty) newErrors.difficulty = 'Difficulte requise';
    if (!imageUrl) newErrors.imageUrl = 'Image requise';
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) newErrors.ingredients = 'Au moins un ingredient requis';
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) newErrors.steps = 'Au moins une etape requise';
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
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      const recipeData: RecipeFormData = {
        name: name.trim(),
        description: description.trim(),
        image_url: imageUrl,
        category,
        prep_time: Number(prepTime),
        cook_time: Number(cookTime),
        servings: Number(servings),
        difficulty,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.trim()),
        is_featured: isFeatured,
        is_premium: isPremium,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
      };

      await RecipeService.createRecipe(recipeData);
      Alert.alert('Succes', 'Recette ajoutee avec succes', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erreur', "Impossible d'ajouter la recette");
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ajouter une recette</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Nom *</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: errors.name ? colors.error : colors.border, backgroundColor: colors.background }]}
          placeholder="Nom de la recette"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
          accessibilityLabel="Nom de la recette"
        />
        {errors.name ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text> : null}
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
              style={[styles.ingredientName, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Nom"
              placeholderTextColor={colors.textSecondary}
              value={ingredient.name}
              onChangeText={(v) => updateIngredient(index, 'name', v)}
              accessibilityLabel={`Ingredient ${index + 1} nom`}
            />
            <TextInput
              style={[styles.ingredientQty, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Qte"
              placeholderTextColor={colors.textSecondary}
              value={ingredient.quantity}
              onChangeText={(v) => updateIngredient(index, 'quantity', v)}
              accessibilityLabel={`Ingredient ${index + 1} quantite`}
            />
            <TextInput
              style={[styles.ingredientUnit, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Unite"
              placeholderTextColor={colors.textSecondary}
              value={ingredient.unit}
              onChangeText={(v) => updateIngredient(index, 'unit', v)}
              accessibilityLabel={`Ingredient ${index + 1} unite`}
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: colors.text }]}>Etapes *</Text>
          <TouchableOpacity onPress={addStep} accessibilityLabel="Ajouter une etape" accessibilityRole="button">
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <Text style={[styles.stepNumber, { color: colors.primary }]}>{index + 1}.</Text>
            <TextInput
              style={[styles.stepInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder={`Etape ${index + 1}`}
              placeholderTextColor={colors.textSecondary}
              value={step}
              onChangeText={(v) => updateStep(index, v)}
              multiline
              accessibilityLabel={`Etape ${index + 1}`}
            />
            {steps.length > 1 && (
              <TouchableOpacity onPress={() => removeStep(index)} accessibilityLabel={`Supprimer etape ${index + 1}`}>
                <Ionicons name="remove-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {errors.steps ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.steps}</Text> : null}
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
          <Text style={[styles.label, { color: colors.text }]}>Recette vedette</Text>
          <Switch value={isFeatured} onValueChange={setIsFeatured} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" accessibilityLabel="Recette vedette" />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.text }]}>Recette premium</Text>
          <Switch value={isPremium} onValueChange={setIsPremium} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" accessibilityLabel="Recette premium" />
        </View>
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
        onPress={handleSubmit}
        disabled={submitting}
        accessibilityLabel="Ajouter la recette"
        accessibilityRole="button"
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Ajouter la recette</Text>
        )}
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
  ingredientName: {
    flex: 3,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 38,
    fontSize: 13,
  },
  ingredientQty: {
    flex: 1.5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 38,
    fontSize: 13,
  },
  ingredientUnit: {
    flex: 1.5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 38,
    fontSize: 13,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    paddingTop: 10,
    width: 20,
  },
  stepInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 38,
    textAlignVertical: 'top',
  },
  imagePicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
});