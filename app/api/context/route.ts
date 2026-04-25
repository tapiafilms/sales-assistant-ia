import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { clientId, productId } = await req.json()

  if (!clientId || !productId) {
    return NextResponse.json({ error: 'clientId y productId requeridos' }, { status: 400 })
  }

  const db = supabaseAdmin()

  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('client_id', clientId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ product: data })
}
