// src/app/utils/menu/menu-helpers.ts

import { createClient } from '@/app/utils/supabase/client'
import type {
  Menu,
  MenuSection,
  MenuSectionTranslation,
  MenuWithSections,
  CreateMenuInput,
  UpdateMenuInput,
  CreateMenuSectionInput,
  UpdateMenuSectionInput,
  UpsertSectionTranslationInput,
  AttachMenuToRestaurantInput,
} from '@/types/menu'
import type { RestaurantType, LanguageCode } from '@/types/restaurant'
import { getSectionPresets, createSectionsFromPreset } from './SectionPresetManager'

/**
 * Crea un nuovo menu con sezioni predefinite in base al tipo di attività
 */
export async function createMenuWithPresets(
  input: CreateMenuInput & { restaurantType: RestaurantType }
): Promise<{ menu: Menu; sections: MenuSection[] } | null> {
  const supabase = createClient()

  try {
    // 1. Ottieni l'utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // 2. Crea il menu
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description,
        is_active: input.is_active ?? true,
      })
      .select()
      .single()

    if (menuError) throw menuError

    // 3. Crea le sezioni dai preset
    const sectionPresets = createSectionsFromPreset(menu.id, input.restaurantType)
    
    const { data: sections, error: sectionsError } = await supabase
      .from('menu_sections')
      .insert(sectionPresets)
      .select()

    if (sectionsError) throw sectionsError

    return { menu, sections: sections || [] }
  } catch (error) {
    console.error('Error creating menu with presets:', error)
    return null
  }
}

/**
 * Crea un menu vuoto (senza sezioni predefinite)
 */
export async function createMenu(input: CreateMenuInput): Promise<Menu | null> {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('menus')
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description,
        is_active: input.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating menu:', error)
    return null
  }
}

/**
 * Aggiorna un menu
 */
export async function updateMenu(
  menuId: string,
  input: UpdateMenuInput
): Promise<Menu | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menus')
      .update(input)
      .eq('id', menuId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating menu:', error)
    return null
  }
}

/**
 * Elimina un menu (elimina anche sezioni per CASCADE)
 */
export async function deleteMenu(menuId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting menu:', error)
    return false
  }
}

/**
 * Ottieni un menu con le sue sezioni
 */
export async function getMenuWithSections(menuId: string): Promise<MenuWithSections | null> {
  const supabase = createClient()

  try {
    // Query menu
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('*')
      .eq('id', menuId)
      .single()

    if (menuError) throw menuError

    // Query sections
    const { data: sections, error: sectionsError } = await supabase
      .from('menu_sections')
      .select('*')
      .eq('menu_id', menuId)
      .order('display_order', { ascending: true })

    if (sectionsError) throw sectionsError

    return { ...menu, sections: sections || [] }
  } catch (error) {
    console.error('Error getting menu with sections:', error)
    return null
  }
}

/**
 * Ottieni tutti i menu di un utente
 */
export async function getUserMenus(): Promise<Menu[]> {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting user menus:', error)
    return []
  }
}

/**
 * Collega un menu a un ristorante
 */
