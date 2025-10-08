// src/types/menuItem.ts

import type { LanguageCode } from './restaurant'

/**
 * Tipi di item
 */
export type ItemType = 'food' | 'drink' | 'wine' | 'beer' | 'cocktail' | 'dessert' | 'other'

/**
 * Formati di servizio per alcolici
 */
export type ServingFormat = 'glass' | 'bottle' | 'draft' | 'can'

/**
 * Tipi di vino
 */
export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'champagne' | 'dessert_wine' | 'fortified'

/**
 * Caratteristiche vino
 */
export type WineCharacteristic = 'dry' | 'semi_dry' | 'sweet' | 'semi_sweet' | 'still' | 'sparkling' | 'frizzante'

/**
 * Stili birra
 */
export type BeerStyle = 'lager' | 'ale' | 'ipa' | 'stout' | 'pilsner' | 'wheat' | 'sour' | 'porter' | 'amber' | 'other'

/**
 * Allergeni standard (14 allergeni UE)
 */
export type AllergenCode =
  | 'glutine'
  | 'lattosio'
  | 'uova'
  | 'pesce'
  | 'crostacei'
  | 'frutta_a_guscio'
  | 'arachidi'
  | 'soia'
  | 'sedano'
  | 'senape'
  | 'sesamo'
  | 'solfiti'
  | 'lupini'
  | 'molluschi'

/**
 * Tag dietetici
 */
export type DietaryTagCode =
  | 'vegetariano'
  | 'vegano'
  | 'senza_glutine'
  | 'senza_lattosio'
  | 'biologico'
  | 'piccante'
  | 'crudo'
  | 'halal'
  | 'kosher'

/**
 * Item del menu
 */
export interface MenuItem {
  id: string
  section_id: string
  item_type: ItemType
  name: string
  description?: string
  price?: number
  currency: string
  image_url?: string
  display_order: number
  is_available: boolean
  is_featured: boolean
  preparation_time?: number
  calories?: number
  weight?: number
  
  // Campi alcolici comuni
  alcohol_content?: number
  serving_format?: ServingFormat
  volume_ml?: number
  
  // Campi specifici vino
  wine_type?: WineType
  wine_characteristics?: WineCharacteristic[]
  grape_variety?: string
  wine_region?: string
  wine_producer?: string
  vintage?: number
  
  // Campi specifici birra
  beer_style?: BeerStyle
  brewery?: string
  ibu?: number
  
