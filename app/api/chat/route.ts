import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { clientId, productId, message, sessionId } = await req.json()

  if (!clientId || !message) {
    return NextResponse.json({ error: 'clientId y message requeridos' }, { status: 400 })
  }

  const db = supabaseAdmin()

  // Obtener cliente y configuración
  const [clientRes, settingsRes] = await Promise.all([
    db.from('clients').select('assistant_name, tone, active').eq('id', clientId).single(),
    db.from('settings').select('welcome_message, primary_color').eq('client_id', clientId).single(),
  ])

  if (clientRes.error || !clientRes.data?.active) {
    return NextResponse.json({ error: 'Cliente no válido' }, { status: 403 })
  }

  // Obtener producto si hay productId
  let productContext = ''
  if (productId) {
    const { data: product } = await db
      .from('products')
      .select('name, price, description, features, stock')
      .eq('id', productId)
      .eq('client_id', clientId)
      .single()

    if (product) {
      productContext = `
PRODUCTO ACTUAL:
- Nombre: ${product.name}
- Precio: ${product.price}
- Descripción: ${product.description}
- Características: ${JSON.stringify(product.features)}
- Stock disponible: ${product.stock} unidades
`
    }
  }

  // Obtener o crear conversación
  let conversationId: string
  if (sessionId) {
    const { data: existing } = await db
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .eq('client_id', clientId)
      .single()

    if (existing) {
      conversationId = existing.id
    } else {
      const { data: newConv } = await db
        .from('conversations')
        .insert({ client_id: clientId, product_id: productId || null, session_id: sessionId })
        .select('id')
        .single()
      conversationId = newConv!.id
    }
  } else {
    const { data: newConv } = await db
      .from('conversations')
      .insert({ client_id: clientId, product_id: productId || null, session_id: crypto.randomUUID() })
      .select('id')
      .single()
    conversationId = newConv!.id
  }

  // Obtener historial de la conversación (últimos 10 mensajes)
  const { data: history } = await db
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(10)

  // Guardar mensaje del usuario
  await db.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: message,
  })

  // Construir prompt del sistema
  const { assistant_name, tone } = clientRes.data
  const systemPrompt = `Eres ${assistant_name}, un vendedor experto con tono ${tone}.
Tu único objetivo es ayudar al usuario y convertirlo en comprador.

INSTRUCCIONES:
- Responde siempre en el idioma del usuario
- Sé conciso (máximo 3 párrafos)
- Destaca beneficios, no solo características
- Cuando el usuario muestre interés, guíalo hacia el checkout con un CTA claro
- Si preguntan por precio, dilo y destaca el valor
- Si el stock es bajo (< 5), crea urgencia
- Nunca inventes información que no esté en el contexto del producto
${productContext}
Si no hay producto en contexto, ayuda de forma general sobre los productos de la tienda.`

  // Llamar a Claude con historial
  const messages = [
    ...(history || []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: message },
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: systemPrompt,
    messages,
  })

  const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

  // Guardar respuesta del asistente
  await db.from('messages').insert({
    conversation_id: conversationId,
    role: 'assistant',
    content: assistantMessage,
  })

  return NextResponse.json({
    message: assistantMessage,
    conversationId,
  })
}
