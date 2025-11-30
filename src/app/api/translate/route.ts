import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await request.json()

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      )
    }

    // Verificar se a chave da OpenAI está configurada
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da OpenAI não configurada. Configure OPENAI_API_KEY nas variáveis de ambiente." },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const languageNames: Record<string, string> = {
      pt: "Português",
      en: "Inglês",
      es: "Espanhol",
      fr: "Francês",
      de: "Alemão",
      it: "Italiano",
      ja: "Japonês",
      ko: "Coreano",
      zh: "Chinês",
      ar: "Árabe",
      ru: "Russo",
      hi: "Hindi",
    }

    const prompt = `Traduza o seguinte texto de ${languageNames[sourceLang]} para ${languageNames[targetLang]}. 
Retorne APENAS a tradução, sem explicações ou texto adicional.

Texto: ${text}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um tradutor profissional especializado em tradução precisa e natural entre idiomas. Retorne apenas a tradução solicitada, sem explicações.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const translation = completion.choices[0]?.message?.content?.trim() || ""

    return NextResponse.json({ translation })
  } catch (error: any) {
    console.error("Erro na tradução:", error)
    
    // Tratamento específico para erro de autenticação da OpenAI
    if (error?.status === 401 || error?.message?.includes("Incorrect API key")) {
      return NextResponse.json(
        { error: "Chave da OpenAI inválida. Verifique sua configuração." },
        { status: 401 }
      )
    }
    
    // Tratamento para erro de quota/limite
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Limite de uso da API atingido. Tente novamente mais tarde." },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      { error: "Erro ao processar tradução. Tente novamente." },
      { status: 500 }
    )
  }
}
