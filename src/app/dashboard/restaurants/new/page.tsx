// src/app/dashboard/restaurants/new/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { RestaurantType } from '@/types/restaurant'

const RESTAURANT_TYPES: { value: RestaurantType; label: string }[] = [
  { value: 'ristorante', label: 'Ristorante' },
  { value: 'pizzeria', label: 'Pizzeria' },
  { value: 'pizzeria_ristorante', label: 'Pizzeria Ristorante' },
  { value: 'trattoria', label: 'Trattoria' },
  { value: 'osteria', label: 'Osteria' },
  { value: 'pub', label: 'Pub' },
  { value: 'bar', label: 'Bar' },
  { value: 'caffe', label: 'Caffè' },
  { value: 'enoteca', label: 'Enoteca' },
  { value: 'bistrot', label: 'Bistrot' },
  { value: 'tavola_calda', label: 'Tavola Calda' },
  { value: 'rosticceria', label: 'Rosticceria' },
  { value: 'pasticceria', label: 'Pasticceria' },
  { value: 'gelateria', label: 'Gelateria' },
]

export default function NewRestaurantPage() {
  const [name, setName] = useState('')
  const [type, setType] = useState<RestaurantType>('ristorante')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Ottieni l'utente corrente
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('Devi essere autenticato per creare un ristorante')
        setLoading(false)
        return
      }

      // Crea il ristorante
      const { data, error: insertError } = await supabase
        .from('restaurants')
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            type: type
          }
        ])
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else {
        // Redirect alla dashboard o alla pagina del ristorante
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Si è verificato un errore durante la creazione del ristorante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-roboto text-mainblue">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-mainblue hover:text-mainblue-light mb-4"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Torna alla dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-mainblue">
            Crea un nuovo ristorante
          </h1>
          <p className="mt-2 text-gray-600">
            Inizia inserendo le informazioni base della tua attività. Potrai aggiungere altri dettagli successivamente.
          </p>
        </div>

        {/* Form */}
        <div className="bg-mainwhite overflow-hidden shadow-xl sm:rounded-lg border border-gray-300">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Nome ristorante */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-mainblue mb-2"
              >
                Nome dell'attività *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-mainblue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mainblue focus:border-transparent"
                placeholder="Es. Trattoria da Mario"
              />
              <p className="mt-1 text-sm text-gray-500">
                Il nome che apparirà nel tuo menu digitale
              </p>
            </div>

            {/* Tipo di attività */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-mainblue mb-2"
              >
                Tipo di attività *
              </label>
              <select
                id="type"
                name="type"
                required
                value={type}
                onChange={(e) => setType(e.target.value as RestaurantType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-mainblue focus:outline-none focus:ring-2 focus:ring-mainblue focus:border-transparent"
              >
                {RESTAURANT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Seleziona la categoria che meglio descrive la tua attività
              </p>
            </div>

            {/* Messaggio di errore */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Info aggiuntive */}
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
                  <p className="font-medium mb-1">Informazioni aggiuntive</p>
                  <p>
                    Dopo aver creato il ristorante, potrai aggiungere:
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-mainblue/80">
                    <li>Logo e immagini</li>
                    <li>Descrizione dell'attività</li>
                    <li>Informazioni di contatto</li>
                    <li>Indirizzo e orari</li>
                    <li>Social media</li>
                    <li>Menu completo</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottoni */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-mainblue bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainblue"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-2 text-sm font-medium text-mainwhite bg-mainblue border border-transparent rounded-md hover:bg-mainblue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainblue disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creazione in corso...' : 'Crea ristorante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}