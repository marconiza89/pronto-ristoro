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

const ITEM_IMAGES_BUCKET = 'item-images'

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-_]/g, '')
}

function getFileExt(name: string) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'png'
}

function extractItemImagePathFromPublicUrl(imageUrl: string) {
  // Public URL tipica: https://<proj>.supabase.co/storage/v1/object/public/item-images/<path...>
  try {
    const url = new URL(imageUrl)
    const idx = url.pathname.indexOf('/object/public/')
    if (idx === -1) return null
    // tutto dopo '/object/public/item-images/'
    const after = url.pathname.substring(idx + '/object/public/'.length)
    const segments = after.split('/')
    // prima dev’essere il bucket name
    if (segments[0] !== ITEM_IMAGES_BUCKET) return null
    return segments.slice(1).join('/')
  } catch {
    return null
  }
}

export async function uploadItemImage(
  file: File,
  userId: string,
  itemId?: string
): Promise<string | null> {
  const supabase = createClient()
  try {
    const safeName = slugifyFileName(file.name)
    const fileExt = getFileExt(safeName)
    const fileName = `${ userId }/${itemId || 'temp'}/${ Date.now() } -${ safeName }.${ fileExt }`.replace(/..+/g, '.') // safe

    const { data, error } = await supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('uploadItemImage error:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (e) {
    console.error('uploadItemImage exception:', e)
    return null
  }
}

export async function uploadItemReferenceImage(
  file: File,
  userId: string
): Promise<string | null> {
  // Carichiamo l’immagine di riferimento in una cartella separata
  const supabase = createClient()
  try {
    const safeName = slugifyFileName(file.name)
    const ext = getFileExt(safeName)
    const fileName = `references/${userId}/${Date.now()}-ref.${ext}`

    const { data, error } = await supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('uploadItemReferenceImage error:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (e) {
    console.error('uploadItemReferenceImage exception:', e)
    return null
  }
}

export async function deleteItemImage(imageUrl: string): Promise<boolean> {
  const supabase = createClient()
  try {
    const path = extractItemImagePathFromPublicUrl(imageUrl)
    if (!path) return false

    const { error } = await supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .remove([path])

    if (error) {
      console.error('deleteItemImage error:', error)
      return false
    }
    return true
  } catch (e) {
    console.error('deleteItemImage exception:', e)
    return false
  }
}