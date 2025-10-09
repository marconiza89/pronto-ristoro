// src/utils/menu/menu-item-helpers.ts

import { createClient } from '@/app/utils/supabase/client'
import type {
  MenuItem,
  MenuItemWithRelations,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  UpsertItemTranslationInput,
  CreateIngredientInput,
  ItemIngredient,
  AddAllergenToItemInput,
  AddDietaryTagToItemInput,
  MenuItemTranslation,
} from '@/types/menuItem'
import type { LanguageCode } from '@/types/restaurant'

/**
 * Crea un nuovo item del menu
 */
export async function createMenuItem(
  input: CreateMenuItemInput
): Promise<MenuItem | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        section_id: input.section_id,
        item_type: input.item_type ?? 'food',
        name: input.name,
        description: input.description,
        price: input.price,
        currency: input.currency ?? 'EUR',
        image_url: input.image_url,
        display_order: input.display_order ?? 0,
        is_available: input.is_available ?? true,
        is_featured: input.is_featured ?? false,
        preparation_time: input.preparation_time,
        calories: input.calories,
        weight: input.weight,
        alcohol_content: input.alcohol_content,
        serving_format: input.serving_format,
        volume_ml: input.volume_ml,
        wine_type: input.wine_type,
        wine_characteristics: input.wine_characteristics,
        grape_variety: input.grape_variety,
        wine_region: input.wine_region,
        wine_producer: input.wine_producer,
        vintage: input.vintage,
        beer_style: input.beer_style,
        brewery: input.brewery,
        ibu: input.ibu,
        extra_info: input.extra_info,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating menu item:', error)
    return null
  }
}

/**
 * Aggiorna un item del menu
 */
export async function updateMenuItem(
  itemId: string,
  input: UpdateMenuItemInput
): Promise<MenuItem | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(input)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating menu item:', error)
    return null
  }
}

/**
 * Elimina un item del menu
 */
export async function deleteMenuItem(itemId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return false
  }
}

/**
 * Ottieni un item con tutte le sue relazioni
 */
export async function getMenuItemWithRelations(
  itemId: string
): Promise<MenuItemWithRelations | null> {
  const supabase = createClient()

  try {
    // Query item
    const { data: item, error: itemError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (itemError) throw itemError

    // Query translations
    const { data: translations } = await supabase
      .from('menu_item_translations')
      .select('*')
      .eq('item_id', itemId)

    // Query ingredients
    const { data: ingredients } = await supabase
      .from('item_ingredients')
      .select('*')
      .eq('item_id', itemId)
      .order('display_order', { ascending: true })

    // Query allergens
    const { data: allergens } = await supabase
      .from('item_allergens')
      .select('*')
      .eq('item_id', itemId)

    // Query dietary tags
    const { data: dietary_tags } = await supabase
      .from('item_dietary_tags')
      .select('*')
      .eq('item_id', itemId)

    return {
      ...item,
      translations: translations || [],
      ingredients: ingredients || [],
      allergens: allergens || [],
      dietary_tags: dietary_tags || [],
    }
  } catch (error) {
    console.error('Error getting menu item with relations:', error)
    return null
  }
}

/**
 * Ottieni tutti gli item di una sezione
 */
export async function getSectionItems(sectionId: string): Promise<MenuItem[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('section_id', sectionId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting section items:', error)
    return []
  }
}

/**
 * Riordina gli item di una sezione
 */
export async function reorderMenuItems(
  itemUpdates: Array<{ id: string; display_order: number }>
): Promise<boolean> {
  const supabase = createClient()

  try {
    const promises = itemUpdates.map(({ id, display_order }) =>
      supabase
        .from('menu_items')
        .update({ display_order })
        .eq('id', id)
    )

    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('Error reordering items:', error)
    return false
  }
}

/**
 * Upsert traduzione di un item
 */
export async function upsertItemTranslation(
  input: UpsertItemTranslationInput
): Promise<MenuItemTranslation | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('menu_item_translations')
      .upsert(
        {
          item_id: input.item_id,
          language_code: input.language_code,
          field_name: input.field_name,
          field_value: input.field_value,
        },
        {
          onConflict: 'item_id,language_code,field_name',
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error upserting item translation:', error)
    return null
  }
}

/**
 * Elimina una traduzione di un item
 */
export async function deleteItemTranslation(
  itemId: string,
  languageCode: LanguageCode,
  fieldName: 'name' | 'description'
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('menu_item_translations')
      .delete()
      .eq('item_id', itemId)
      .eq('language_code', languageCode)
      .eq('field_name', fieldName)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting item translation:', error)
    return false
  }
}

/**
 * Crea un ingrediente per un item
 */
