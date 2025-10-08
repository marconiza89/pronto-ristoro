// src/app/dashboard/restaurants/[id]/menu/[menuId]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/utils/supabase/client'
import {
  getMenuWithSections,
  updateMenu,
  deleteMenu,
  createMenuSection,
  updateMenuSection,
  deleteMenuSection,
  reorderMenuSections,
} from '@/utils/menu/menu-helpers'
import type { Menu, MenuSection } from '@/types/menu'
import type { Restaurant } from '@/types/restaurant'

export default function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string; menuId: string }>
}) {
  const { id: restaurantId, menuId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [sections, setSections] = useState<MenuSection[]>([])

  // Form fields
  const [menuName, setMenuName] = useState('')
  const [menuDescription, setMenuDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Modal states
  const [showAddSection, setShowAddSection] = useState(false)
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null)
  const [newSectionName, setNewSectionName] = useState('')
  const [newSectionDescription, setNewSectionDescription] = useState('')
  const [newSectionIcon, setNewSectionIcon] = useState('')

  useEffect(() => {
    loadData()
  }, [menuId, restaurantId])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (restaurantError) throw restaurantError

      if (restaurantData.user_id !== user.id) {
        router.push('/dashboard')
        return
      }

      setRestaurant(restaurantData)

      // Load menu with sections
      const menuData = await getMenuWithSections(menuId)
      if (!menuData) throw new Error('Menu non trovato')

      if (menuData.user_id !== user.id) {
        router.push('/dashboard')
        return
      }

      setMenu(menuData)
      setMenuName(menuData.name)
      setMenuDescription(menuData.description || '')
      setIsActive(menuData.is_active)
      setSections(menuData.sections || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMenu = async () => {
    if (!menu) return

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updated = await updateMenu(menu.id, {
        name: menuName.trim(),
        description: menuDescription.trim() || undefined,
        is_active: isActive,
      })

      if (!updated) throw new Error('Errore durante il salvataggio')

      setMenu(updated)
      setSuccessMessage('Menu salvato con successo!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMenu = async () => {
    if (!menu) return

    if (!confirm('Sei sicuro di voler eliminare questo menu? Questa azione non può essere annullata.')) {
      return
    }

    try {
      const deleted = await deleteMenu(menu.id)
      if (!deleted) throw new Error('Errore durante l\'eliminazione')

      router.push(`/dashboard/restaurants/${restaurantId}`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAddSection = async () => {
    if (!menu || !newSectionName.trim()) return

    setSaving(true)
    setError(null)

    try {
      const newSection = await createMenuSection({
        menu_id: menu.id,
        name: newSectionName.trim(),
        description: newSectionDescription.trim() || undefined,
        icon: newSectionIcon.trim() || undefined,
        display_order: sections.length,
        is_visible: true,
      })

      if (!newSection) throw new Error('Errore durante la creazione della sezione')

      setSections([...sections, newSection])
      setShowAddSection(false)
      setNewSectionName('')
      setNewSectionDescription('')
      setNewSectionIcon('')
      setSuccessMessage('Sezione aggiunta con successo!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSection = async (section: MenuSection) => {
    if (!editingSection) return

    setSaving(true)
    setError(null)

    try {
      const updated = await updateMenuSection(section.id, {
        name: editingSection.name,
        description: editingSection.description,
        icon: editingSection.icon,
        is_visible: editingSection.is_visible,
      })

      if (!updated) throw new Error('Errore durante l\'aggiornamento')

      setSections(sections.map(s => (s.id === updated.id ? updated : s)))
      setEditingSection(null)
      setSuccessMessage('Sezione aggiornata!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Eliminare questa sezione? Tutti i piatti al suo interno verranno eliminati.')) {
      return
    }

    try {
      const deleted = await deleteMenuSection(sectionId)
      if (!deleted) throw new Error('Errore durante l\'eliminazione')

      setSections(sections.filter(s => s.id !== sectionId))
      setSuccessMessage('Sezione eliminata!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleToggleSectionVisibility = async (section: MenuSection) => {
    try {
      const updated = await updateMenuSection(section.id, {
        is_visible: !section.is_visible,
      })

      if (!updated) throw new Error('Errore durante l\'aggiornamento')

      setSections(sections.map(s => (s.id === updated.id ? updated : s)))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const moveSectionUp = async (index: number) => {
    if (index === 0) return

    const newSections = [...sections]
    const temp = newSections[index - 1]
    newSections[index - 1] = newSections[index]
    newSections[index] = temp

    // Aggiorna display_order
    const updates = newSections.map((s, idx) => ({
      id: s.id,
      display_order: idx,
    }))

    const success = await reorderMenuSections(updates)
    if (success) {
      setSections(newSections)
    }
  }

  const moveSectionDown = async (index: number) => {
    if (index === sections.length - 1) return

    const newSections = [...sections]
    const temp = newSections[index + 1]
    newSections[index + 1] = newSections[index]
    newSections[index] = temp

    const updates = newSections.map((s, idx) => ({
      id: s.id,
      display_order: idx,
    }))

    const success = await reorderMenuSections(updates)
    if (success) {
      setSections(newSections)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-mainblue">Caricamento...</div>
      </div>
    )
  }

  if (!restaurant || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Menu o ristorante non trovato</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-roboto text-mainblue ">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h1 className="text-3xl font-extrabold text-mainblue">Gestione Menu</h1>
          <p className="mt-2 text-gray-600">{restaurant.name}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Menu Info Card */}
        <div className="bg-white shadow-xl rounded-lg border border-gray-300 p-6 mb-6">
          <h2 className="text-xl font-semibold text-mainblue mb-4">Informazioni Menu</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="menuName" className="block text-sm font-medium text-mainblue mb-1">
                Nome Menu *
              </label>
              <input
                id="menuName"
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
              />
            </div>

            <div>
              <label htmlFor="menuDescription" className="block text-sm font-medium text-mainblue mb-1">
                Descrizione
              </label>
              <textarea
                id="menuDescription"
                value={menuDescription}
                onChange={(e) => setMenuDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-mainblue border-gray-300 rounded focus:ring-mainblue"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Menu attivo
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={handleDeleteMenu}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Elimina Menu
              </button>
              <button
                onClick={handleSaveMenu}
                disabled={saving || !menuName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-mainblue-light disabled:opacity-50"
              >
                {saving ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </div>
        </div>

        {/* Sections Card */}
        <div className="bg-white shadow-xl rounded-lg border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-mainblue">Sezioni del Menu</h2>
            <button
              onClick={() => setShowAddSection(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-mainblue-light"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Aggiungi Sezione
            </button>
          </div>

          {/* Sections List */}
          {sections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nessuna sezione presente. Aggiungi la prima sezione per iniziare.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* {section.icon && <span className="text-2xl">{section.icon}</span>}    IMPLEMENTA ICONE  */                                   }
                    <div className="flex-1">
                      <h3 className="font-medium text-mainblue">{section.name}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-500">{section.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          section.is_visible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {section.is_visible ? 'Visibile' : 'Nascosta'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Move buttons */}
                    <button
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-mainblue disabled:opacity-30"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveSectionDown(index)}
                      disabled={index === sections.length - 1}
                      className="p-1 text-gray-400 hover:text-mainblue disabled:opacity-30"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Action buttons */}
                    <button
                      onClick={() => handleToggleSectionVisibility(section)}
                      className="p-2 text-gray-400 hover:text-mainblue"
                      title={section.is_visible ? 'Nascondi' : 'Mostra'}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {section.is_visible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingSection(section)}
                      className="p-2 text-gray-400 hover:text-mainblue"
                      title="Modifica"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Elimina"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Section Modal */}
        {showAddSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-mainblue mb-4">Aggiungi Nuova Sezione</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Sezione *
                  </label>
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Es. Antipasti"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={newSectionDescription}
                    onChange={(e) => setNewSectionDescription(e.target.value)}
                    placeholder="Es. Per iniziare"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icona (emoji o testo)
                  </label>
                  <input
                    type="text"
                    value={newSectionIcon}
                    onChange={(e) => setNewSectionIcon(e.target.value)}
                    placeholder="🍕 o pizza"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddSection(false)
                    setNewSectionName('')
                    setNewSectionDescription('')
                    setNewSectionIcon('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddSection}
                  disabled={!newSectionName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-mainblue-light disabled:opacity-50"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Section Modal */}
        {editingSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-mainblue mb-4">Modifica Sezione</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Sezione *
                  </label>
                  <input
                    type="text"
                    value={editingSection.name}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={editingSection.description || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icona
                  </label>
                  <input
                    type="text"
                    value={editingSection.icon || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingSection.is_visible}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, is_visible: e.target.checked })
                    }
                    className="w-4 h-4 text-mainblue border-gray-300 rounded focus:ring-mainblue"
                  />
                  <label className="ml-2 text-sm text-gray-700">Sezione visibile</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleUpdateSection(editingSection)}
                  disabled={!editingSection.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-mainblue rounded-md hover:bg-mainblue-light disabled:opacity-50"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info footer */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Prossimi passi:</strong> Le sezioni sono pronte! Ora potrai aggiungere piatti e
            prodotti a ciascuna sezione. Questa funzionalità sarà disponibile a breve.
          </p>
        </div>
      </div>
    </div>
  )
}