export async function attachMenuToRestaurant(
  input: AttachMenuToRestaurantInput
): Promise<boolean> {
  const supabase = createClient()

  try {
    // Se questo menu diventa primary, rimuovi il flag dagli altri
    if (input.is_primary) {
      await supabase
        .from('restaurant_menus')
        .update({ is_primary: false })
        .eq('restaurant_id', input.restaurant_id)
    }

    const { error } = await supabase
      .from('restaurant_menus')
      .insert({
        restaurant_id: input.restaurant_id,
        menu_id: input.menu_id,
        is_primary: input.is_primary ?? false,
        display_order: input.display_order ?? 0,
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error attaching menu to restaurant:', error)
    return false
  }
}

/**
 * Scollega un menu da un ristorante
 */
export async function detachMenuFromRestaurant(
  restaurantId: string,
  menuId: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('restaurant_menus')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('menu_id', menuId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error detaching menu from restaurant:', error)
    return false
  }
}

/**
 * Ottieni i menu di un ristorante
 */
export async function getRestaurantMenus(restaurantId: string): Promise<Menu[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('restaurant_menus')
      .select(`
        menu_id,
        display_order,
        is_primary,
        menus (
          id,
          user_id,
          name,
          description,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true })

    if (error) throw error

    // Estrai solo i menu dalla risposta
    // Supabase restituisce menus come singolo oggetto, non array
    return (data || [])
      .map(item => item.menus as unknown as Menu)
      .filter((menu): menu is Menu => menu !== null && menu !== undefined)
  } catch (error) {
    console.error('Error getting restaurant menus:', error)
    return []
  }
}

/**
 * Crea una nuova sezione in un menu
 */
export async function createMenuSection(
  input: CreateMenuSectionInput
): Promise<MenuSection | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menu_sections')
      .insert({
        menu_id: input.menu_id,
        name: input.name,
        description: input.description,
        display_order: input.display_order ?? 0,
        is_visible: input.is_visible ?? true,
        icon: input.icon,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating menu section:', error)
    return null
  }
}

/**
 * Aggiorna una sezione
 */
export async function updateMenuSection(
  sectionId: string,
  input: UpdateMenuSectionInput
): Promise<MenuSection | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menu_sections')
      .update(input)
      .eq('id', sectionId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating menu section:', error)
    return null
  }
}

/**
 * Elimina una sezione
 */
export async function deleteMenuSection(sectionId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('menu_sections')
      .delete()
      .eq('id', sectionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting menu section:', error)
    return false
  }
}

/**
 * Riordina le sezioni di un menu
 */
export async function reorderMenuSections(
  sectionUpdates: Array<{ id: string; display_order: number }>
): Promise<boolean> {
  const supabase = createClient()

  try {
    // Aggiorna ogni sezione con il nuovo ordine
    const promises = sectionUpdates.map(({ id, display_order }) =>
      supabase
        .from('menu_sections')
        .update({ display_order })
        .eq('id', id)
    )

    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('Error reordering sections:', error)
    return false
  }
}

/**
 * Upsert traduzione di una sezione
 */
export async function upsertSectionTranslation(
  input: UpsertSectionTranslationInput
): Promise<MenuSectionTranslation | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menu_section_translations')
      .upsert(
        {
          section_id: input.section_id,
          language_code: input.language_code,
          field_name: input.field_name,
          field_value: input.field_value,
        },
        {
          onConflict: 'section_id,language_code,field_name',
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error upserting section translation:', error)
    return null
  }
}

/**
 * Elimina una traduzione
 */
export async function deleteSectionTranslation(
  sectionId: string,
  languageCode: LanguageCode,
  fieldName: 'name' | 'description'
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('menu_section_translations')
      .delete()
      .eq('section_id', sectionId)
      .eq('language_code', languageCode)
      .eq('field_name', fieldName)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting section translation:', error)
    return false
  }
}

/**
 * Ottieni tutte le traduzioni di una sezione
 */
export async function getSectionTranslations(
  sectionId: string
): Promise<MenuSectionTranslation[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menu_section_translations')
      .select('*')
      .eq('section_id', sectionId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting section translations:', error)
    return []
  }
}

/**
 * Helper per ottenere una traduzione specifica
 */
export function getSectionTranslation(
  translations: MenuSectionTranslation[],
  fieldName: 'name' | 'description',
  languageCode: LanguageCode,
  fallbackLanguage: LanguageCode = 'it'
): string | undefined {
  // Cerca la traduzione richiesta
  const translation = translations.find(
    t => t.field_name === fieldName && t.language_code === languageCode
  )

  if (translation) return translation.field_value

  // Fallback alla lingua di default
  const fallback = translations.find(
    t => t.field_name === fieldName && t.language_code === fallbackLanguage
  )

  return fallback?.field_value
}

/**
 * Duplica un menu (copia menu + sezioni, senza traduzioni)
 */
export async function duplicateMenu(
  menuId: string,
  newName: string
): Promise<{ menu: Menu; sections: MenuSection[] } | null> {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // 1. Ottieni il menu originale con sezioni
    const original = await getMenuWithSections(menuId)
    if (!original) throw new Error('Menu not found')

    // 2. Crea il nuovo menu
    const { data: newMenu, error: menuError } = await supabase
      .from('menus')
      .insert({
        user_id: user.id,
        name: newName,
        description: original.description,
        is_active: original.is_active,
      })
      .select()
      .single()

    if (menuError) throw menuError

    // 3. Copia le sezioni
    if (original.sections && original.sections.length > 0) {
      const newSections = original.sections.map(section => ({
        menu_id: newMenu.id,
        name: section.name,
        description: section.description,
        display_order: section.display_order,
        is_visible: section.is_visible,
        icon: section.icon,
      }))

      const { data: sections, error: sectionsError } = await supabase
        .from('menu_sections')
        .insert(newSections)
        .select()

      if (sectionsError) throw sectionsError

      return { menu: newMenu, sections: sections || [] }
    }

    return { menu: newMenu, sections: [] }
  } catch (error) {
    console.error('Error duplicating menu:', error)
    return null
  }
}