'use client'

import { useMemo, useState } from 'react'
import { uploadItemImage, uploadItemReferenceImage, deleteItemImage } from '@/app/utils/storage'

type StylePreset = 'professional' | 'artistic' | 'top_view' | 'close_up' | 'rustic' | 'modern'

interface ItemImageManagerProps {
    value?: string
    onChange: (url: string) => void
    userId: string
    itemId?: string
    itemName?: string
}

const STYLE_LABELS: Record<StylePreset, string> = {
    professional: 'Professionale',
    artistic: 'Artistico',
    top_view: 'Vista dall’alto',
    close_up: 'Dettaglio (close-up)',
    rustic: 'Rustico',
    modern: 'Moderno',
}

export default function ItemImageManager({
    value,
    onChange,
    userId,
    itemId,
    itemName,
}: ItemImageManagerProps) {
    const [uploading, setUploading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Generazione AI
    const [showAiPanel, setShowAiPanel] = useState(false)
    const [style, setStyle] = useState<StylePreset>('professional')
    const defaultPrompt = useMemo(() => {
        const base = itemName?.trim() ? itemName.trim() : 'High quality plated dish'
        return `${ base }, appetizing presentation, natural lighting`
    }, [itemName])
    const [prompt, setPrompt] = useState(defaultPrompt)
    const [referenceFile, setReferenceFile] = useState<File | null>(null)
    const [referenceUploading, setReferenceUploading] = useState(false)
    const [referenceUrl, setReferenceUrl] = useState<string | null>(null)

    // Sync prompt if itemName changes before editing
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => setPrompt(defaultPrompt), [defaultPrompt])

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setError(null)
        setUploading(true)
        try {
            const url = await uploadItemImage(file, userId, itemId)
            if (!url) throw new Error('Upload fallito')
            onChange(url)
        } catch (err: any) {
            setError(err?.message || 'Errore durante l’upload')
        } finally {
            setUploading(false)
            e.currentTarget.value = ''
        }
    }

    async function handleDelete() {
        if (!value) return
        setError(null)
        try {
            const ok = await deleteItemImage(value)
            if (!ok) throw new Error('Cancellazione fallita')
            onChange('')
        } catch (err: any) {
            setError(err?.message || 'Errore durante la cancellazione')
        }
    }

    async function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setError(null)
        setReferenceUploading(true)
        try {
            const url = await uploadItemReferenceImage(file, userId)
            if (!url) throw new Error('Upload riferimento fallito')
            setReferenceUrl(url)
            setReferenceFile(file)
        } catch (err: any) {
            setError(err?.message || 'Errore durante upload immagine di riferimento')
        } finally {
            setReferenceUploading(false)
            e.currentTarget.value = ''
        }
    }

    async function handleGenerate() {
        setError(null)
        setGenerating(true)
        try {
            const res = await fetch('/api/images/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt?.trim(),
                    style,
                    referenceImageUrl: referenceUrl || undefined,
                    userId,
                    itemId,
                }),
            })
            if (!res.ok) {
                const { error } = await res.json().catch(() => ({ error: 'Errore generico' }))
                throw new Error(error || 'Errore generazione immagine')
            }
            const data = await res.json()
            if (!data?.imageUrl) throw new Error('Risposta priva di URL immagine')
            onChange(data.imageUrl)
            // Non serve attendere: l’immagine è già salvata nel bucket e l’utente può continuare
        } catch (err: any) {
            setError(err?.message || 'Errore durante la generazione con AI')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Immagine</label>

            {error && (
                <div className="p-2 text-sm rounded border border-red-200 bg-red-50 text-red-700">
                    {error}
                </div>
            )}

            {/* Preview */}
            {value ? (
                <div className="flex items-start gap-4">
                    <img
                        src={value}
                        alt="Anteprima immagine"
                        className="w-32 h-32 object-cover rounded border"
                    />
                    <div className="flex flex-col gap-2">
                        {/* <div className="text-xs text-gray-500 break-all">{value}</div> */}
                        <div className="flex gap-2">
                            <label className="inline-flex">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUpload}
                                    disabled={uploading || generating}
                                />
                                <span className={`px-3 py-2 rounded border text-sm cursor-pointer ${uploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                                    {uploading ? 'Caricamento...' : 'Sostituisci immagine'}
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={uploading || generating}
                                className="px-3 py-2 rounded border text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                                Rimuovi
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <label className="inline-flex">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading || generating}
                        />
                        <span className={`px-3 py-2 rounded border text-sm cursor-pointer ${uploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                            {uploading ? 'Caricamento...' : 'Carica immagine'}
                        </span>
                    </label>
                    <button
                        type="button"
                        className="px-3 py-2 rounded border text-sm hover:bg-gray-50"
                        onClick={() => setShowAiPanel((s) => !s)}
                        disabled={uploading || generating}
                    >
                        {showAiPanel ? 'Chiudi AI' : 'Genera con AI'}
                    </button>
                </div>
            )}

            {/* AI panel */}
            {showAiPanel && (
                <div className="border rounded p-3 space-y-3">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Stile</label>
                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(STYLE_LABELS) as StylePreset[]).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStyle(s)}
                                    className={`px-2 py-1 rounded text-sm border ${style === s ? 'bg-mainblue text-white border-mainblue' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {STYLE_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Descrivi il piatto e lo stile desiderato"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm text-gray-700">Immagine di riferimento (opzionale)</label>
                        {referenceUrl ? (
                            <div className="flex items-center gap-3">
                                <img src={referenceUrl} alt="Reference" className="w-16 h-16 object-cover rounded border" />
                                <button
                                    type="button"
                                    className="text-sm text-red-600 hover:underline"
                                    onClick={() => { setReferenceUrl(null); setReferenceFile(null) }}
                                >
                                    Rimuovi riferimento
                                </button>
                            </div>
                        ) : (
                            <label className="inline-flex">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleReferenceUpload}
                                    disabled={referenceUploading || generating}
                                />
                                <span className={`px-3 py-2 rounded border text-sm cursor-pointer ${referenceUploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                                    {referenceUploading ? 'Caricamento...' : 'Carica immagine di riferimento'}
                                </span>
                            </label>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={generating || !prompt.trim()}
                            className="px-4 py-2 rounded bg-mainblue text-white disabled:opacity-60"
                        >
                            {generating ? 'Generazione...' : 'Genera immagine'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}