// src/app/utils/restaurant-helpers.ts

import { createClient } from '@/app/utils/supabase/client';
import type { 
  Restaurant, 
  RestaurantTranslation, 
  RestaurantSocial,
  UpsertTranslationInput,
  UpsertSocialInput 
} from '@/types/restaurant';

/**
 * Recupera un ristorante con tutte le sue traduzioni e social
 */
export async function getRestaurantWithDetails(restaurantId: string) {
  const supabase = createClient();
  
  // Query base restaurant
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();
    
  if (restaurantError) throw restaurantError;
  
  // Query translations
  const { data: translations, error: translationsError } = await supabase
    .from('restaurant_translations')
    .select('*')
    .eq('restaurant_id', restaurantId);
    
  // Query socials
  const { data: socials, error: socialsError } = await supabase
    .from('restaurant_socials')
    .select('*')
    .eq('restaurant_id', restaurantId);
    
  return {
    ...restaurant,
    translations: translations || [],
    socials: socials || []
  };
}

/**
 * Aggiorna o inserisce una traduzione
 */
export async function upsertTranslation(input: UpsertTranslationInput) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('restaurant_translations')
    .upsert({
      restaurant_id: input.restaurant_id,
      language_code: input.language_code,
      field_name: input.field_name,
      field_value: input.field_value
    }, {
      onConflict: 'restaurant_id,language_code,field_name'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Aggiorna o inserisce un social
 */
export async function upsertSocial(input: UpsertSocialInput) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('restaurant_socials')
    .upsert({
      restaurant_id: input.restaurant_id,
      platform: input.platform,
      handle: input.handle
    }, {
      onConflict: 'restaurant_id,platform'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Elimina una traduzione
 */
export async function deleteTranslation(
  restaurantId: string, 
  languageCode: string, 
  fieldName: string
) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('restaurant_translations')
    .delete()
    .eq('restaurant_id', restaurantId)
    .eq('language_code', languageCode)
    .eq('field_name', fieldName);
    
  if (error) throw error;
}

/**
 * Elimina un social
 */
export async function deleteSocial(restaurantId: string, platform: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('restaurant_socials')
    .delete()
    .eq('restaurant_id', restaurantId)
    .eq('platform', platform);
    
  if (error) throw error;
}

/**
 * Helper per ottenere una traduzione specifica
 */
export function getTranslation(
  translations: RestaurantTranslation[], 
  fieldName: 'description' | 'about',
  languageCode: string,
  fallbackLanguage: string = 'it'
): string | undefined {
  // Cerca la traduzione richiesta
  const translation = translations.find(
    t => t.field_name === fieldName && t.language_code === languageCode
  );
  
  if (translation) return translation.field_value;
  
  // Fallback alla lingua di default
  const fallback = translations.find(
    t => t.field_name === fieldName && t.language_code === fallbackLanguage
  );
  
  return fallback?.field_value;
}

/**
 * Helper per ottenere tutti i social come oggetto
 */
export function getSocialsMap(socials: RestaurantSocial[]): Record<string, string> {
  return socials.reduce((acc, social) => {
    acc[social.platform] = social.handle;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Esempio di utilizzo con la vista aggregata
 */
export async function getRestaurantWithAggregatedData(restaurantId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('restaurants_with_translations')
    .select('*')
    .eq('id', restaurantId)
    .single();
    
  if (error) throw error;
  return data;
}