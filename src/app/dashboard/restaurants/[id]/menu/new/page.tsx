// src/app/dashboard/restaurants/[id]/menu/new/page.tsx
'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/utils/supabase/client'
import { createMenuWithPresets } from '@/utils/menu/menu-helpers'
import { attachMenuToRestaurant } from '@/utils/menu/menu-helpers'
import { getSectionPresets } from '@/utils/menu/SectionPresetManager'
import type { RestaurantType } from '@/types/restaurant'
import type { Restaurant } from '@/types/restaurant'

export default function NewMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  // Form fields
  const [menuName, setMenuName] = useState('')
  const [menuDescription, setMenuDescription] = useState('')
  const [usePresets, setUsePresets] = useState(true)
  const [isPrimary, setIsPrimary] = useState(false)

  const loadRestaurant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (restaurantError) throw restaurantError

      if (data.user_id !== user.id) {
        router.push('/dashboard')
        return
      }

      setRestaurant(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurant) return

    setCreating(true)
    setError(null)

    try {
      let menuId: string

      if (usePresets) {
        // Crea menu con sezioni predefinite
        const result = await createMenuWithPresets({
          name: menuName.trim(),
          description: menuDescription.trim() || undefined,
          is_active: true,
          restaurantType: restaurant.type as RestaurantType,
        })

        if (!result) throw new Error('Errore durante la creazione del menu')
        menuId = result.menu.id
      } else {
        // Crea menu vuoto
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data: menu, error: menuError } = await supabase
          .from('menus')
          .insert({
            user_id: user.id,
            name: menuName.trim(),
            description: menuDescription.trim() || undefined,
            is_active: true,
          })
          .select()
          .single()

        if (menuError) throw menuError
        menuId = menu.id
      }

      // Collega il menu al ristorante
      const attached = await attachMenuToRestaurant({
        restaurant_id: restaurantId,
        menu_id: menuId,
        is_primary: isPrimary,
        display_order: 0,
      })

      if (!attached) throw new Error('Errore nel collegamento del menu al ristorante')

      // Redirect alla pagina di gestione del menu
      router.push(`/dashboard/restaurants/${restaurantId}/menu/${menuId}`)
    } catch (err: any) {
      setError(err.message || 'Errore durante la creazione del menu')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-mainblue">Caricamento...</div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Ristorante non trovato</div>
      </div>
    )
  }

  const presets = getSectionPresets(restaurant.type as RestaurantType)

  return (
    <div className="min-h-screen font-roboto text-mainblue bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/restaurants/${restaurantId}`}
            className="inline-flex items-center text-sm text-mainblue hover:text-mainblue-light mb-4"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Torna al ristorante
          </Link>
          <h1 className="text-3xl font-extrabold text-mainblue">
            Crea nuovo menu
          </h1>
          <p className="mt-2 text-gray-600">
            Per {restaurant.name}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-xl rounded-lg border border-gray-300">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Nome Menu */}
            <div>
              <label htmlFor="menuName" className="block text-sm font-medium text-mainblue mb-2">
                Nome del menu *
              </label>
              <input
                id="menuName"
                type="text"
                required
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Es. Menu Primavera 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
              />
              <p className="mt-1 text-sm text-gray-500">
                Un nome identificativo per questo menu
              </p>
            </div>

            {/* Descrizione */}
            <div>
              <label htmlFor="menuDescription" className="block text-sm font-medium text-mainblue mb-2">
                Descrizione (opzionale)
              </label>
              <textarea
                id="menuDescription"
                value={menuDescription}
                onChange={(e) => setMenuDescription(e.target.value)}
                rows={3}
                placeholder="Es. Menu stagionale con prodotti freschi di stagione"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
              />
            </div>

            {/* Opzione Preset */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="usePresets"
                    type="checkbox"
                    checked={usePresets}
                    onChange={(e) => setUsePresets(e.target.checked)}
                    className="w-4 h-4 text-mainblue border-gray-300 rounded focus:ring-mainblue"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="usePresets" className="text-sm font-medium text-gray-700">
                    Crea sezioni predefinite
                  </label>
                  <p className="text-sm text-gray-500">
                    Genera automaticamente le sezioni tipiche per un {restaurant.type.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Anteprima Preset */}
              {usePresets && presets.length > 0 && (
                <div className="ml-7 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Sezioni che verranno create:
                  </p>
                  <ul className="space-y-1">
                    {presets.map((preset, idx) => (
                      <li key={idx} className="text-sm text-blue-800 flex items-center">
                        <span className="mr-2">•</span>
                        <strong>{preset.name}</strong>
                        {preset.description && (
                          <span className="text-blue-600 ml-2">- {preset.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-blue-700 mt-3 italic">
                    Potrai modificare, eliminare o aggiungere sezioni dopo la creazione
                  </p>
                </div>
              )}
            </div>

            {/* Menu Principale */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isPrimary"
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 text-mainblue border-gray-300 rounded focus:ring-mainblue"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
                  Imposta come menu principale
                </label>
                <p className="text-sm text-gray-500">
                  Il menu principale sarà visualizzato di default
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-mainblue/5 rounded-lg border border-mainblue/20 p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-mainblue mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-mainblue">
                  <p className="font-medium mb-1">Nota</p>
                  <p>
                    Dopo aver creato il menu, potrai aggiungere piatti e prodotti alle sezioni.
                    Il menu può essere condiviso tra più ristoranti se ne hai più di uno.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <Link
                href={`/dashboard/restaurants/${restaurantId}`}
                className="px-4 py-2 text-sm font-medium text-mainblue bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={creating || !menuName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-mainblue-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creazione in corso...' : 'Crea menu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}