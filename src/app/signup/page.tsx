'use client'

import { useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Si è verificato un errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex font-roboto items-center justify-center text-mainblue">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-400">
              Registrazione completata! Controlla la tua email per confermare l'account.
            </p>
          </div>
          <div className="text-center">
            <Link 
              href="/login" 
              className="font-medium text-mainblue-light hover:text-mainblue"
            >
              Torna al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex font-roboto items-center justify-center text-mainblue">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Crea un nuovo account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Oppure{' '}
            <Link href="/login" className="font-medium text-mainblue-light hover:text-mainblue">
              accedi se hai già un account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full text-mainblue px-3 py-2 border border-gray-300 placeholder-mainblue rounded-t-md focus:outline-none focus:ring-mainblue focus:border-mainblue-light focus:z-10 sm:text-sm"
                placeholder="Indirizzo email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full text-mainblue px-3 py-2 border border-gray-300 placeholder-mainblue focus:outline-none focus:ring-mainblue focus:border-mainblue-light focus:z-10 sm:text-sm"
                placeholder="Password (minimo 6 caratteri)"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Conferma Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full text-mainblue px-3 py-2 border border-gray-300 placeholder-mainblue rounded-b-md focus:outline-none focus:ring-mainblue focus:border-mainblue-light focus:z-10 sm:text-sm"
                placeholder="Conferma password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border bg-mainblue text-mainwhite font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}