import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const ITEM_IMAGES_BUCKET = 'item-images'
const OPENAI_API = 'https://api.openai.com/v1'
const IMAGE_MODEL = 'gpt-image-1' // come da reference ufficiale

interface GenerateImageRequest {
    prompt: string
    referenceImageUrl?: string
    style?: 'professional' | 'artistic' | 'top_view' | 'close_up' | 'rustic' | 'modern'
    userId: string
    itemId?: string
    // opzionali per gpt-image-1
    size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto'
    quality?: 'high' | 'medium' | 'low' | 'auto'
    background?: 'transparent' | 'opaque' | 'auto'
}

const STYLE_MODIFIERS = {
    professional: 'professional food photography, high-end restaurant quality, perfect lighting, clean background',
    artistic: 'artistic food photography, creative composition, dramatic lighting, artistic style',
    top_view: 'top-down view, flat lay photography, overhead shot, perfectly centered',
    close_up: 'close-up macro photography, detailed texture, shallow depth of field',
    rustic: 'rustic style, natural wood background, warm tones, homestyle presentation',
    modern: 'modern minimalist style, clean lines, contemporary plating, elegant presentation',
} as const

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'OPENAI_API_KEY non configurata' }, { status: 500 })
        }

        const body = await req.json().catch(() => null)
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Body non valido' }, { status: 400 })
        }

        const {
            prompt,
            referenceImageUrl,
            style,
            userId,
            itemId,
            size = '1024x1024',
            quality = 'low',
            background = 'auto',
        } = body as GenerateImageRequest

        if (!prompt || !prompt.trim()) {
            return NextResponse.json({ error: 'Prompt mancante' }, { status: 400 })
        }
        if (!userId) {
            return NextResponse.json({ error: 'User ID mancante' }, { status: 400 })
        }

        // Prompt + stile
        let fullPrompt = prompt.trim()
        if (style && STYLE_MODIFIERS[style]) {
            fullPrompt = `${fullPrompt}. Style: ${STYLE_MODIFIERS[style]}`
        }
        fullPrompt = `${fullPrompt}. High quality food photography for restaurant menu.`

        // Generazione da testo
        async function generateFromText(): Promise<{ base64: string; mime: string }> {
            const res = await fetch(`${OPENAI_API}/images/generations`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: IMAGE_MODEL,
                    prompt: fullPrompt,
                    n: 1,
                    size,
                    quality,          // supportato da gpt-image-1
                    output_format: 'png', // supportato da gpt-image-1: png | jpeg | webp
                    background,       // 'auto' | 'opaque' | 'transparent' (solo gpt-image-1)
                    user: userId,     // facoltativo, consigliato
                }),
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err?.error?.message || 'Errore OpenAI Images (generations)')
            }

            const json = await res.json()
            const b64 = json?.data?.[0]?.b64_json
            if (!b64) throw new Error('Risposta OpenAI senza immagine (generations)')
            return { base64: b64, mime: 'image/png' }
        }

        // Variazione da immagine di riferimento
        // Nota: variations non accetta prompt. Serve per ottenere immagini simili alla reference.
        async function generateFromReference(url: string): Promise<{ base64: string; mime: string }> {
            const imgRes = await fetch(url)
            if (!imgRes.ok) throw new Error('Impossibile scaricare la reference image')

            const arr = await imgRes.arrayBuffer()
            const mime = imgRes.headers.get('content-type') || 'image/png'
            const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.includes('png') ? 'png' : 'png'

            const form = new FormData()
            form.append('model', IMAGE_MODEL)
            form.append('n', '1')
            form.append('size', size)
            // gpt-image-1 ritorna sempre base64; non serve response_format
            form.append('image', new Blob([Buffer.from(arr)], { type: mime }), `reference.${ext}`)
            // user facoltativo
            form.append('user', userId)

            const res = await fetch(`${OPENAI_API}/images/variations`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}` },
                body: form,
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err?.error?.message || 'Errore OpenAI Images (variations)')
            }

            const json = await res.json()
            const b64 = json?.data?.[0]?.b64_json
            if (!b64) throw new Error('Risposta OpenAI senza immagine (variations)')
            return { base64: b64, mime: 'image/png' }
        }

        // Strategia: se c'è una reference -> prova variations, altrimenti generations
        let result: { base64: string; mime: string }
        if (referenceImageUrl) {
            try {
                result = await generateFromReference(referenceImageUrl)
            } catch (e) {
                console.warn('Variations fallita, fallback a generations. Dettagli:', e)
                result = await generateFromText()
            }
        } else {
            result = await generateFromText()
        }

        // Upload su Supabase
        const buffer = Buffer.from(result.base64, 'base64')
        const supabase = await createClient()

        const extOut = result.mime.includes('jpeg') || result.mime.includes('jpg') ? 'jpg' : 'png'
        const fileName = `generated/${userId}/${itemId || 'temp'}/${Date.now()}-ai.${extOut}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(ITEM_IMAGES_BUCKET)
            .upload(fileName, buffer, {
                contentType: result.mime,
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: "Errore nel salvataggio dell'immagine" }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
            .from(ITEM_IMAGES_BUCKET)
            .getPublicUrl(uploadData.path)

        return NextResponse.json({
            imageUrl: publicUrl,
            prompt: fullPrompt,
            style: style || 'default',
        })
    } catch (err: any) {
        console.error('Image generation error (OpenAI):', err)
        return NextResponse.json(
            { error: err?.message || "Errore durante la generazione dell'immagine" },
            { status: 500 }
        )
    }
}