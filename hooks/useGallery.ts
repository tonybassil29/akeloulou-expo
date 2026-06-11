import { useState, useEffect } from 'react';
import { GalleryImage } from '../types';
import {
  getGalleryImages,
  getGalleryImagesByCategory,
} from '../services/GalleryService';

interface UseGalleryResult {
  images: GalleryImage[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGallery(category: string = 'Toutes'): UseGalleryResult {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        category === 'Toutes'
          ? await getGalleryImages()
          : await getGalleryImagesByCategory(category);
      setImages(data);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors du chargement de la galerie');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [category]);

  return { images, loading, error, refetch: fetchImages };
}