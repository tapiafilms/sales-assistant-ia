import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from 'elevenlabs'

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })

// Voces pre-hechas de ElevenLabs (free tier)
const VOICE_MAP: Record<string, string> = {
  '11111111-1111-1111-1111-111111111111': '29vD33N1rvyd6n4NMsix', // Drew - Alex (TechStore)
  '22222222-2222-2222-2222-222222222222': '21m00Tcm4TlvDq8ikWAM', // Rachel - Sofía (ModaElite)
  '33333333-3333-3333-3333-333333333333': 'ErXwobaYiN019PkySvjV', // Antoni - Max (FitLife)
}

const DEFAULT_VOICE = '21m00Tcm4TlvDq8ikWAM'

export async function POST(req: NextRequest) {
  const { text, clientId } = await req.json()

  if (!text || !clientId) {
    return NextResponse.json({ error: 'text y clientId requeridos' }, { status: 400 })
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'ElevenLabs no configurado' }, { status: 500 })
  }

  const voiceId = VOICE_MAP[clientId] || DEFAULT_VOICE

  // Limitar texto a 300 chars para conservar créditos en demo
  const truncated = text.slice(0, 300)

  const audioStream = await client.textToSpeech.convert(voiceId, {
    text: truncated,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  })

  const chunks: Buffer[] = []
  for await (const chunk of audioStream) {
    chunks.push(Buffer.from(chunk))
  }
  const audioBuffer = Buffer.concat(chunks)

  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
    },
  })
}
