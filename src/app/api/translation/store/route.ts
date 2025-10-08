import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const ALLOWED_LANGUAGE_CODES = ['en','fr','de','es','pt','zh','ja','ar','ru'] as const
type LanguageCode = typeof ALLOWED_LANGUAGE_CODES[number]

const LANGUAGE_NAME_IT: Record<LanguageCode, string> = {
en: 'inglese',
fr: 'francese',
de: 'tedesco',
es: 'spagnolo',
pt: 'portoghese',
zh: 'cinese',
ja: 'giapponese',
ar: 'arabo',
ru: 'russo',
}

export const runtime = 'nodejs'

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

const { text, languageCode } = body as { text?: string; languageCode?: string }

if (!text || !text.trim()) {
  return NextResponse.json({ error: 'text mancante o vuoto' }, { status: 400 })
}
if (!languageCode || !ALLOWED_LANGUAGE_CODES.includes(languageCode as LanguageCode)) {
  return NextResponse.json({ error: 'languageCode non supportato o mancante' }, { status: 400 })
}

const target = LANGUAGE_NAME_IT[languageCode as LanguageCode]

const openai = new OpenAI({ apiKey })

const system = [
  'Sei un traduttore professionista per contenuti di ristorazione.',
  'Mantieni un tono naturale e adatto a descrizioni di menu.',
  'Non aggiungere informazioni non presenti nel testo.',
  'Preserva formattazione, emoji e interruzioni di riga.',
  'Restituisci solo il testo tradotto, senza virgolette né note.',
].join(' ')

const user = `Traduci da italiano a ${target} il seguente testo.\n\n${text}`

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  temperature: 0.2,
  messages: [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ],
})

const translatedText = completion.choices?.[0]?.message?.content?.trim() ?? ''
if (!translatedText) {
  return NextResponse.json({ error: 'Traduzione non disponibile' }, { status: 502 })
}

return NextResponse.json({ translatedText })
} catch (err) {
console.error('Translation API error:', err)
return NextResponse.json({ error: 'Errore durante la traduzione' }, { status: 500 })
}
}