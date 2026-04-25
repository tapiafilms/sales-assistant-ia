import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminPage() {
  const db = supabaseAdmin()

  const [clientsRes, convsRes] = await Promise.all([
    db.from('clients').select('*, settings(primary_color)').order('created_at'),
    db.from('conversations').select('client_id, id'),
  ])

  const clients = clientsRes.data ?? []
  const convsCounts = (convsRes.data ?? []).reduce((acc: Record<string, number>, c) => {
    acc[c.client_id] = (acc[c.client_id] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">SA</div>
          <span className="font-bold text-lg text-gray-800">Sales Assistant IA</span>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-600">Admin</span>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Volver al inicio</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Clientes</h1>
            <p className="text-gray-500 text-sm mt-1">Sistema multi-tenant — cada cliente tiene su propio asistente</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm px-4 py-2 rounded-lg">
            {clients.length} clientes activos
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Clientes', value: clients.length, icon: '🏪' },
            { label: 'Conversaciones', value: Object.values(convsCounts).reduce((a, b) => a + b, 0), icon: '💬' },
            { label: 'Asistentes activos', value: clients.filter((c: any) => c.active).length, icon: '🤖' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Clients table */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700">Clientes registrados</h2>
          </div>
          <div className="divide-y">
            {clients.map((client: any) => {
              const color = client.settings?.[0]?.primary_color || '#6366f1'
              return (
                <div key={client.id} className="px-6 py-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: color }}
                  >
                    {client.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">{client.name}</div>
                    <div className="text-sm text-gray-500 truncate">{client.email}</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-sm font-medium text-gray-700">{client.assistant_name}</div>
                    <div className="text-xs text-gray-400">asistente</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-sm font-medium text-gray-700">{convsCounts[client.id] || 0}</div>
                    <div className="text-xs text-gray-400">conversaciones</div>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${client.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {client.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <Link
                    href={`/demo/${client.id}`}
                    className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    Ver demo →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Integration snippet */}
        <div className="mt-8 bg-slate-800 rounded-2xl p-6 text-white">
          <h3 className="font-semibold mb-1">Snippet de integración</h3>
          <p className="text-gray-400 text-sm mb-4">Copia este código en cualquier ecommerce para activar el asistente</p>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400 space-y-1">
            <div>{'<!-- Sales Assistant IA -->'}</div>
            <div>{'<script src="https://tudominio.com/widget.js"></script>'}</div>
            <div>{'<script>'}</div>
            <div>{'  window.Assistant.init({'}</div>
            <div>{'    clientId: "TU_CLIENT_ID",'}</div>
            <div>{'    productId: "ID_DEL_PRODUCTO" // opcional'}</div>
            <div>{'  })'}</div>
            <div>{'</script>'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
