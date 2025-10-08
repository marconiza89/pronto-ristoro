// src/components/TranslationManager.tsx
'use client'

import { useState } from 'react'
import type { RestaurantTranslation, LanguageCode } from '@/types/restaurant'

interface TranslationManagerProps {
  restaurantId: string
  fieldName: 'description' | 'about'
  italianText: string
  translations: RestaurantTranslation[]
  onSave: (languageCode: LanguageCode, text: string) => Promise<void>
  onDelete: (languageCode: LanguageCode) => Promise<void>
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

export default function TranslationManager({
  restaurantId,
  fieldName,
  italianText,
  translations,
  onSave,
  onDelete
}: TranslationManagerProps) {
  const [showAddLanguage, setShowAddLanguage] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<LanguageCode | null>(null)
  const [editingText, setEditingText] = useState('')

  // Filtra le traduzioni per questo campo
  const fieldTranslations = translations.filter(t => t.field_name === fieldName)

  // Ottieni le lingue già tradotte
  const translatedLanguages = fieldTranslations.map(t => t.language_code)

  // Lingue disponibili per aggiungere
  const availableLanguages = LANGUAGES.filter(l => !translatedLanguages.includes(l.code))

  const handleAutoTranslate = async () => {
    // Validazioni prima della chiamata API
    if (!italianText || !italianText.trim()) return
    if (!selectedLanguage) return

    setIsTranslating(true)
    try {
      const res = await fetch('/api/translation/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: italianText,           // testo in italiano da tradurre
          languageCode: selectedLanguage, // es: 'en', 'fr', ecc.
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Errore durante la traduzione')
      }

      const data = await res.json()
      setTranslatedText(data.translatedText || '')
    } catch (error) {
      console.error(error)
      // In produzione puoi mostrare un toast/alert
      alert('Impossibile completare la traduzione. Riprova.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSaveTranslation = async () => {
    if (!translatedText.trim()) return

    await onSave(selectedLanguage, translatedText)
    setTranslatedText('')
    setShowAddLanguage(false)
  }

  const handleUpdateTranslation = async (languageCode: LanguageCode) => {
    if (!editingText.trim()) return

    await onSave(languageCode, editingText)
    setEditingLanguage(null)
    setEditingText('')
  }

  const handleDeleteTranslation = async (languageCode: LanguageCode) => {
    if (confirm('Sei sicuro di voler eliminare questa traduzione?')) {
      await onDelete(languageCode)
    }
  }

  const startEditing = (translation: RestaurantTranslation) => {
    setEditingLanguage(translation.language_code as LanguageCode)
    setEditingText(translation.field_value)
  }

  return (
    <div className="space-y-4">
      {/* Lista traduzioni esistenti */}
      {fieldTranslations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Traduzioni disponibili:</h4>
          {fieldTranslations.map((translation) => {
            const lang = LANGUAGES.find(l => l.code === translation.language_code)
            const isEditing = editingLanguage === translation.language_code

            return (
              <div key={translation.id} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md">
                <span className="text-2xl mt-1">{lang?.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{lang?.label}</span>
                    <div className="flex space-x-2">
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => startEditing(translation)}
                            className="text-sm text-mainblue hover:text-mainblue-light"
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDeleteTranslation(translation.language_code as LanguageCode)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Elimina
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateTranslation(translation.language_code as LanguageCode)}
                          className="px-3 py-1 text-sm bg-mainblue text-white rounded-md hover:bg-mainblue-light"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => {
                            setEditingLanguage(null)
                            setEditingText('')
                          }}
                          className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">{translation.field_value}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Aggiungi nuova traduzione */}
      {availableLanguages.length > 0 && (
        <>
          {!showAddLanguage ? (
            <button
              onClick={() => setShowAddLanguage(true)}
              className="inline-flex items-center px-3 py-1 text-sm border border-mainblue text-mainblue rounded-md hover:bg-mainblue/5"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Aggiungi traduzione
            </button>
          ) : (
            <div className="border border-gray-200 rounded-md p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                >
                  {availableLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAutoTranslate}
                  disabled={!italianText || isTranslating}
                  className="px-3 py-1 text-sm bg-mainsky text-white rounded-md hover:bg-mainsky-alternative disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTranslating ? 'Traduzione...' : 'Traduci automaticamente'}
                </button>
              </div>

              <textarea
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                placeholder={`Inserisci la traduzione in ${LANGUAGES.find(l => l.code === selectedLanguage)?.label}...`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                rows={3}
              />

              <div className="flex space-x-2">
                <button
                  onClick={handleSaveTranslation}
                  disabled={!translatedText.trim()}
                  className="px-3 py-1 text-sm bg-mainblue text-white rounded-md hover:bg-mainblue-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salva traduzione
                </button>
                <button
                  onClick={() => {
                    setShowAddLanguage(false)
                    setTranslatedText('')
                  }}
                  className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annulla
                </button>
              </div>

              <p className="text-xs text-gray-500 italic">
                Nota: La traduzione automatica sarà disponibile a breve. Per ora puoi inserire manualmente la traduzione.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}