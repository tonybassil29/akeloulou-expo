import { supabase } from '../lib/supabase';
import { GalleryImage } from '../types';

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getGalleryImagesByCategory(_category: string): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}