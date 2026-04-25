import { supabaseAdmin } from '@/lib/supabase'
import DemoStore from './DemoStore'
import { notFound } from 'next/navigation'

export default async function DemoPage({ params }: { params: { clientId: string } }) {
  const { clientId } = params
  const db = supabaseAdmin()

  const [clientRes, productsRes, settingsRes] = await Promise.all([
    db.from('clients').select('*').eq('id', clientId).single(),
    db.from('products').select('*').eq('client_id', clientId).order('created_at'),
    db.from('settings').select('*').eq('client_id', clientId).single(),
  ])

  if (clientRes.error || !clientRes.data) return notFound()

  return (
    <DemoStore
      client={clientRes.data}
      products={productsRes.data ?? []}
      settings={settingsRes.data ?? {}}
    />
  )
}