  extra_info?: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Traduzione di un item
 */
export interface MenuItemTranslation {
  id: string
  item_id: string
  language_code: LanguageCode
  field_name: 'name' | 'description'
  field_value: string
  created_at: string
  updated_at: string
}

/**
 * Ingrediente
 */
export interface ItemIngredient {
  id: string
  item_id: string
  name: string
  display_order: number
  is_main: boolean
  created_at: string
}

/**
 * Traduzione ingrediente
 */
export interface ItemIngredientTranslation {
  id: string
  ingredient_id: string
  language_code: LanguageCode
  name: string
  created_at: string
}

/**
 * Allergene collegato a un item
 */
export interface ItemAllergen {
  id: string
  item_id: string
  allergen_code: AllergenCode
  created_at: string
}

/**
 * Traduzione allergene di un item
 */
export interface ItemAllergenTranslation {
  id: string
  allergen_id: string
  language_code: LanguageCode
  display_name: string
  created_at: string
}

/**
 * Tag dietetico collegato a un item
 */
export interface ItemDietaryTag {
  id: string
  item_id: string
  tag_code: DietaryTagCode
  created_at: string
}

/**
 * Traduzione tag dietetico di un item
 */
export interface DietaryTagTranslation {
  id: string
  tag_id: string
  language_code: LanguageCode
  display_name: string
  created_at: string
}

/**
 * Item con tutte le relazioni
 */
export interface MenuItemWithRelations extends MenuItem {
  translations?: MenuItemTranslation[]
  ingredients?: (ItemIngredient & { translations?: ItemIngredientTranslation[] })[]
  allergens?: (ItemAllergen & { translations?: ItemAllergenTranslation[] })[]
  dietary_tags?: (ItemDietaryTag & { translations?: DietaryTagTranslation[] })[]
}

/**
 * Input per creare un item
 */
export interface CreateMenuItemInput {
  section_id: string
  item_type?: ItemType
  name: string
  description?: string
  price?: number
  currency?: string
  image_url?: string
  display_order?: number
  is_available?: boolean
  is_featured?: boolean
  preparation_time?: number
  calories?: number
  weight?: number
  alcohol_content?: number
  serving_format?: ServingFormat
  volume_ml?: number
  wine_type?: WineType
  wine_characteristics?: WineCharacteristic[]
  grape_variety?: string
  wine_region?: string
  wine_producer?: string
  vintage?: number
  beer_style?: BeerStyle
  brewery?: string
  ibu?: number
  extra_info?: Record<string, any>
}

/**
 * Input per aggiornare un item
 */
export interface UpdateMenuItemInput {
  name?: string
  description?: string
  price?: number
  currency?: string
  image_url?: string
  display_order?: number
  is_available?: boolean
  is_featured?: boolean
  item_type?: ItemType
  preparation_time?: number
  calories?: number
  weight?: number
  alcohol_content?: number
  serving_format?: ServingFormat
  volume_ml?: number
  wine_type?: WineType
  wine_characteristics?: WineCharacteristic[]
  grape_variety?: string
  wine_region?: string
  wine_producer?: string
  vintage?: number
  beer_style?: BeerStyle
  brewery?: string
  ibu?: number
  extra_info?: Record<string, any>
}

/**
 * Input per upsert traduzione item
 */
export interface UpsertItemTranslationInput {
  item_id: string
  language_code: LanguageCode
  field_name: 'name' | 'description'
  field_value: string
}

/**
 * Input per creare ingrediente
 */
export interface CreateIngredientInput {
  item_id: string
  name: string
  display_order?: number
  is_main?: boolean
}

/**
 * Input per aggiungere allergene a item
 */
export interface AddAllergenToItemInput {
  item_id: string
  allergen_code: AllergenCode
}

/**
 * Input per aggiungere tag dietetico a item
 */
export interface AddDietaryTagToItemInput {
  item_id: string
  tag_code: DietaryTagCode
}

/**
 * Helper types per form specifici
 */

// Form per piatti generici
export interface FoodItemForm {
  name: string
  description?: string
  price?: number
  ingredients?: string[]
  allergen_codes?: AllergenCode[]
  dietary_tag_codes?: DietaryTagCode[]
  preparation_time?: number
  calories?: number
  weight?: number
}

// Form per vini
export interface WineItemForm {
  name: string
  description?: string
  price?: number
  alcohol_content?: number
  serving_format: ServingFormat
  volume_ml?: number
  wine_type: WineType
  wine_characteristics?: WineCharacteristic[]
  grape_variety?: string
  wine_region?: string
  wine_producer?: string
  vintage?: number
}

// Form per birre
export interface BeerItemForm {
  name: string
  description?: string
  price?: number
  alcohol_content?: number
  serving_format: ServingFormat
  volume_ml?: number
  beer_style: BeerStyle
  brewery?: string
  ibu?: number
}

// Form per cocktail
export interface CocktailItemForm {
  name: string
  description?: string
  price?: number
  alcohol_content?: number
  ingredients?: string[]
  allergen_codes?: AllergenCode[]
}

/**
 * Labels per UI in italiano
 */
export const WINE_TYPE_LABELS: Record<WineType, string> = {
  red: 'Rosso',
  white: 'Bianco',
  rose: 'Rosato',
  sparkling: 'Spumante',
  champagne: 'Champagne',
  dessert_wine: 'Vino da dessert',
  fortified: 'Liquoroso',
}

export const WINE_CHARACTERISTIC_LABELS: Record<WineCharacteristic, string> = {
  dry: 'Secco',
  semi_dry: 'Semisecco',
  sweet: 'Dolce',
  semi_sweet: 'Abboccato',
  still: 'Fermo',
  sparkling: 'Spumante',
  frizzante: 'Frizzante',
}

export const BEER_STYLE_LABELS: Record<BeerStyle, string> = {
  lager: 'Lager',
  ale: 'Ale',
  ipa: 'IPA',
  stout: 'Stout',
  pilsner: 'Pilsner',
  wheat: 'Weiss/Wheat',
  sour: 'Sour',
  porter: 'Porter',
  amber: 'Ambrata',
  other: 'Altro',
}

export const SERVING_FORMAT_LABELS: Record<ServingFormat, string> = {
  glass: 'Calice',
  bottle: 'Bottiglia',
  draft: 'Alla spina',
  can: 'Lattina',
}

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  food: 'Cibo',
  drink: 'Bevanda',
  wine: 'Vino',
  beer: 'Birra',
  cocktail: 'Cocktail',
  dessert: 'Dolce',
  other: 'Altro',
}

