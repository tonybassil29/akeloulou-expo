export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  prep_time: number | null;
  cook_time: number | null;
  servings: number;
  difficulty: string | null;
  ingredients: string[];
  instructions: string;
  country: string | null;
  hidden: boolean;
  is_secondary: boolean;
  show_portions: boolean;
  spices: string[];
  equipment: { name: string; image_url: string }[];
  related_recipes: { id: string; title: string }[] | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  recipe_id: string | null;
  name: string | null;
  created_at: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface MenuSlot {
  day: string;
  meal: string;
  recipeId?: string;
  recipe?: Recipe;
}

export interface RecipeFormData {
  title: string;
  description: string;
  image_url: string;
  category: string;
  prep_time: number | null;
  cook_time: number | null;
  servings: number;
  difficulty: string | null;
  ingredients: string[];
  instructions: string;
  country: string | null;
  hidden: boolean;
  is_secondary: boolean;
  show_portions: boolean;
  spices: string[];
  equipment: { name: string; image_url: string }[];
  related_recipes: { id: string; title: string }[] | null;
  tags: string[];
}