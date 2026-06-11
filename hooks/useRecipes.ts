import { useState, useEffect } from 'react';
import { Recipe } from '../types';
import {
  getRecipes,
  getFeaturedRecipes,
  getRecipesByCategory,
  searchRecipes,
} from '../services/RecipeService';

interface UseRecipesResult {
  recipes: Recipe[];
  featured: Recipe[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecipes(): UseRecipesResult {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [featured, setFeatured] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRecipes, featuredRecipes] = await Promise.all([
        getRecipes(),
        getFeaturedRecipes(),
      ]);
      setRecipes(allRecipes);
      setFeatured(featuredRecipes);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors du chargement des recettes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { recipes, featured, loading, error, refetch: fetchData };
}

interface UseRecipesByCategoryResult {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecipesByCategory(category: string): UseRecipesByCategoryResult {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipesByCategory(category);
      setRecipes(data);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors du chargement des recettes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  return { recipes, loading, error, refetch: fetchData };
}

interface UseSearchResult {
  results: Recipe[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
}

export function useRecipeSearch(): UseSearchResult {
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchRecipes(query);
      setResults(data);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}