export async function createIngredient(
  input: CreateIngredientInput
): Promise<ItemIngredient | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('item_ingredients')
      .insert({
        item_id: input.item_id,
        name: input.name,
        display_order: input.display_order ?? 0,
        is_main: input.is_main ?? false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating ingredient:', error)
    return null
  }
}

/**
 * Elimina un ingrediente
 */
export async function deleteIngredient(ingredientId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('item_ingredients')
      .delete()
      .eq('id', ingredientId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    return false
  }
}

/**
 * Aggiungi allergene a un item
 */
export async function addAllergenToItem(
  input: AddAllergenToItemInput
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('item_allergens')
      .insert({
        item_id: input.item_id,
        allergen_code: input.allergen_code,
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding allergen to item:', error)
    return false
  }
}

/**
 * Rimuovi allergene da un item
 */
export async function removeAllergenFromItem(
  itemId: string,
  allergenCode: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('item_allergens')
      .delete()
      .eq('item_id', itemId)
      .eq('allergen_code', allergenCode)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing allergen from item:', error)
    return false
  }
}

/**
 * Aggiungi tag dietetico a un item
 */
export async function addDietaryTagToItem(
  input: AddDietaryTagToItemInput
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('item_dietary_tags')
      .insert({
        item_id: input.item_id,
        tag_code: input.tag_code,
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding dietary tag to item:', error)
    return false
  }
}

/**
 * Rimuovi tag dietetico da un item
 */
export async function removeDietaryTagFromItem(
  itemId: string,
  tagCode: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('item_dietary_tags')
      .delete()
      .eq('item_id', itemId)
      .eq('tag_code', tagCode)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing dietary tag from item:', error)
    return false
  }
}

/**
 * Duplica un item
 */
export async function duplicateMenuItem(
  itemId: string,
  newName: string
): Promise<MenuItem | null> {
  const supabase = createClient()

  try {
    // 1. Ottieni l'item originale con relazioni
    const original = await getMenuItemWithRelations(itemId)
    if (!original) throw new Error('Item not found')

    // 2. Crea il nuovo item
    const { data: newItem, error: itemError } = await supabase
      .from('menu_items')
      .insert({
        section_id: original.section_id,
        item_type: original.item_type,
        name: newName,
        description: original.description,
        price: original.price,
        currency: original.currency,
        display_order: original.display_order + 1,
        is_available: original.is_available,
        is_featured: false,
        preparation_time: original.preparation_time,
        calories: original.calories,
        weight: original.weight,
        alcohol_content: original.alcohol_content,
        serving_format: original.serving_format,
        volume_ml: original.volume_ml,
        wine_type: original.wine_type,
        wine_characteristics: original.wine_characteristics,
        grape_variety: original.grape_variety,
        wine_region: original.wine_region,
        wine_producer: original.wine_producer,
        vintage: original.vintage,
        beer_style: original.beer_style,
        brewery: original.brewery,
        ibu: original.ibu,
        extra_info: original.extra_info,
      })
      .select()
      .single()

    if (itemError) throw itemError

    // 3. Copia ingredienti
    if (original.ingredients && original.ingredients.length > 0) {
      const ingredients = original.ingredients.map(ing => ({
        item_id: newItem.id,
        name: ing.name,
        display_order: ing.display_order,
        is_main: ing.is_main,
      }))

      await supabase.from('item_ingredients').insert(ingredients)
    }

    // 4. Copia allergeni
    if (original.allergens && original.allergens.length > 0) {
      const allergens = original.allergens.map(all => ({
        item_id: newItem.id,
        allergen_code: all.allergen_code,
      }))

      await supabase.from('item_allergens').insert(allergens)
    }

    // 5. Copia tag dietetici
    if (original.dietary_tags && original.dietary_tags.length > 0) {
      const tags = original.dietary_tags.map(tag => ({
        item_id: newItem.id,
        tag_code: tag.tag_code,
      }))

      await supabase.from('item_dietary_tags').insert(tags)
    }

    return newItem
  } catch (error) {
    console.error('Error duplicating menu item:', error)
    return null
  }
}

/**
 * Cambia disponibilità item (toggle)
 */
export async function toggleItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !isAvailable })
      .eq('id', itemId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error toggling item availability:', error)
    return false
  }
}

/**
 * Helper per ottenere una traduzione specifica
 */
export function getItemTranslation(
  translations: MenuItemTranslation[],
  fieldName: 'name' | 'description',
  languageCode: LanguageCode,
  fallbackLanguage: LanguageCode = 'it'
): string | undefined {
  const translation = translations.find(
    t => t.field_name === fieldName && t.language_code === languageCode
  )

  if (translation) return translation.field_value

  const fallback = translations.find(
    t => t.field_name === fieldName && t.language_code === fallbackLanguage
  )

  return fallback?.field_value
}