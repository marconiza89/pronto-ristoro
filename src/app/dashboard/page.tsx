// src/app/dashboard/page.tsx
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Recupera i ristoranti dell'utente
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen font-roboto text-mainblue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          {/* Header */}
          <div className="bg-mainwhite overflow-hidden shadow-xl sm:rounded-lg border border-gray-300 mb-8">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-mainblue">
                  Dashboard
                </h1>
                <LogoutButton />
              </div>
            </div>
          </div>

          {/* Sezione Ristoranti */}
          <div className="bg-mainwhite overflow-hidden shadow-xl sm:rounded-lg border border-gray-300">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-mainblue">
                  Le tue attività
                </h2>
                <Link
                  href="/dashboard/restaurants/new"
                  className="px-4 py-2 text-sm font-medium text-mainwhite bg-mainblue border border-transparent rounded-md hover:bg-mainblue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainblue"
                >
                  Aggiungi attività
                </Link>
              </div>

              {!restaurants || restaurants.length === 0 ? (
                // Stato vuoto - nessun ristorante
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-24 w-24 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nessuna attività registrata
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Inizia aggiungendo la tua prima attività per gestire il menu digitale
                  </p>
                  <Link
                    href="/dashboard/restaurants/new"
                    className="inline-flex items-center px-6 py-3 text-base font-medium text-mainwhite bg-mainblue rounded-md hover:bg-mainblue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainblue"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Crea la tua prima attività
                  </Link>
                </div>
              ) : (
                // Lista ristoranti
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {restaurants.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/dashboard/restaurants/${restaurant.id}`}
                      className="group relative bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        {restaurant.image_url ? (
                          <img
                            src={restaurant.image_url}
                            alt={restaurant.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mainblue/10 text-mainblue">
                          {restaurant.type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-mainblue group-hover:text-mainblue-light">
                        {restaurant.name}
                      </h3>
                      {restaurant.city && (
                        <p className="text-sm text-gray-500 mt-1">
                          {restaurant.city}
                        </p>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    Errore nel caricamento delle attività: {error.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info utente */}
          <div className="mt-8 bg-mainwhite overflow-hidden shadow-xl sm:rounded-lg border border-gray-300">
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-bold text-mainblue mb-4">
                Informazioni account
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-600">Email</dt>
                  <dd className="mt-1 text-sm text-mainblue font-medium">
                    {user.email}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-600">
                    Account creato il
                  </dt>
                  <dd className="mt-1 text-sm text-mainblue font-medium">
                    {new Date(user.created_at!).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}