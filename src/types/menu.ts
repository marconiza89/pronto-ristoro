// src/types/menu.ts

import type { LanguageCode } from './restaurant'

/**
 * Menu principale
 */
export interface Menu {
  id: string
  user_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Relazione tra ristorante e menu
 */
export interface RestaurantMenu {
  id: string
  restaurant_id: string
  menu_id: string
  is_primary: boolean
  display_order: number
  created_at: string
}

/**
 * Sezione del menu
 */
export interface MenuSection {
  id: string
  menu_id: string
  name: string
  description?: string
  display_order: number
  is_visible: boolean
  icon?: string
  created_at: string
  updated_at: string
}

/**
 * Traduzione di una sezione
 */
export interface MenuSectionTranslation {
  id: string
  section_id: string
  language_code: LanguageCode
  field_name: 'name' | 'description'
  field_value: string
  created_at: string
  updated_at: string
}

/**
 * Menu con le sue sezioni
 */
export interface MenuWithSections extends Menu {
  sections?: MenuSection[]
}

/**
 * Sezione con le sue traduzioni
 */
export interface MenuSectionWithTranslations extends MenuSection {
  translations?: MenuSectionTranslation[]
}

/**
 * Input per creare un nuovo menu
 */
export interface CreateMenuInput {
  name: string
  description?: string
  is_active?: boolean
}

/**
 * Input per aggiornare un menu
 */
export interface UpdateMenuInput {
  name?: string
  description?: string
  is_active?: boolean
}

/**
 * Input per creare una sezione
 */
export interface CreateMenuSectionInput {
  menu_id: string
  name: string
  description?: string
  display_order?: number
  is_visible?: boolean
  icon?: string
}

/**
 * Input per aggiornare una sezione
 */
export interface UpdateMenuSectionInput {
  name?: string
  description?: string
  display_order?: number
  is_visible?: boolean
  icon?: string
}

/**
 * Input per upsert traduzione sezione
 */
export interface UpsertSectionTranslationInput {
  section_id: string
  language_code: LanguageCode
  field_name: 'name' | 'description'
  field_value: string
}

/**
 * Input per collegare un menu a un ristorante
 */
export interface AttachMenuToRestaurantInput {
  restaurant_id: string
  menu_id: string
  is_primary?: boolean
  display_order?: number
}

/**
 * Risultato aggregato dalla vista
 */
export interface MenuWithSectionsView {
  menu_id: string
  user_id: string
  menu_name: string
  menu_description?: string
  is_active: boolean
  menu_created_at: string
  menu_updated_at: string
  sections?: Array<{
    id: string
    name: string
    description?: string
    display_order: number
    is_visible: boolean
    icon?: string
  }>
}

/**
 * Risultato aggregato per ristoranti con menu
 */
export interface RestaurantWithMenusView {
  restaurant_id: string
  user_id: string
  restaurant_name: string
  restaurant_type: string
  menus?: Array<{
    menu_id: string
    menu_name: string
    is_primary: boolean
    display_order: number
  }>
}