import { supabase } from '../lib/supabase';
import { GalleryImage } from '../types';

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
  let query = supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false });

  if (category !== 'Toutes') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}