// src/components/menu/IconSelector.tsx
'use client'

import { useState } from 'react'
import { Icon, iconNames, type IconName } from './SessionsIcons'

interface IconSelectorProps {
  value?: IconName | string
  onChange: (iconName: IconName | null) => void
  label?: string
}

export default function IconSelector({ value, onChange, label = 'Icona' }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (iconName: IconName) => {
    onChange(iconName)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setIsOpen(false)
  }

  const currentIcon = value && iconNames.includes(value as IconName) ? (value as IconName) : null

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Selected Icon Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mainblue focus:border-mainblue flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          {currentIcon ? (
            <>
              <Icon name={currentIcon} className="w-5 h-5 text-mainblue" />
              <span className="text-sm text-gray-700">{currentIcon}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">Seleziona un'icona</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Icons Grid */}
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
            <div className="p-2">
              {/* Clear button */}
              {currentIcon && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md mb-2"
                >
                  ✕ Rimuovi icona
                </button>
              )}

              {/* Icons grid */}
              <div className="grid grid-cols-4 gap-2">
                {iconNames.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelect(iconName)}
                    className={`flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-100 transition-colors ${
                      currentIcon === iconName ? 'bg-mainblue/10 ring-2 ring-mainblue' : ''
                    }`}
                    title={iconName}
                  >
                    <Icon name={iconName} className="w-6 h-6 text-mainblue mb-1" />
                    <span className="text-xs text-gray-600 text-center truncate w-full">
                      {iconName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}