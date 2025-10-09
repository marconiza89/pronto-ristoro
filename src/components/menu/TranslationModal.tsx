// src/components/menu/TranslationModal.tsx - VERSIONE CORRETTA COMPLETA
'use client'

import { useState, useEffect } from 'react'
import type { Menu, MenuSection } from '@/types/menu'
import type { MenuItem } from '@/types/menuItem'
import type { LanguageCode } from '@/types/restaurant'
import { getMenuItemWithRelations } from '@/utils/menu/menu-item-helpers'
import { ALLERGEN_LABELS_IT } from '@/types/menuItem'

interface TranslationModalProps {
  isOpen: boolean
  onClose: () => void
  menu: Menu
  sections: MenuSection[]
  sectionItems: Record<string, MenuItem[]>
  onTranslationsComplete: () => void
}

interface TranslationItem {
  id: string
  type: 'menu_name' | 'menu_description' | 'section_name' | 'section_description' | 'item_name' | 'item_description' | 'ingredient' | 'allergen'
  content: string
  label: string
  entityId: string
  checked: boolean
  parentLabel?: string
}

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'Inglese', flag: '🇬🇧' },
  { code: 'fr', label: 'Francese', flag: '🇫🇷' },
  { code: 'de', label: 'Tedesco', flag: '🇩🇪' },
  { code: 'es', label: 'Spagnolo', flag: '🇪🇸' },
  { code: 'pt', label: 'Portoghese', flag: '🇵🇹' },
  { code: 'zh', label: 'Cinese', flag: '🇨🇳' },
  { code: 'ja', label: 'Giapponese', flag: '🇯🇵' },
  { code: 'ar', label: 'Arabo', flag: '🇸🇦' },
  { code: 'ru', label: 'Russo', flag: '🇷🇺' },
]

