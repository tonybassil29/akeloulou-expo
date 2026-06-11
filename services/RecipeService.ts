import { supabase } from '../lib/supabase';
import { Recipe, RecipeFormData } from '../types';

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('hidden', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('hidden', false)
    .single();

  if (error) throw error;
  return data;
}

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data ?? [];
}

export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('hidden', false)
    .order('created_at', { ascending: false });

  if (category !== 'Toutes') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('hidden', false)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('category')
    .eq('hidden', false);

  if (error) throw error;

  const uniqueCategories = [...new Set(data?.map((r) => r.category) ?? [])];
  return uniqueCategories.sort();
}

export async function createRecipe(recipe: RecipeFormData): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRecipe(id: string, recipe: Partial<RecipeFormData>): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .update({ ...recipe, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRecipeByIdAdmin(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}