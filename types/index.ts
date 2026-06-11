export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  image_url?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  ingredients: Ingredient[];
  steps: string[];
  video_url?: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_premium: boolean;
  tags: string[];
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  category: string;
  created_at: string;
}

export interface MenuSlot {
  day: string;
  meal: 'petit-dejeuner' | 'dejeuner' | 'diner';
  recipeId?: string;
  recipe?: Recipe;
}

export interface RecipeFormData {
  name: string;
  description: string;
  image_url: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  ingredients: Ingredient[];
  steps: string[];
  video_url?: string;
  is_featured: boolean;
  is_premium: boolean;
  tags: string[];
}