export default function TranslationModal({
  isOpen,
  onClose,
  menu,
  sections,
  sectionItems,
  onTranslationsComplete,
}: TranslationModalProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageCode[]>(['en'])
  const [translationItems, setTranslationItems] = useState<TranslationItem[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      buildTranslationItems()
    }
  }, [isOpen, menu, sections, sectionItems])

  const buildTranslationItems = async () => {
    setIsLoading(true)
    const items: TranslationItem[] = []

    try {
      // Menu Name (non selezionato di default)
      if (menu.name?.trim()) {
        items.push({
          id: `menu-name-${menu.id}`,
          type: 'menu_name',
          content: menu.name,
          label: 'Nome Menu',
          entityId: menu.id,
          checked: false,
        })
      }

      // Menu Description (selezionato di default)
      if (menu.description?.trim()) {
        items.push({
          id: `menu-desc-${menu.id}`,
          type: 'menu_description',
          content: menu.description,
          label: 'Descrizione Menu',
          entityId: menu.id,
          checked: true,
        })
      }

      // Sections
      for (const section of sections) {
        // Section Name (non selezionato)
        if (section.name?.trim()) {
          items.push({
            id: `section-name-${section.id}`,
            type: 'section_name',
            content: section.name,
            label: `Nome Sezione`,
            entityId: section.id,
            parentLabel: section.name,
            checked: false,
          })
        }

        // Section Description (selezionato)
        if (section.description?.trim()) {
          items.push({
            id: `section-desc-${section.id}`,
            type: 'section_description',
            content: section.description,
            label: `Descrizione Sezione`,
            entityId: section.id,
            parentLabel: section.name,
            checked: true,
          })
        }

        // Items in this section
        const items_in_section = sectionItems[section.id] || []

        for (const item of items_in_section) {
          // Item Name (non selezionato)
          if (item.name?.trim()) {
            items.push({
              id: `item-name-${item.id}`,
              type: 'item_name',
              content: item.name,
              label: `Nome Piatto`,
              entityId: item.id,
              parentLabel: `${section.name} → ${item.name}`,
              checked: false,
            })
          }

          // Item Description (selezionato)
          if (item.description?.trim()) {
            items.push({
              id: `item-desc-${item.id}`,
              type: 'item_description',
              content: item.description,
              label: `Descrizione Piatto`,
              entityId: item.id,
              parentLabel: `${section.name} → ${item.name}`,
              checked: true,
            })
          }

          // Carica dettagli completi dell'item per ingredienti e allergeni
          try {
            const fullItem = await getMenuItemWithRelations(item.id)

            if (fullItem) {
              // INGREDIENTI - OGNI INGREDIENTE HA IL SUO ID
              if (fullItem.ingredients && fullItem.ingredients.length > 0) {
                fullItem.ingredients.forEach((ingredient) => {
                  if (ingredient.name?.trim()) {
                    items.push({
                      id: `ingredient-${ingredient.id}`,
                      type: 'ingredient',
                      content: ingredient.name,
                      label: `Ingrediente: ${ingredient.name}`,
                      entityId: ingredient.id, // ⭐ QUESTO È L'ID DELL'INGREDIENTE SPECIFICO
                      parentLabel: `${section.name} → ${item.name}`,
                      checked: true,
                    })
                  }
                })
              }

              // ALLERGENI - OGNI ALLERGENE HA IL SUO ID
              if (fullItem.allergens && fullItem.allergens.length > 0) {
                fullItem.allergens.forEach((allergen) => {
                  const allergenName = ALLERGEN_LABELS_IT[allergen.allergen_code] || allergen.allergen_code
                  items.push({
                    id: `allergen-${allergen.id}`,
                    type: 'allergen',
                    content: allergenName,
                    label: `Allergene: ${allergenName}`,
                    entityId: allergen.id, // ⭐ QUESTO È L'ID DELLA RELAZIONE ITEM-ALLERGEN
                    parentLabel: `${section.name} → ${item.name}`,
                    checked: true,
                  })
                })
              }
            }
          } catch (err) {
            console.error(`Error loading details for item ${item.id}:`, err)
          }
        }
      }

      setTranslationItems(items)
    } catch (err) {
      console.error('Error building translation items:', err)
      setError('Errore nel caricamento dei contenuti da tradurre')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItem = (itemId: string) => {
    setTranslationItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const toggleLanguage = (langCode: LanguageCode) => {
    setSelectedLanguages((prev) =>
      prev.includes(langCode)
        ? prev.filter((l) => l !== langCode)
        : [...prev, langCode]
    )
  }

  const selectAll = () => {
    setTranslationItems((prev) => prev.map((item) => ({ ...item, checked: true })))
  }

  const deselectAll = () => {
    setTranslationItems((prev) => prev.map((item) => ({ ...item, checked: false })))
  }

  const handleTranslate = async () => {
    const itemsToTranslate = translationItems.filter((item) => item.checked)

    if (itemsToTranslate.length === 0) {
      setError('Seleziona almeno un elemento da tradurre')
      return
    }

    if (selectedLanguages.length === 0) {
      setError('Seleziona almeno una lingua')
      return
    }

    setIsTranslating(true)
    setError(null)
    setProgress({ current: 0, total: itemsToTranslate.length * selectedLanguages.length })

    try {
      let completed = 0
      let failed = 0

      for (const item of itemsToTranslate) {
        for (const langCode of selectedLanguages) {
          try {
            // Chiamata API per traduzione
            const response = await fetch('/api/translation/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: item.content,
                languageCode: langCode,
                type: item.type,
                entityId: item.entityId,
                menuId: menu.id,
              }),
            })

            if (!response.ok) {
              console.error(`Errore traduzione ${item.label} in ${langCode}`)
              failed++
            }

            completed++
            setProgress({ 
              current: completed, 
              total: itemsToTranslate.length * selectedLanguages.length 
            })

          } catch (err) {
            console.error(`Errore traduzione ${item.label}:`, err)
            failed++
            completed++
            setProgress({ 
              current: completed, 
              total: itemsToTranslate.length * selectedLanguages.length 
            })
          }
        }
      }

      // Mostra risultato
      if (failed === 0) {
        onTranslationsComplete()
        onClose()
      } else {
        setError(`${completed - failed} traduzioni completate, ${failed} fallite`)
      }

    } catch (err: any) {
      setError(err.message || 'Errore durante le traduzioni')
    } finally {
      setIsTranslating(false)
    }
  }

  if (!isOpen) return null

  const selectedCount = translationItems.filter((i) => i.checked).length
  const totalCount = translationItems.length

  // Raggruppa items per tipo
  const menuItems = translationItems.filter(i => i.type.startsWith('menu_'))
  const sectionTranslationItems = translationItems.filter(i => i.type.startsWith('section_'))
  const itemItems = translationItems.filter(i => i.type.startsWith('item_'))
  const ingredientItems = translationItems.filter(i => i.type === 'ingredient')
  const allergenItems = translationItems.filter(i => i.type === 'allergen')

  return (
    <div
      style={{ backdropFilter: 'blur(10px)' }}
      className="fixed inset-0 bg-mainblue/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-mainblue">
              Traduzioni Automatiche
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Seleziona i contenuti da tradurre e le lingue di destinazione
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isTranslating}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Language Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              🌍 Lingue di destinazione
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <label
                  key={lang.code}
                  className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedLanguages.includes(lang.code)
                      ? 'bg-mainblue/10 border-mainblue'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang.code)}
                    onChange={() => toggleLanguage(lang.code)}
                    disabled={isTranslating}
                    className="w-4 h-4 text-mainblue border-gray-300 rounded focus:ring-mainblue"
                  />
                  <span className="ml-2 text-2xl">{lang.flag}</span>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {lang.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Content Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                📝 Contenuti da tradurre ({selectedCount}/{totalCount})
              </h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={isTranslating || isLoading}
                  className="text-xs text-mainblue hover:text-mainblue-light disabled:opacity-50"
                >
                  Seleziona tutto
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  disabled={isTranslating || isLoading}
                  className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Deseleziona tutto
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mainblue"></div>
                <p className="text-sm text-gray-600 mt-2">Caricamento contenuti...</p>
              </div>
            ) : translationItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nessun contenuto disponibile per la traduzione.</p>
                <p className="text-sm mt-2">Aggiungi descrizioni e contenuti prima di tradurre.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto border border-gray-200 rounded-md p-3">
                {/* Menu Section */}
                {menuItems.length > 0 && (
                  <TranslationGroup
                    title="Menu"
                    icon="📋"
                    items={menuItems}
                    onToggle={toggleItem}
                    disabled={isTranslating}
                  />
                )}

                {/* Sections */}
                {sectionTranslationItems.length > 0 && (
                  <TranslationGroup
                    title="Sezioni"
                    icon="📑"
                    items={sectionTranslationItems}
                    onToggle={toggleItem}
                    disabled={isTranslating}
                  />
                )}

                {/* Items */}
                {itemItems.length > 0 && (
                  <TranslationGroup
                    title="Piatti"
                    icon="🍽️"
                    items={itemItems}
                    onToggle={toggleItem}
                    disabled={isTranslating}
                  />
                )}

                {/* Ingredients */}
                {ingredientItems.length > 0 && (
                  <TranslationGroup
                    title="Ingredienti"
                    icon="🥬"
                    items={ingredientItems}
                    onToggle={toggleItem}
                    disabled={isTranslating}
                  />
                )}

                {/* Allergens */}
                {allergenItems.length > 0 && (
                  <TranslationGroup
                    title="Allergeni"
                    icon="⚠️"
                    items={allergenItems}
                    onToggle={toggleItem}
                    disabled={isTranslating}
                  />
                )}
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Suggerimento:</strong> I nomi di menu, sezioni e piatti non sono selezionati di default
              perché spesso rimangono nella lingua originale per mantenere l'autenticità.
              Le descrizioni e gli ingredienti sono selezionati automaticamente per aiutare i clienti.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {isTranslating && (
          <div className="px-6 py-3 bg-gray-50 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Traduzione in corso...
              </span>
              <span className="text-sm text-gray-600">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-mainblue h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedCount > 0 && selectedLanguages.length > 0 && (
              <>
                Traduzioni da creare: <strong>{selectedCount * selectedLanguages.length}</strong>
              </>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isTranslating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || isLoading || selectedCount === 0 || selectedLanguages.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-mainblue-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? 'Traduzione in corso...' : 'Traduci selezionati'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente helper per gruppi
function TranslationGroup({
  title,
  icon,
  items,
  onToggle,
  disabled
}: {
  title: string
  icon: string
  items: TranslationItem[]
  onToggle: (id: string) => void
  disabled: boolean
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
        <span className="mr-1">{icon}</span>
        {title} ({items.length})
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <TranslationItemRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

// Componente helper per riga
function TranslationItemRow({
  item,
  onToggle,
  disabled
}: {
  item: TranslationItem
  onToggle: (id: string) => void
  disabled: boolean
}) {
  return (
    <label
      className={`flex items-start p-2 border rounded-md cursor-pointer transition-colors ${
        item.checked
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id)}
        disabled={disabled}
        className="w-4 h-4 mt-0.5 text-mainblue border-gray-300 rounded focus:ring-mainblue flex-shrink-0"
      />
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {item.label}
          </span>
          {item.parentLabel && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded truncate max-w-xs">
              {item.parentLabel}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
          {item.content}
        </p>
      </div>
    </label>
  )
}