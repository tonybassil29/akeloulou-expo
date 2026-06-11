import { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { getRecipeById } from '../services/RecipeService';

interface UseRecipeResult {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecipe(id: string): UseRecipeResult {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipeById(id);
      setRecipe(data);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors du chargement de la recette');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  return { recipe, loading, error, refetch: fetchRecipe };
}