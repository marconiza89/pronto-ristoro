import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
const supabase = createClient()
  
  const { data: { user } } = await (await supabase).auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen font-roboto text-mainblue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="bg-mainwhite overflow-hidden shadow-xl sm:rounded-lg border border-gray-300">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-mainblue">
                  Benvenuto nella Dashboard!
                </h1>
                <LogoutButton />
              </div>
              
              <div className="border-t border-gray-300 pt-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-600">
                      Email
                    </dt>
                    <dd className="mt-1 text-sm text-mainblue font-medium">
                      {user.email}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-600">
                      ID Utente
                    </dt>
                    <dd className="mt-1 text-sm text-mainblue font-medium">
                      {user.id}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-600">
                      Account creato il
                    </dt>
                    <dd className="mt-1 text-sm text-mainblue font-medium">
                      {new Date(user.created_at!).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="mt-8 p-6 bg-mainblue/5 rounded-lg border border-mainblue/20">
                <h2 className="text-lg font-bold text-mainblue mb-2">
                  Area riservata
                </h2>
                <p className="text-sm text-mainblue">
                  Questa è la tua area personale. Qui puoi accedere a contenuti e funzionalità 
                  riservate agli utenti registrati. La dashboard può essere espansa con nuove 
                  funzionalità in base alle tue esigenze.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}