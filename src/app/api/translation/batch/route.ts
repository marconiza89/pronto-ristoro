// src/app/api/translation/batch/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/app/utils/supabase/server'

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

type TranslationType = 
  | 'menu_name' 
  | 'menu_description' 
  | 'section_name' 
  | 'section_description' 
  | 'item_name' 
  | 'item_description' 
  | 'ingredient' 
  | 'allergen'

interface BatchTranslationRequest {
  text: string
  languageCode: LanguageCode
  type: TranslationType
  entityId: string
  menuId: string
}

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

    const { text, languageCode, type, entityId, menuId } = body as BatchTranslationRequest

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'text mancante o vuoto' }, { status: 400 })
    }
    if (!languageCode || !ALLOWED_LANGUAGE_CODES.includes(languageCode)) {
      return NextResponse.json({ error: 'languageCode non supportato o mancante' }, { status: 400 })
    }
    if (!type || !entityId) {
      return NextResponse.json({ error: 'type o entityId mancante' }, { status: 400 })
    }

    const target = LANGUAGE_NAME_IT[languageCode]
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

    // Salva la traduzione nel database
    const supabase = await createClient()

    // Determina quale tabella e campo usare
    let tableName: string
    let fieldName: string

    switch (type) {
      case 'menu_name':
      case 'menu_description':
        // Per i menu non esiste ancora una tabella traduzioni, 
        // ma possiamo crearla o skipparla per ora
        return NextResponse.json({ translatedText, saved: false })

      case 'section_name':
      case 'section_description':
        tableName = 'menu_section_translations'
        fieldName = type === 'section_name' ? 'name' : 'description'
        
        await supabase
          .from(tableName)
          .upsert({
            section_id: entityId,
            language_code: languageCode,
            field_name: fieldName,
            field_value: translatedText,
          }, {
            onConflict: 'section_id,language_code,field_name'
          })
        break

      case 'item_name':
      case 'item_description':
        tableName = 'menu_item_translations'
        fieldName = type === 'item_name' ? 'name' : 'description'
        
        await supabase
          .from(tableName)
          .upsert({
            item_id: entityId,
            language_code: languageCode,
            field_name: fieldName,
            field_value: translatedText,
          }, {
            onConflict: 'item_id,language_code,field_name'
          })
        break

      case 'ingredient':
        // Traduzioni ingredienti
        tableName = 'item_ingredient_translations'
        
        await supabase
          .from(tableName)
          .upsert({
            ingredient_id: entityId,
            language_code: languageCode,
            name: translatedText,
          }, {
            onConflict: 'ingredient_id,language_code'
          })
        break

      case 'allergen':
        // Traduzioni allergeni
        tableName = 'item_allergen_translations'
        
        await supabase
          .from(tableName)
          .upsert({
            allergen_id: entityId,
            language_code: languageCode,
            display_name: translatedText,
          }, {
            onConflict: 'allergen_id,language_code'
          })
        break

      default:
        return NextResponse.json({ error: 'Tipo di traduzione non supportato' }, { status: 400 })
    }

    return NextResponse.json({ translatedText, saved: true })

  } catch (err) {
    console.error('Batch translation API error:', err)
    return NextResponse.json({ error: 'Errore durante la traduzione' }, { status: 500 })
  }
}