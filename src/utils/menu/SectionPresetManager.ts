// src/utils/menu/SectionPresetManager.ts

import type { RestaurantType } from '@/types/restaurant'

export interface SectionPreset {
  name: string
  description?: string
  icon?: string
  display_order: number
}

/**
 * Preset di sezioni per ogni tipo di attività
 */
const SECTION_PRESETS: Record<RestaurantType, SectionPreset[]> = {
  ristorante: [
    { name: 'Antipasti', description: 'Per iniziare', icon: 'appetizer', display_order: 1 },
    { name: 'Primi Piatti', description: 'Pasta, risotti e zuppe', icon: 'pasta', display_order: 2 },
    { name: 'Secondi Piatti', description: 'Carne e pesce', icon: 'main-course', display_order: 3 },
    { name: 'Contorni', description: 'Verdure e insalate', icon: 'salad', display_order: 4 },
    { name: 'Dolci', description: 'Dessert e pasticceria', icon: 'dessert', display_order: 5 },
    { name: 'Bevande', description: 'Birre e bibite commerciali', icon: 'drink', display_order: 6 },
    { name: 'Birre Artigianali', description: 'Selezione di birre artigianali', icon: 'beer', display_order: 7 },
    { name: 'Vini', description: 'Sezione dedicata ai vini', icon: 'wine', display_order: 8 },
  ],

  pizzeria: [
    { name: 'Antipasti', description: 'Sfizi e stuzzichini', icon: 'appetizer', display_order: 1 },
    { name: 'Pizze Rosse', description: 'Con pomodoro', icon: 'pizza', display_order: 2 },
    { name: 'Pizze Bianche', description: 'Senza pomodoro', icon: 'pizza', display_order: 3 },
    { name: 'Pizze Speciali', description: 'Le nostre creazioni', icon: 'pizza', display_order: 4 },
    { name: 'Focacce e Calzoni', icon: 'bread', display_order: 5 },
    { name: 'Dolci', description: 'Dessert della casa', icon: 'dessert', display_order: 6 },
    { name: 'Bevande', description: 'Bibite e birre', icon: 'drink', display_order: 7 },
  ],

  pizzeria_ristorante: [
    { name: 'Antipasti', description: 'Per iniziare', icon: 'appetizer', display_order: 1 },
    { name: 'Primi Piatti', description: 'Pasta e risotti', icon: 'pasta', display_order: 2 },
    { name: 'Pizze', description: 'Cotte nel forno a legna', icon: 'pizza', display_order: 3 },
    { name: 'Secondi Piatti', description: 'Carne e pesce', icon: 'main-course', display_order: 4 },
    { name: 'Contorni', description: 'Verdure fresche', icon: 'salad', display_order: 5 },
    { name: 'Dolci', description: 'Dessert', icon: 'dessert', display_order: 6 },
    { name: 'Bevande', description: 'Vini e bibite', icon: 'drink', display_order: 7 },
  ],

  trattoria: [
    { name: 'Antipasti', description: 'Antipasti della casa', icon: 'appetizer', display_order: 1 },
    { name: 'Primi Piatti', description: 'Paste fatte in casa', icon: 'pasta', display_order: 2 },
    { name: 'Secondi Piatti', description: 'Piatti tradizionali', icon: 'main-course', display_order: 3 },
    { name: 'Contorni', icon: 'salad', display_order: 4 },
    { name: 'Dolci', description: 'Dolci della nonna', icon: 'dessert', display_order: 5 },
    { name: 'Vini', description: 'Vini della cantina', icon: 'wine', display_order: 6 },
  ],

  osteria: [
    { name: 'Antipasti', icon: 'appetizer', display_order: 1 },
    { name: 'Primi', description: 'Paste e zuppe', icon: 'pasta', display_order: 2 },
    { name: 'Secondi', description: 'Piatti del territorio', icon: 'main-course', display_order: 3 },
    { name: 'Formaggi e Salumi', icon: 'cheese', display_order: 4 },
    { name: 'Dolci', icon: 'dessert', display_order: 5 },
    { name: 'Vini', icon: 'wine', display_order: 6 },
  ],

  pub: [
    { name: 'Antipasti', description: 'Finger food e starters', icon: 'appetizer', display_order: 1 },
    { name: 'Hamburger', description: 'I nostri burger artigianali', icon: 'burger', display_order: 2 },
    { name: 'Panini e Toast', description: 'Piatti caldi', icon: 'sandwich', display_order: 3 },
    { name: 'Insalate', description: 'Fresche e gustose', icon: 'salad', display_order: 4 },
    { name: 'Fritture', icon: 'fries', display_order: 5 },
    { name: 'Birre alla Spina', description: 'Dal nostro barile', icon: 'beer', display_order: 6 },
    { name: 'Birre in Bottiglia', description: 'Selezione internazionale', icon: 'beer', display_order: 7 },
    { name: 'Cocktail', description: 'Mixology', icon: 'cocktail', display_order: 8 },
  ],

  bar: [
    { name: 'Caffetteria', description: 'Caffè e cappuccini', icon: 'coffee', display_order: 1 },
    { name: 'Colazione', description: 'Brioche e dolci', icon: 'breakfast', display_order: 2 },
    { name: 'Aperitivi', description: 'Cocktail e stuzzichini', icon: 'cocktail', display_order: 3 },
    { name: 'Panini e Toast', description: 'Piatti veloci', icon: 'sandwich', display_order: 4 },
    { name: 'Bibite', description: 'Analcoliche e alcoliche', icon: 'drink', display_order: 5 },
  ],

  caffe: [
    { name: 'Caffetteria', description: 'Espresso, cappuccino, americano', icon: 'coffee', display_order: 1 },
    { name: 'Colazione', description: 'Brioche, cornetti, dolci', icon: 'breakfast', display_order: 2 },
    { name: 'Bevande Fredde', description: 'Frappè, smoothies, granite', icon: 'drink', display_order: 3 },
    { name: 'Snack', description: 'Panini e tramezzini', icon: 'sandwich', display_order: 4 },
  ],

  enoteca: [
    { name: 'Vini al Calice', description: 'Selezione del giorno', icon: 'wine', display_order: 1 },
    { name: 'Vini in Bottiglia', description: 'La nostra cantina', icon: 'wine', display_order: 2 },
    { name: 'Taglieri', description: 'Salumi e formaggi', icon: 'cheese', display_order: 3 },
    { name: 'Antipasti', icon: 'appetizer', display_order: 4 },
    { name: 'Primi Piatti', icon: 'pasta', display_order: 5 },
    { name: 'Secondi Piatti', icon: 'main-course', display_order: 6 },
  ],

  bistrot: [
    { name: 'Entrées', description: 'Antipasti', icon: 'appetizer', display_order: 1 },
    { name: 'Plats', description: 'Piatti principali', icon: 'main-course', display_order: 2 },
    { name: 'Salades', description: 'Insalate', icon: 'salad', display_order: 3 },
    { name: 'Desserts', icon: 'dessert', display_order: 4 },
    { name: 'Vins et Boissons', description: 'Vini e bevande', icon: 'wine', display_order: 5 },
  ],

  tavola_calda: [
    { name: 'Primi Piatti', description: 'Paste e riso', icon: 'pasta', display_order: 1 },
    { name: 'Secondi Piatti', description: 'Carne e pesce', icon: 'main-course', display_order: 2 },
    { name: 'Contorni', icon: 'salad', display_order: 3 },
    { name: 'Panini', icon: 'sandwich', display_order: 4 },
    { name: 'Bibite', icon: 'drink', display_order: 5 },
  ],

  rosticceria: [
    { name: 'Pollo e Carne', description: 'Specialità alla griglia', icon: 'chicken', display_order: 1 },
    { name: 'Friggitoria', description: 'Fritti e panzerotti', icon: 'fries', display_order: 2 },
    { name: 'Primi Piatti', icon: 'pasta', display_order: 3 },
    { name: 'Contorni', icon: 'salad', display_order: 4 },
    { name: 'Bibite', icon: 'drink', display_order: 5 },
  ],

  pasticceria: [
    { name: 'Pasticceria Secca', description: 'Biscotti e frollini', icon: 'cookie', display_order: 1 },
    { name: 'Torte da Forno', description: 'Classiche e moderne', icon: 'cake', display_order: 2 },
    { name: 'Torte su Ordinazione', description: 'Per eventi speciali', icon: 'cake', display_order: 3 },
    { name: 'Pasticcini Mignon', description: 'Piccole delizie', icon: 'dessert', display_order: 4 },
    { name: 'Caffetteria', description: 'Per accompagnare', icon: 'coffee', display_order: 5 },
  ],

  gelateria: [
    { name: 'Gelati Classici', description: 'Gusti tradizionali', icon: 'ice-cream', display_order: 1 },
    { name: 'Gelati Speciali', description: 'Creazioni uniche', icon: 'ice-cream', display_order: 2 },
    { name: 'Sorbetti', description: 'Senza latte', icon: 'ice-cream', display_order: 3 },
    { name: 'Coppe e Semifreddi', description: 'Per tutti i gusti', icon: 'dessert', display_order: 4 },
    { name: 'Granite', description: 'Freschezza siciliana', icon: 'drink', display_order: 5 },
  ],
}

