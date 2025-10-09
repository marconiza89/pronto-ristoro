// src/components/menu/MenuItemModal.tsx
'use client'

import { useState, useEffect } from 'react'
import type {
  MenuItem,
  ItemType,
  AllergenCode,
  DietaryTagCode,
  ServingFormat,
  WineType,
  BeerStyle,
  ITEM_TYPE_LABELS,
  ALLERGEN_LABELS_IT,
  DIETARY_TAG_LABELS_IT,
  SERVING_FORMAT_LABELS,
  WINE_TYPE_LABELS,
  BEER_STYLE_LABELS,
} from '@/types/menuItem'
import {
  createMenuItem,
  updateMenuItem,
  createIngredient,
  deleteIngredient,
  addAllergenToItem,
  removeAllergenFromItem,
  addDietaryTagToItem,
  removeDietaryTagFromItem,
  getMenuItemWithRelations,
} from '@/utils/menu/menu-item-helpers'
import ItemImageManager from './ItemImageManager'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  sectionId: string
  itemToEdit?: MenuItem | null
  onSuccess: () => void
}

const ITEM_TYPES: ItemType[] = ['food', 'drink', 'wine', 'beer', 'cocktail', 'dessert']

const ALLERGEN_CODES: AllergenCode[] = [
  'glutine',
  'lattosio',
  'uova',
  'pesce',
  'crostacei',
  'frutta_a_guscio',
  'arachidi',
  'soia',
  'sedano',
  'senape',
  'sesamo',
  'solfiti',
  'lupini',
  'molluschi',
]

const DIETARY_TAG_CODES: DietaryTagCode[] = [
  'vegetariano',
  'vegano',
  'senza_glutine',
  'senza_lattosio',
  'biologico',
  'piccante',
  'crudo',
  'halal',
  'kosher',
]

