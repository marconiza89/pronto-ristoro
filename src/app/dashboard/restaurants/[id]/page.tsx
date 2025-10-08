// src/app/dashboard/restaurants/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { uploadRestaurantImage, deleteRestaurantImage } from '@/app/utils/storage'
import TranslationManager from '@/components/translation/TranslationManager'
import type {
    Restaurant,
    RestaurantTranslation,
    RestaurantSocial,
    RestaurantType,
    LanguageCode
} from '@/types/restaurant'

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

const SOCIAL_PLATFORMS = [
    { value: 'instagram', label: 'Instagram', placeholder: '@username' },
    { value: 'facebook', label: 'Facebook', placeholder: 'pagename' },
    { value: 'twitter', label: 'Twitter/X', placeholder: '@username' },
    { value: 'tiktok', label: 'TikTok', placeholder: '@username' },
    { value: 'youtube', label: 'YouTube', placeholder: '@channel' },
    { value: 'tripadvisor', label: 'TripAdvisor', placeholder: 'URL completo' },
    { value: 'google_business', label: 'Google Business', placeholder: 'URL completo' },
]

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [activeTab, setActiveTab] = useState<'base' | 'content' | 'social' | 'menu'>('base')
    const [restaurantMenus, setRestaurantMenus] = useState<any[]>([])

    // Dati ristorante
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [translations, setTranslations] = useState<RestaurantTranslation[]>([])
    const [socials, setSocials] = useState<RestaurantSocial[]>([])
    const [userId, setUserId] = useState<string>('')

    // Form fields - Info Base
    const [name, setName] = useState('')
    const [type, setType] = useState<RestaurantType>('ristorante')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [country, setCountry] = useState('Italy')

    // Form fields - Contenuti (in italiano)
    const [descriptionIt, setDescriptionIt] = useState('')
    const [aboutIt, setAboutIt] = useState('')

    useEffect(() => {
        if (!id) return
        loadRestaurantData()
    }, [id])

    const loadRestaurantData = async () => {
        try {
            // Get user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // Load restaurant
            const { data: restaurantData, error: restaurantError } = await supabase
                .from('restaurants')
                .select('*')
                .eq('id', id)
                .single()

            if (restaurantError) throw restaurantError

            // Verify ownership
            if (restaurantData.user_id !== user.id) {
                router.push('/dashboard')
                return
            }

            setRestaurant(restaurantData)
            setName(restaurantData.name || '')
            setType(restaurantData.type || 'ristorante')
            setPhone(restaurantData.phone || '')
            setEmail(restaurantData.email || '')
            setStreet(restaurantData.street || '')
            setCity(restaurantData.city || '')
            setPostalCode(restaurantData.postal_code || '')
            setCountry(restaurantData.country || 'Italy')

            // Load translations
            const { data: translationsData } = await supabase
                .from('restaurant_translations')
                .select('*')
                .eq('restaurant_id', id)

            if (translationsData) {
                setTranslations(translationsData)

                // Set Italian texts
                const descIt = translationsData.find(t => t.language_code === 'it' && t.field_name === 'description')
                const abtIt = translationsData.find(t => t.language_code === 'it' && t.field_name === 'about')

                setDescriptionIt(descIt?.field_value || '')
                setAboutIt(abtIt?.field_value || '')
            }

            // Load socials
            const { data: socialsData } = await supabase
                .from('restaurant_socials')
                .select('*')
                .eq('restaurant_id', id)

            if (socialsData) {
                setSocials(socialsData)
            }

            // Load menus
            const { data: menusData } = await supabase
                .from('restaurant_menus')
                .select(`
                         *,
                         menus (
                         id,
                         name,
                          description,
                        is_active
                )`)
                .eq('restaurant_id', id)

            if (menusData) {
                const formattedMenus = menusData.map(rm => ({
                    ...rm.menus,
                    is_primary: rm.is_primary,
                    display_order: rm.display_order,
                })).filter(Boolean)
                setRestaurantMenus(formattedMenus)
            }

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveBaseInfo = async () => {
        setSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const { error: updateError } = await supabase
                .from('restaurants')
                .update({
                    name,
                    type,
                    phone,
                    email,
                    street,
                    city,
                    postal_code: postalCode,
                    country
                })
                .eq('id', id)

            if (updateError) throw updateError

            setSuccessMessage('Informazioni salvate con successo!')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleSaveContent = async () => {
        setSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {
            // Salva/aggiorna descrizione italiana
            if (descriptionIt) {
                await supabase
                    .from('restaurant_translations')
                    .upsert({
                        restaurant_id: id,
                        language_code: 'it',
                        field_name: 'description',
                        field_value: descriptionIt
                    }, {
                        onConflict: 'restaurant_id,language_code,field_name'
                    })
            }

            // Salva/aggiorna about italiano
            if (aboutIt) {
                await supabase
                    .from('restaurant_translations')
                    .upsert({
                        restaurant_id: id,
                        language_code: 'it',
                        field_name: 'about',
                        field_value: aboutIt
                    }, {
                        onConflict: 'restaurant_id,language_code,field_name'
                    })
            }

            setSuccessMessage('Contenuti salvati con successo!')
            setTimeout(() => setSuccessMessage(null), 3000)

            // Ricarica translations
            const { data: translationsData } = await supabase
                .from('restaurant_translations')
                .select('*')
                .eq('restaurant_id', id)

            if (translationsData) {
                setTranslations(translationsData)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !restaurant) return

        setUploadingImage(true)
        setError(null)

        try {
            // Se c'è già un'immagine, eliminala
            if (restaurant.image_url) {
                await deleteRestaurantImage(restaurant.image_url)
            }

            // Upload nuova immagine
            const imageUrl = await uploadRestaurantImage(file, restaurant.id, userId)

            if (!imageUrl) throw new Error('Errore nel caricamento immagine')

            // Aggiorna database
            const { error: updateError } = await supabase
                .from('restaurants')
                .update({ image_url: imageUrl })
                .eq('id', restaurant.id)

            if (updateError) throw updateError

            // Aggiorna stato locale
            setRestaurant({ ...restaurant, image_url: imageUrl })
            setSuccessMessage('Immagine caricata con successo!')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploadingImage(false)
        }
    }

    const handleSaveTranslation = async (fieldName: 'description' | 'about', languageCode: LanguageCode, text: string) => {
        try {
            await supabase
                .from('restaurant_translations')
                .upsert({
                    restaurant_id: id,
                    language_code: languageCode,
                    field_name: fieldName,
                    field_value: text
                }, {
                    onConflict: 'restaurant_id,language_code,field_name'
                })

            // Ricarica translations
            const { data } = await supabase
                .from('restaurant_translations')
                .select('*')
                .eq('restaurant_id', id)

            if (data) setTranslations(data)

            setSuccessMessage('Traduzione salvata!')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleDeleteTranslation = async (fieldName: 'description' | 'about', languageCode: LanguageCode) => {
        try {
            await supabase
                .from('restaurant_translations')
                .delete()
                .eq('restaurant_id', id)
                .eq('language_code', languageCode)
                .eq('field_name', fieldName)

            // Ricarica translations
            const { data } = await supabase
                .from('restaurant_translations')
                .select('*')
                .eq('restaurant_id', id)

            if (data) setTranslations(data)

            setSuccessMessage('Traduzione eliminata!')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleSaveSocial = async (platform: string, handle: string) => {
        try {
            if (handle.trim()) {
                await supabase
                    .from('restaurant_socials')
                    .upsert({
                        restaurant_id: id,
                        platform,
                        handle
                    }, {
                        onConflict: 'restaurant_id,platform'
                    })
            } else {
                // Se vuoto, elimina
                await supabase
                    .from('restaurant_socials')
                    .delete()
                    .eq('restaurant_id', id)
                    .eq('platform', platform)
            }

            // Ricarica socials
            const { data } = await supabase
                .from('restaurant_socials')
                .select('*')
                .eq('restaurant_id', id)

            if (data) setSocials(data)

            setSuccessMessage('Social aggiornato!')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            setError(err.message)
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

    return (
        <div className="min-h-screen font-roboto text-mainblue ">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-mainblue hover:text-mainblue-light mb-4"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Torna alla dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold text-mainblue">
                        Modifica {restaurant.name}
                    </h1>
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

                {/* Tabs */}
                <div className="bg-white shadow-sm border-b mb-6">
                    <nav className="-mb-px flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('base')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'base'
                                ? 'border-mainblue text-mainblue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Informazioni Base
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'content'
                                ? 'border-mainblue text-mainblue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Contenuti e Traduzioni
                        </button>
                        <button
                            onClick={() => setActiveTab('social')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'social'
                                ? 'border-mainblue text-mainblue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Social Media
                        </button>
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'menu'
                                    ? 'border-mainblue text-mainblue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Menu
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white shadow-xl rounded-lg border border-gray-300 p-6">
                    {/* TAB: Informazioni Base */}
                    {activeTab === 'base' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-mainblue mb-4">Informazioni Base</h2>

                            {/* Logo/Immagine */}
                            <div>
                                <label className="block text-sm font-medium text-mainblue mb-2">
                                    Logo/Immagine attività
                                </label>
                                <div className="flex items-center space-x-4">
                                    {restaurant.image_url ? (
                                        <img
                                            src={restaurant.image_url}
                                            alt={restaurant.name}
                                            className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div>
                                        <input
                                            type="file"
                                            id="image-upload"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainblue"
                                        >
                                            {uploadingImage ? 'Caricamento...' : 'Carica immagine'}
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF fino a 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Grid form fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-mainblue mb-1">
                                        Nome attività *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-mainblue mb-1">
                                        Tipo attività *
                                    </label>
                                    <select
                                        id="type"
                                        value={type}
                                        onChange={(e) => setType(e.target.value as RestaurantType)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                    >
                                        {RESTAURANT_TYPES.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-mainblue mb-1">
                                        Telefono
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+39 06 1234567"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-mainblue mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="info@ristorante.it"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                    />
                                </div>
                            </div>

                            {/* Indirizzo */}
                            <div>
                                <h3 className="text-sm font-medium text-mainblue mb-3">Indirizzo</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                            Via/Piazza
                                        </label>
                                        <input
                                            id="street"
                                            type="text"
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            placeholder="Via Roma, 10"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                            Città
                                        </label>
                                        <input
                                            id="city"
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Roma"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                                            CAP
                                        </label>
                                        <input
                                            id="postal_code"
                                            type="text"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            placeholder="00100"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save button */}
                            <div className="flex justify-end pt-4 border-t">
                                <button
                                    onClick={handleSaveBaseInfo}
                                    disabled={saving || !name.trim()}
                                    className="px-4 py-2 bg-mainblue text-white rounded-md hover:bg-mainblue-light disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Salvataggio...' : 'Salva modifiche'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB: Contenuti e Traduzioni */}
                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-mainblue mb-4">Contenuti e Traduzioni</h2>

                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Inserisci prima i contenuti in italiano.
                                    Potrai poi aggiungere traduzioni in altre lingue usando il traduttore automatico o manualmente.
                                </p>
                            </div>

                            {/* Descrizione */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-mainblue mb-2">
                                    Descrizione breve (Italiano)
                                </label>
                                <textarea
                                    id="description"
                                    value={descriptionIt}
                                    onChange={(e) => setDescriptionIt(e.target.value)}
                                    rows={3}
                                    placeholder="Es: Cucina tradizionale romana in un ambiente accogliente..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Una breve descrizione che apparirà nel menu digitale
                                </p>

                                {/* Traduzioni Descrizione */}
                                <div className="mt-4">
                                    <TranslationManager
                                        restaurantId={id}
                                        fieldName="description"
                                        italianText={descriptionIt}
                                        translations={translations}
                                        onSave={(lang, text) => handleSaveTranslation('description', lang, text)}
                                        onDelete={(lang) => handleDeleteTranslation('description', lang)}
                                    />
                                </div>
                            </div>

                            {/* About/Storia */}
                            <div>
                                <label htmlFor="about" className="block text-sm font-medium text-mainblue mb-2">
                                    La nostra storia (Italiano)
                                </label>
                                <textarea
                                    id="about"
                                    value={aboutIt}
                                    onChange={(e) => setAboutIt(e.target.value)}
                                    rows={5}
                                    placeholder="Es: Fondata nel 1950 dalla famiglia Rossi, la nostra trattoria..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Racconta la storia e i valori del tuo ristorante
                                </p>

                                {/* Traduzioni About */}
                                <div className="mt-4">
                                    <TranslationManager
                                        restaurantId={id}
                                        fieldName="about"
                                        italianText={aboutIt}
                                        translations={translations}
                                        onSave={(lang, text) => handleSaveTranslation('about', lang, text)}
                                        onDelete={(lang) => handleDeleteTranslation('about', lang)}
                                    />
                                </div>
                            </div>

                            {/* Save button */}
                            <div className="flex justify-end pt-4 border-t">
                                <button
                                    onClick={handleSaveContent}
                                    disabled={saving}
                                    className="px-4 py-2 bg-mainblue text-white rounded-md hover:bg-mainblue-light disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Salvataggio...' : 'Salva contenuti'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB: Social Media */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-mainblue mb-4">Social Media</h2>

                            <div className="space-y-4">
                                {SOCIAL_PLATFORMS.map(platform => {
                                    const social = socials.find(s => s.platform === platform.value)
                                    return (
                                        <div key={platform.value} className="flex items-center space-x-3">
                                            <label className="w-32 text-sm font-medium text-gray-700">
                                                {platform.label}
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={social?.handle || ''}
                                                placeholder={platform.placeholder}
                                                onBlur={(e) => handleSaveSocial(platform.value, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-mainblue focus:border-mainblue"
                                            />
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="bg-gray-50 rounded-md p-4">
                                <p className="text-sm text-gray-600">
                                    <strong>Suggerimento:</strong> I link social appariranno nel tuo menu digitale.
                                    Lascia vuoto il campo per nascondere un social.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Link al menu */}
                {/* TAB: Menu */}
                {activeTab === 'menu' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-mainblue mb-4">Menu Digitali</h2>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>Gestione Menu:</strong> Crea e gestisci i menu digitali per questo ristorante.
                                Puoi avere più menu (es. Menu pranzo, Menu cena, Menu stagionale) e condividerli tra più ristoranti.
                            </p>
                        </div>

                        {/* Lista Menu */}
                        {restaurantMenus.length === 0 ? (
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Nessun menu presente
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Crea il tuo primo menu digitale per iniziare
                                </p>
                                <Link
                                    href={`/dashboard/restaurants/${id}/menu/new`}
                                    className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-mainblue rounded-md hover:bg-mainblue-light"
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
                                    Crea primo menu
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {restaurantMenus.map((menu) => (
                                    <div
                                        key={menu.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold text-mainblue">{menu.name}</h3>
                                                {menu.is_primary && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-mainblue/10 text-mainblue rounded-full">
                                                        Principale
                                                    </span>
                                                )}
                                                {!menu.is_active && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                        Non attivo
                                                    </span>
                                                )}
                                            </div>
                                            {menu.description && (
                                                <p className="text-sm text-gray-500 mt-1">{menu.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {menu.sections_count || 0} sezioni
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            <Link
                                                href={`/dashboard/restaurants/${id}/menu/${menu.id}`}
                                                className="px-3 py-1 text-sm font-medium text-mainblue border border-mainblue rounded-md hover:bg-mainblue/5"
                                            >
                                                Gestisci
                                            </Link>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4 border-t">
                                    <Link
                                        href={`/dashboard/restaurants/${id}/menu/new`}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-mainblue border border-mainblue rounded-md hover:bg-mainblue/5"
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
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        Aggiungi nuovo menu
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}