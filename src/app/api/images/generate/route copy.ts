import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/app/utils/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const ITEM_IMAGES_BUCKET = 'item-images'
const IMAGE_MODEL = 'gemini-2.5-flash-image' // modello image-capable

interface GenerateImageRequest {
prompt: string
referenceImageUrl?: string
style?: 'professional' | 'artistic' | 'top_view' | 'close_up' | 'rustic' | 'modern'
userId: string
itemId?: string
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
const apiKey = process.env.GOOGLE_GENAI_API_KEY
if (!apiKey) {
return NextResponse.json({ error: 'GOOGLE_GENAI_API_KEY non configurata' }, { status: 500 })
}

const body = await req.json().catch(() => null)
if (!body || typeof body !== 'object') {
  return NextResponse.json({ error: 'Body non valido' }, { status: 400 })
}

const { prompt, referenceImageUrl, style, userId, itemId } = body as GenerateImageRequest

if (!prompt || !prompt.trim()) {
  return NextResponse.json({ error: 'Prompt mancante' }, { status: 400 })
}
if (!userId) {
  return NextResponse.json({ error: 'User ID mancante' }, { status: 400 })
}

const ai = new GoogleGenAI({ apiKey })

// Prompt completo
let fullPrompt = prompt.trim()
if (style && STYLE_MODIFIERS[style]) {
  fullPrompt = `${fullPrompt}. Style: ${STYLE_MODIFIERS[style]}`
}
fullPrompt = `${fullPrompt}. High quality food photography for restaurant menu.`

// Contenuti per generateContent
let contents: any = fullPrompt

// Se presente, includi reference image come inlineData
if (referenceImageUrl) {
  try {
    const imageResponse = await fetch(referenceImageUrl)
    if (!imageResponse.ok) throw new Error('Failed to fetch reference image')

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    contents = [
      {
        inlineData: {
          mimeType: contentType,
          data: base64Image,
        },
      },
      { text: fullPrompt },
    ]
  } catch (err) {
    console.warn('Reference image non utilizzabile, continuo senza:', err)
  }
}

// Generazione immagine con modello image-capable
const response = await ai.models.generateContent({
  model: IMAGE_MODEL,
  contents,
})

const parts = response?.candidates?.[0]?.content?.parts ?? []
if (!parts.length) {
  return NextResponse.json({ error: 'Nessuna immagine generata da Gemini' }, { status: 500 })
}

let imageData: string | null = null
let mimeType: string = 'image/png'

for (const part of parts) {
  if (part?.inlineData?.data) {
    imageData = part.inlineData.data
    if (part.inlineData.mimeType) mimeType = part.inlineData.mimeType
    break
  }
}

if (!imageData) {
  return NextResponse.json({ error: 'Nessuna immagine generata da Gemini' }, { status: 500 })
}

// Salvataggio su Supabase Storage
const buffer = Buffer.from(imageData, 'base64')
const supabase = await createClient()

const ext = mimeType.includes('png') ? 'png' : mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png'
const fileName = `generated/${userId}/${itemId || 'temp'}/${Date.now()}-ai.${ext}`

const { data: uploadData, error: uploadError } = await supabase.storage
  .from(ITEM_IMAGES_BUCKET)
  .upload(fileName, buffer, {
    contentType: mimeType,
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
console.error('Image generation error:', err)
return NextResponse.json(
{ error: err?.message || "Errore durante la generazione dell'immagine" },
{ status: 500 }
)
}
}