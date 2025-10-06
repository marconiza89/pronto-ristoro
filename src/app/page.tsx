import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="font-sans min-h-screen">
      {/* Header con navigazione */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                La Mia App
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Ciao, {user.email}
                  </span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Registrati
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Contenuto principale */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            Benvenuto nella tua applicazione
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Questa è l'area pubblica, accessibile a tutti i visitatori.
          </p>
          
          {!user && (
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/signup"
                className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Inizia ora
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 text-base font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700"
              >
                Hai già un account?
              </Link>
            </div>
          )}
        </div>

        {/* Sezione features */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Autenticazione Sicura
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sistema di autenticazione completo con Supabase per proteggere i tuoi dati.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Area Riservata
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Dashboard personale per utenti registrati con contenuti esclusivi.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Interfaccia Moderna
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Design responsive e supporto per tema chiaro/scuro.
            </p>
          </div>
        </div>

        {/* Sezione CTA */}
        <div className="mt-16 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pronto per iniziare?
          </h3>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {user 
              ? "Accedi alla tua dashboard per esplorare tutte le funzionalità."
              : "Registrati gratuitamente e scopri tutte le funzionalità riservate agli utenti."}
          </p>
          <div className="mt-6">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Vai alla Dashboard →
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Registrati gratuitamente →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}