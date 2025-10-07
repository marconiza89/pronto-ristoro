// src/types/restaurant.ts

export type RestaurantType = 
  | 'ristorante'
  | 'pizzeria'
  | 'pizzeria_ristorante'
  | 'trattoria'
  | 'osteria'
  | 'pub'
  | 'bar'
  | 'caffe'
  | 'enoteca'
  | 'bistrot'
  | 'tavola_calda'
  | 'rosticceria'
  | 'pasticceria'
  | 'gelateria';

// Lingue supportate (estendibile)
export type LanguageCode = 'it' | 'en' | 'fr' | 'de' | 'es' | 'zh' | 'ja' | 'ar' | 'ru' | 'pt';

// Social platforms (estendibile)
export type SocialPlatform = 
  | 'instagram' 
  | 'facebook' 
  | 'twitter' 
  | 'tiktok' 
  | 'youtube' 
  | 'linkedin'
  | 'pinterest'
  | 'whatsapp'
  | 'telegram'
  | 'tripadvisor'
  | 'google_business';

export interface Restaurant {
  id: string;
  user_id: string;
  name: string;
  type: RestaurantType;
  image_url?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantTranslation {
  id: string;
  restaurant_id: string;
  language_code: LanguageCode;
  field_name: 'description' | 'about';
  field_value: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantSocial {
  id: string;
  restaurant_id: string;
  platform: SocialPlatform | string; // string per permettere piattaforme custom
  handle: string;
  created_at: string;
}

// Tipo combinato per query con JOIN
export interface RestaurantWithDetails extends Restaurant {
  translations?: RestaurantTranslation[];
  socials?: RestaurantSocial[];
}

// Per la vista aggregata
export interface RestaurantWithAggregatedData extends Restaurant {
  translations?: {
    [key: string]: string; // es: "it_description": "...", "en_about": "..."
  };
  socials?: {
    [platform: string]: string; // es: "instagram": "@username"
  };
}

export interface CreateRestaurantInput {
  name: string;
  type: RestaurantType;
}

export interface UpdateRestaurantInput {
  name?: string;
  type?: RestaurantType;
  image_url?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface UpsertTranslationInput {
  restaurant_id: string;
  language_code: LanguageCode;
  field_name: 'description' | 'about';
  field_value: string;
}

export interface UpsertSocialInput {
  restaurant_id: string;
  platform: string;
  handle: string;
}