export default function MenuItemModal({
  isOpen,
  onClose,
  sectionId,
  itemToEdit,
  onSuccess,
}: MenuItemModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'base' | 'details' | 'allergens'>('base')
  const [userId, setUserId] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  // Form fields - Base
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [itemType, setItemType] = useState<ItemType>('food')
  const [price, setPrice] = useState<string>('')
  const [imageUrl, setImageUrl] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [autoCompleting, setAutoCompleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form fields - Details
  const [preparationTime, setPreparationTime] = useState<string>('')
  const [calories, setCalories] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')

  // Form fields - Alcohol
  const [alcoholContent, setAlcoholContent] = useState<string>('')
  const [servingFormat, setServingFormat] = useState<ServingFormat>('glass')
  const [volumeMl, setVolumeMl] = useState<string>('')

  // Form fields - Wine
  const [wineType, setWineType] = useState<WineType>('red')
  const [grapeVariety, setGrapeVariety] = useState('')
  const [wineRegion, setWineRegion] = useState('')
  const [wineProducer, setWineProducer] = useState('')
  const [vintage, setVintage] = useState<string>('')

  // Form fields - Beer
  const [beerStyle, setBeerStyle] = useState<BeerStyle>('lager')
  const [brewery, setBrewery] = useState('')
  const [ibu, setIbu] = useState<string>('')

  // Allergens & Tags
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenCode[]>([])
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryTagCode[]>([])

  useEffect(() => {
    if (itemToEdit) {
      loadItemData()
    } else {
      resetForm()
    }
  }, [itemToEdit, isOpen])



  const loadItemData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)
    if (!itemToEdit) return

    try {
      const fullItem = await getMenuItemWithRelations(itemToEdit.id)
      if (!fullItem) return

      setName(fullItem.name)
      setDescription(fullItem.description || '')
      setItemType(fullItem.item_type)
      setPrice(fullItem.price?.toString() || '')
      setImageUrl(fullItem.image_url || '')
      setIsAvailable(fullItem.is_available)
      setIsFeatured(fullItem.is_featured)

      setPreparationTime(fullItem.preparation_time?.toString() || '')
      setCalories(fullItem.calories?.toString() || '')
      setWeight(fullItem.weight?.toString() || '')

      if (fullItem.ingredients) {
        setIngredients(fullItem.ingredients.map(i => i.name))
      }

      setAlcoholContent(fullItem.alcohol_content?.toString() || '')
      setServingFormat(fullItem.serving_format || 'glass')
      setVolumeMl(fullItem.volume_ml?.toString() || '')

      setWineType(fullItem.wine_type || 'red')
      setGrapeVariety(fullItem.grape_variety || '')
      setWineRegion(fullItem.wine_region || '')
      setWineProducer(fullItem.wine_producer || '')
      setVintage(fullItem.vintage?.toString() || '')

      setBeerStyle(fullItem.beer_style || 'lager')
      setBrewery(fullItem.brewery || '')
      setIbu(fullItem.ibu?.toString() || '')

      if (fullItem.allergens) {
        setSelectedAllergens(fullItem.allergens.map(a => a.allergen_code))
      }

      if (fullItem.dietary_tags) {
        setSelectedDietaryTags(fullItem.dietary_tags.map(t => t.tag_code))
      }
    } catch (err) {
      console.error('Error loading item data:', err)
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setItemType('food')
    setPrice('')
    setImageUrl('')
    setIsAvailable(true)
    setIsFeatured(false)
    setPreparationTime('')
    setCalories('')
    setWeight('')
    setIngredients([])
    setNewIngredient('')
    setAlcoholContent('')
    setServingFormat('glass')
    setVolumeMl('')
    setWineType('red')
    setGrapeVariety('')
    setWineRegion('')
    setWineProducer('')
    setVintage('')
    setBeerStyle('lager')
    setBrewery('')
    setIbu('')
    setSelectedAllergens([])
    setSelectedDietaryTags([])
    setActiveTab('base')
    setError(null)
  }

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()])
      setNewIngredient('')
    }
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const toggleAllergen = (code: AllergenCode) => {
    setSelectedAllergens(prev =>
      prev.includes(code) ? prev.filter(a => a !== code) : [...prev, code]
    )
  }

  const toggleDietaryTag = (code: DietaryTagCode) => {
    setSelectedDietaryTags(prev =>
      prev.includes(code) ? prev.filter(t => t !== code) : [...prev, code]
    )
  }

  const handleAutoComplete = async () => {
    if (!name.trim()) return

    setAutoCompleting(true)
    setError(null)

    try {
      const response = await fetch('/api/items/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: name.trim(),
          itemType: itemType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Errore durante il completamento automatico')
      }

      const data = await response.json()

      // Compila i campi con i dati ricevuti
      if (data.description) {
        setDescription(data.description)
      }

      // Compila ingredienti (array separato)
      if (data.ingredients && Array.isArray(data.ingredients)) {
        setIngredients(data.ingredients)
      }

      // Compila allergeni
      if (data.allergens && Array.isArray(data.allergens)) {
        setSelectedAllergens(data.allergens)
      }

      // Compila calorie
      if (data.calories) {
        setCalories(data.calories.toString())
      }

      // Mostra messaggio di successo
      setSuccessMessage('Informazioni compilate automaticamente! Verifica e modifica se necessario.')
      setTimeout(() => setSuccessMessage(null), 5000)

    } catch (err: any) {
      setError(err.message || 'Errore durante il completamento automatico')
    } finally {
      setAutoCompleting(false)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Il nome è obbligatorio')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const itemData = {
        section_id: sectionId,
        item_type: itemType,
        name: name.trim(),
        description: description.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        image_url: imageUrl.trim() || undefined,
        is_available: isAvailable,
        is_featured: isFeatured,
        preparation_time: preparationTime ? parseInt(preparationTime) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        weight: weight ? parseInt(weight) : undefined,
        alcohol_content: alcoholContent ? parseFloat(alcoholContent) : undefined,
        serving_format: ['wine', 'beer', 'drink', 'cocktail'].includes(itemType)
          ? servingFormat
          : undefined,
        volume_ml: volumeMl ? parseInt(volumeMl) : undefined,
        wine_type: itemType === 'wine' ? wineType : undefined,
        grape_variety: itemType === 'wine' && grapeVariety ? grapeVariety : undefined,
        wine_region: itemType === 'wine' && wineRegion ? wineRegion : undefined,
        wine_producer: itemType === 'wine' && wineProducer ? wineProducer : undefined,
        vintage: itemType === 'wine' && vintage ? parseInt(vintage) : undefined,
        beer_style: itemType === 'beer' ? beerStyle : undefined,
        brewery: itemType === 'beer' && brewery ? brewery : undefined,
        ibu: itemType === 'beer' && ibu ? parseInt(ibu) : undefined,
      }

      let itemId: string

      if (itemToEdit) {
        // Update existing item
        const updated = await updateMenuItem(itemToEdit.id, itemData)
        if (!updated) throw new Error('Errore durante l\'aggiornamento')
        itemId = updated.id
      } else {
        // Create new item
        const created = await createMenuItem(itemData)
        if (!created) throw new Error('Errore durante la creazione')
        itemId = created.id
      }

     if (itemToEdit) {
        const { data: existingIngredients } = await supabase
          .from('item_ingredients')
          .select('id')
          .eq('item_id', itemId)
        
        if (existingIngredients && existingIngredients.length > 0) {
          for (const ing of existingIngredients) {
            await deleteIngredient(ing.id)
          }
        }
      }
      
      // Poi aggiungi i nuovi ingredienti
      for (const ing of ingredients) {
        await createIngredient({
          item_id: itemId,
          name: ing,
          display_order: ingredients.indexOf(ing),
        })
      }

      // Gestione allergeni
      for (const code of selectedAllergens) {
        await addAllergenToItem({ item_id: itemId, allergen_code: code })
      }

      // Gestione tag dietetici
      for (const code of selectedDietaryTags) {
        await addDietaryTagToItem({ item_id: itemId, tag_code: code })
      }

      onSuccess()
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const showAlcoholFields = ['wine', 'beer', 'drink', 'cocktail'].includes(itemType)
  const showWineFields = itemType === 'wine'
  const showBeerFields = itemType === 'beer'

  return (
    <div style={{ backdropFilter: 'blur(10px)' }} className="fixed inset-0 bg-mainblue/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-mainblue">
            {itemToEdit ? 'Modifica Piatto' : 'Nuovo Piatto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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

        {/* Tabs */}
        <div className="border-b px-6">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('base')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'base'
                ? 'border-mainblue text-mainblue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Informazioni Base
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                ? 'border-mainblue text-mainblue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Dettagli
            </button>
            <button
              onClick={() => setActiveTab('allergens')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'allergens'
                ? 'border-mainblue text-mainblue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Allergeni & Tag
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB: Informazioni Base */}
          {activeTab === 'base' && (
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Piatto *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es. Spaghetti alla Carbonara"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                />
              </div>

              {/* Tipo Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as ItemType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type === 'food' && 'Cibo'}
                      {type === 'drink' && 'Bevanda'}
                      {type === 'wine' && 'Vino'}
                      {type === 'beer' && 'Birra'}
                      {type === 'cocktail' && 'Cocktail'}
                      {type === 'dessert' && 'Dolce'}
                    </option>
                  ))}
                </select>
              </div>
              {/* Auto-complete AI */}
              {itemToEdit && name.trim() && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        ✨ Compila automaticamente con AI
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">
                        L'intelligenza artificiale può generare descrizione, ingredienti, allergeni e calorie basandosi sul nome del piatto. Potrai sempre modificare i dati generati.
                      </p>
                      <button
                        type="button"
                        onClick={handleAutoComplete}
                        disabled={autoCompleting}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {autoCompleting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generazione in corso...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Compila con AI
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Descrizione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi il piatto..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                />
              </div>

              {/* Prezzo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prezzo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="12.50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                />
              </div>

              {/* Image URL */}
              <div>  <ItemImageManager value={imageUrl} onChange={setImageUrl} userId={userId} itemId={itemToEdit?.id} itemName={name} /> </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-mainblue border-gray-300 rounded focus:ring-mainblue"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Disponibile
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-mainblue border-gray-300 rounded focus:ring-mainblue"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Piatto in evidenza
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Dettagli */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Informazioni nutrizionali */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo preparazione (min)
                  </label>
                  <input
                    type="number"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    placeholder="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calorie
                  </label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="450"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (g)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="350"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>
              </div>

              {/* Ingredienti */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredienti
                </label>
                <div className="space-y-2">
                  {ingredients.map((ing, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm">
                        {ing}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                      placeholder="Aggiungi ingrediente..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="px-4 py-2 bg-mainblue text-white rounded-md hover:bg-mainblue-light"
                    >
                      Aggiungi
                    </button>
                  </div>
                </div>
              </div>

              {/* Campi specifici per bevande alcoliche */}
              {showAlcoholFields && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Informazioni Bevanda
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gradazione (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={alcoholContent}
                          onChange={(e) => setAlcoholContent(e.target.value)}
                          placeholder="13.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Formato
                        </label>
                        <select
                          value={servingFormat}
                          onChange={(e) => setServingFormat(e.target.value as ServingFormat)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                        >
                          <option value="glass">Calice</option>
                          <option value="bottle">Bottiglia</option>
                          <option value="draft">Alla spina</option>
                          <option value="can">Lattina</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Volume (ml)
                        </label>
                        <input
                          type="number"
                          value={volumeMl}
                          onChange={(e) => setVolumeMl(e.target.value)}
                          placeholder="750"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campi specifici vino */}
                  {showWineFields && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo Vino
                        </label>
                        <select
                          value={wineType}
                          onChange={(e) => setWineType(e.target.value as WineType)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                        >
                          <option value="red">Rosso</option>
                          <option value="white">Bianco</option>
                          <option value="rose">Rosato</option>
                          <option value="sparkling">Spumante</option>
                          <option value="champagne">Champagne</option>
                          <option value="dessert_wine">Vino da dessert</option>
                          <option value="fortified">Liquoroso</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vitigno
                        </label>
                        <input
                          type="text"
                          value={grapeVariety}
                          onChange={(e) => setGrapeVariety(e.target.value)}
                          placeholder="Es. Sangiovese"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Regione
                          </label>
                          <input
                            type="text"
                            value={wineRegion}
                            onChange={(e) => setWineRegion(e.target.value)}
                            placeholder="Es. Toscana"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Anno
                          </label>
                          <input
                            type="number"
                            value={vintage}
                            onChange={(e) => setVintage(e.target.value)}
                            placeholder="2020"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Produttore
                        </label>
                        <input
                          type="text"
                          value={wineProducer}
                          onChange={(e) => setWineProducer(e.target.value)}
                          placeholder="Nome produttore"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                        />
                      </div>
                    </div>
                  )}

                  {/* Campi specifici birra */}
                  {showBeerFields && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stile Birra
                        </label>
                        <select
                          value={beerStyle}
                          onChange={(e) => setBeerStyle(e.target.value as BeerStyle)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                        >
                          <option value="lager">Lager</option>
                          <option value="ale">Ale</option>
                          <option value="ipa">IPA</option>
                          <option value="stout">Stout</option>
                          <option value="pilsner">Pilsner</option>
                          <option value="wheat">Weiss/Wheat</option>
                          <option value="sour">Sour</option>
                          <option value="porter">Porter</option>
                          <option value="amber">Ambrata</option>
                          <option value="other">Altro</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Birrificio
                          </label>
                          <input
                            type="text"
                            value={brewery}
                            onChange={(e) => setBrewery(e.target.value)}
                            placeholder="Nome birrificio"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            IBU (Amarezza)
                          </label>
                          <input
                            type="number"
                            value={ibu}
                            onChange={(e) => setIbu(e.target.value)}
                            placeholder="40"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB: Allergeni & Tag */}
          {activeTab === 'allergens' && (
            <div className="space-y-6">
              {/* Allergeni */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Allergeni Presenti
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {ALLERGEN_CODES.map((code) => (
                    <label
                      key={code}
                      className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${selectedAllergens.includes(code)
                        ? 'bg-red-50 border-red-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAllergens.includes(code)}
                        onChange={() => toggleAllergen(code)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {code === 'glutine' && 'Glutine'}
                        {code === 'lattosio' && 'Lattosio'}
                        {code === 'uova' && 'Uova'}
                        {code === 'pesce' && 'Pesce'}
                        {code === 'crostacei' && 'Crostacei'}
                        {code === 'frutta_a_guscio' && 'Frutta a guscio'}
                        {code === 'arachidi' && 'Arachidi'}
                        {code === 'soia' && 'Soia'}
                        {code === 'sedano' && 'Sedano'}
                        {code === 'senape' && 'Senape'}
                        {code === 'sesamo' && 'Sesamo'}
                        {code === 'solfiti' && 'Solfiti'}
                        {code === 'lupini' && 'Lupini'}
                        {code === 'molluschi' && 'Molluschi'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tag Dietetici */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Tag Dietetici
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {DIETARY_TAG_CODES.map((code) => (
                    <label
                      key={code}
                      className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${selectedDietaryTags.includes(code)
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDietaryTags.includes(code)}
                        onChange={() => toggleDietaryTag(code)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {code === 'vegetariano' && 'Vegetariano'}
                        {code === 'vegano' && 'Vegano'}
                        {code === 'senza_glutine' && 'Senza glutine'}
                        {code === 'senza_lattosio' && 'Senza lattosio'}
                        {code === 'biologico' && 'Biologico'}
                        {code === 'piccante' && 'Piccante'}
                        {code === 'crudo' && 'Crudo'}
                        {code === 'halal' && 'Halal'}
                        {code === 'kosher' && 'Kosher'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-mainblue-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvataggio...' : itemToEdit ? 'Salva modifiche' : 'Crea piatto'}
          </button>
        </div>
      </div>
    </div>
  )
}