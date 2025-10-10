// src/components/menu/LanguageIndicators.tsx
'use client'

import { useMemo } from 'react'
import type { MenuSectionTranslation } from '@/types/menu'
import type { LanguageCode } from '@/types/restaurant'

interface LanguageIndicatorsProps {
  translations: MenuSectionTranslation[]
  className?: string
}

const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  it: '🇮🇹',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  pt: '🇵🇹',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ar: '🇸🇦',
  ru: '🇷🇺',
}

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
  ru: 'Русский',
}

export default function LanguageIndicators({ translations, className = '' }: LanguageIndicatorsProps) {
  // Analizza le traduzioni disponibili
  const languageStatus = useMemo(() => {
    const status = new Map<LanguageCode, { hasName: boolean; hasDescription: boolean }>()

    translations.forEach((t) => {
      const lang = t.language_code as LanguageCode
      if (!status.has(lang)) {
        status.set(lang, { hasName: false, hasDescription: false })
      }
      const current = status.get(lang)!
      if (t.field_name === 'name') {
        current.hasName = true
      } else if (t.field_name === 'description') {
        current.hasDescription = true
      }
    })

    return Array.from(status.entries())
      .sort((a, b) => {
        // Ordina: IT sempre primo, poi gli altri alfabeticamente
        if (a[0] === 'it') return -1
        if (b[0] === 'it') return 1
        return a[0].localeCompare(b[0])
      })
  }, [translations])

  if (languageStatus.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {languageStatus.map(([langCode, status]) => {
        const isComplete = status.hasName && status.hasDescription
        const isPartial = status.hasName || status.hasDescription
        
        // Determina lo stato del badge
        let bgColor = 'bg-gray-100'
        let textColor = 'text-gray-600'
        let borderColor = 'border-gray-200'
        
        if (isComplete) {
          bgColor = 'bg-green-50'
          textColor = 'text-green-700'
          borderColor = 'border-green-200'
        } else if (isPartial) {
          bgColor = 'bg-yellow-50'
          textColor = 'text-yellow-700'
          borderColor = 'border-yellow-200'
        }

        // Tooltip content
        const tooltipParts = []
        if (status.hasName) tooltipParts.push('Nome')
        if (status.hasDescription) tooltipParts.push('Descrizione')
        const tooltipText = `${LANGUAGE_LABELS[langCode]}: ${tooltipParts.join(' + ')}`

        return (
          <div
            key={langCode}
            className={`group relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${bgColor} ${borderColor} ${textColor} text-xs font-medium`}
            title={tooltipText}
          >
            <span className="text-sm leading-none">{LANGUAGE_FLAGS[langCode]}</span>
            <span className="uppercase leading-none">{langCode}</span>
            
            {/* Tooltip al hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              {tooltipText}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Componente helper per mostrare solo un conteggio compatto
export function LanguageCount({ translations, className = '' }: LanguageIndicatorsProps) {
  const languageCount = useMemo(() => {
    const languages = new Set(translations.map(t => t.language_code))
    return languages.size
  }, [translations])

  if (languageCount === 0) {
    return null
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium ${className}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span>{languageCount} {languageCount === 1 ? 'lingua' : 'lingue'}</span>
    </div>
  )
}