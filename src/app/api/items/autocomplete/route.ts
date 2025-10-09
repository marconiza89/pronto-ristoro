// src/app/api/items/autocomplete/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { AllergenCode } from '@/types/menuItem'

export const runtime = 'nodejs'

interface AutoCompleteItemRequest {
  itemName: string
  itemType?: 'food' | 'drink' | 'wine' | 'beer' | 'cocktail' | 'dessert'
}

export interface AutoCompleteItemResponse {
  description: string
  about: string
  ingredients: string[]
  allergens: AllergenCode[]
  calories: number
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

    const { itemName, itemType = 'food' } = body as AutoCompleteItemRequest

    if (!itemName || !itemName.trim()) {
      return NextResponse.json({ error: 'Nome del piatto mancante' }, { status: 400 })
    }

    const openai = new OpenAI({ apiKey })

    // Lista degli allergeni validi per validazione
    const validAllergens: AllergenCode[] = [
      'glutine',
      'lattosio',
      'uova',
      'pesce',
      'crostacei',
      'frutta_a_guscio',
      'arachidi',
      'soia',
      'sedano',
      'senape',
      'sesamo',
      'solfiti',
      'lupini',
      'molluschi',
    ]

    const systemPrompt = `Sei un esperto di cucina italiana e internazionale. Il tuo compito è fornire informazioni dettagliate su piatti, bevande e prodotti alimentari.

Per ogni piatto fornisci:
1. Una descrizione breve (2-3 frasi) che descriva il piatto in modo appetitoso
2. Una storia/informazione sul piatto (1-2 frasi) che racconti l'origine o curiosità
3. Lista degli ingredienti principali (separati, massimo 10)
4. Allergeni presenti (solo tra questi: glutine, lattosio, uova, pesce, crostacei, frutta_a_guscio, arachidi, soia, sedano, senape, sesamo, solfiti, lupini, molluschi)
5. Calorie stimate per 100g di prodotto

Rispondi SOLO con un oggetto JSON valido in questo formato esatto:
{
  "description": "descrizione breve del piatto",
  "about": "storia o curiosità sul piatto",
  "ingredients": ["ingrediente1", "ingrediente2", "ingrediente3"],
  "allergens": ["glutine", "lattosio"],
  "calories": 250
}

IMPORTANTE:
- Non aggiungere testo prima o dopo il JSON
- Usa solo i codici allergeni forniti sopra
- Se un allergene non è presente, non includerlo nell'array
- Le calorie devono essere un numero intero
- Gli ingredienti devono essere singoli, non composti (es: "pomodoro", "mozzarella", non "pomodoro e mozzarella")
- Massimo 10 ingredienti`

    const userPrompt = `Fornisci informazioni dettagliate per questo ${itemType === 'food' ? 'piatto' : itemType === 'dessert' ? 'dolce' : 'prodotto'}: "${itemName}"`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const responseText = completion.choices?.[0]?.message?.content?.trim()
    if (!responseText) {
      return NextResponse.json(
        { error: 'Nessuna risposta dall\'AI' },
        { status: 502 }
      )
    }

    // Parse JSON response
    let parsedData: any
    try {
      parsedData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Response text:', responseText)
      return NextResponse.json(
        { error: 'Risposta AI non valida' },
        { status: 502 }
      )
    }

    // Validazione e sanitizzazione della risposta
    const response: AutoCompleteItemResponse = {
      description: String(parsedData.description || '').trim(),
      about: String(parsedData.about || '').trim(),
      ingredients: Array.isArray(parsedData.ingredients)
        ? parsedData.ingredients
            .map((ing: any) => String(ing).trim())
            .filter((ing: string) => ing.length > 0)
            .slice(0, 10) // Massimo 10 ingredienti
        : [],
      allergens: Array.isArray(parsedData.allergens)
        ? parsedData.allergens
            .filter((all: any) => validAllergens.includes(all as AllergenCode))
        : [],
      calories: Math.max(0, Math.min(2000, Number(parsedData.calories) || 0)), // Range 0-2000
    }

    // Validazione finale
    if (!response.description || response.description.length < 10) {
      return NextResponse.json(
        { error: 'Descrizione non valida generata dall\'AI' },
        { status: 502 }
      )
    }

    return NextResponse.json(response)
  } catch (err: any) {
    console.error('Auto-complete error:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore durante il completamento automatico' },
      { status: 500 }
    )
  }
}