/**
 * Ottiene i preset di sezioni per un tipo di attività
 */
export function getSectionPresets(restaurantType: RestaurantType): SectionPreset[] {
  return SECTION_PRESETS[restaurantType] || []
}

/**
 * Verifica se esistono preset per un tipo di attività
 */
export function hasPresets(restaurantType: RestaurantType): boolean {
  return restaurantType in SECTION_PRESETS && SECTION_PRESETS[restaurantType].length > 0
}

/**
 * Ottiene tutti i tipi di attività con preset disponibili
 */
export function getRestaurantTypesWithPresets(): RestaurantType[] {
  return Object.keys(SECTION_PRESETS) as RestaurantType[]
}

/**
 * Crea le sezioni da preset per un menu
 * Questa funzione può essere usata quando si crea un nuovo menu
 */
export function createSectionsFromPreset(
  menuId: string,
  restaurantType: RestaurantType
): Array<{
  menu_id: string
  name: string
  description?: string
  icon?: string
  display_order: number
  is_visible: boolean
}> {
  const presets = getSectionPresets(restaurantType)
  
  return presets.map(preset => ({
    menu_id: menuId,
    name: preset.name,
    description: preset.description,
    icon: preset.icon,
    display_order: preset.display_order,
    is_visible: true,
  }))
}

/**
 * Personalizza i preset (esempio: per permettere all'utente di scegliere quali sezioni vuole)
 */
export function customizePresets(
  restaurantType: RestaurantType,
  selectedSectionNames: string[]
): SectionPreset[] {
  const allPresets = getSectionPresets(restaurantType)
  return allPresets.filter(preset => selectedSectionNames.includes(preset.name))
}