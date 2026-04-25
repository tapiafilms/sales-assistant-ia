import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json({ error: 'clientId requerido' }, { status: 400 })
  }

  const db = supabaseAdmin()

  const [clientRes, settingsRes] = await Promise.all([
    db.from('clients').select('id, name, assistant_name, tone, active').eq('id', clientId).single(),
    db.from('settings').select('*').eq('client_id', clientId).single(),
  ])

  if (clientRes.error || !clientRes.data) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  if (!clientRes.data.active) {
    return NextResponse.json({ error: 'Cliente inactivo' }, { status: 403 })
  }

  return NextResponse.json({
    client: clientRes.data,
    settings: settingsRes.data ?? {},
  })
}