/**
 * Allergeni - Labels italiane
 */
export const ALLERGEN_LABELS_IT: Record<AllergenCode, string> = {
  glutine: 'Glutine',
  lattosio: 'Lattosio',
  uova: 'Uova',
  pesce: 'Pesce',
  crostacei: 'Crostacei',
  frutta_a_guscio: 'Frutta a guscio',
  arachidi: 'Arachidi',
  soia: 'Soia',
  sedano: 'Sedano',
  senape: 'Senape',
  sesamo: 'Sesamo',
  solfiti: 'Solfiti',
  lupini: 'Lupini',
  molluschi: 'Molluschi',
}

/**
 * Allergeni - Labels inglesi
 */
export const ALLERGEN_LABELS_EN: Record<AllergenCode, string> = {
  glutine: 'Gluten',
  lattosio: 'Lactose',
  uova: 'Eggs',
  pesce: 'Fish',
  crostacei: 'Crustaceans',
  frutta_a_guscio: 'Tree nuts',
  arachidi: 'Peanuts',
  soia: 'Soy',
  sedano: 'Celery',
  senape: 'Mustard',
  sesamo: 'Sesame',
  solfiti: 'Sulphites',
  lupini: 'Lupin',
  molluschi: 'Molluscs',
}

/**
 * Tag dietetici - Labels italiane
 */
export const DIETARY_TAG_LABELS_IT: Record<DietaryTagCode, string> = {
  vegetariano: 'Vegetariano',
  vegano: 'Vegano',
  senza_glutine: 'Senza glutine',
  senza_lattosio: 'Senza lattosio',
  biologico: 'Biologico',
  piccante: 'Piccante',
  crudo: 'Crudo',
  halal: 'Halal',
  kosher: 'Kosher',
}

/**
 * Tag dietetici - Labels inglesi
 */
export const DIETARY_TAG_LABELS_EN: Record<DietaryTagCode, string> = {
  vegetariano: 'Vegetarian',
  vegano: 'Vegan',
  senza_glutine: 'Gluten-free',
  senza_lattosio: 'Lactose-free',
  biologico: 'Organic',
  piccante: 'Spicy',
  crudo: 'Raw',
  halal: 'Halal',
  kosher: 'Kosher',
}

/**
 * Helper per ottenere label allergene
 */
export function getAllergenLabel(code: AllergenCode, language: LanguageCode = 'it'): string {
  return language === 'en' ? ALLERGEN_LABELS_EN[code] : ALLERGEN_LABELS_IT[code]
}

/**
 * Helper per ottenere label tag dietetico
 */
export function getDietaryTagLabel(code: DietaryTagCode, language: LanguageCode = 'it'): string {
  return language === 'en' ? DIETARY_TAG_LABELS_EN[code] : DIETARY_TAG_LABELS_IT[code]
}