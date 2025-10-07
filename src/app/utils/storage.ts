// src/app/utils/storage.ts

import { createClient } from '@/app/utils/supabase/client';

export async function uploadRestaurantImage(
  file: File,
  restaurantId: string,
  userId: string
): Promise<string | null> {
  const supabase = createClient();

  try {
    // Genera un nome unico per il file
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${restaurantId}/${Date.now()}.${fileExt}`;

    // Upload del file
    const { data, error } = await supabase.storage
      .from('restaurant-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Ottieni l'URL pubblico
    const { data: { publicUrl } } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadRestaurantImage:', error);
    return null;
  }
}

export async function deleteRestaurantImage(imageUrl: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Estrai il path dal URL
    const url = new URL(imageUrl);
    const path = url.pathname.split('/').slice(-3).join('/'); // Prende gli ultimi 3 segmenti del path

    const { error } = await supabase.storage
      .from('restaurant-images')
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteRestaurantImage:', error);
    return false;
  }
}