import Link from 'next/link'

const DEMO_CLIENTS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'TechStore Pro',
    description: 'Tienda de tecnología — laptops, auriculares, smartwatches',
    emoji: '💻',
    color: '#6366f1',
    assistant: 'Alex',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'ModaElite',
    description: 'Boutique de moda de lujo — bolsos, calzado premium',
    emoji: '👜',
    color: '#ec4899',
    assistant: 'Sofía',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'FitLife Nutrition',
    description: 'Suplementos deportivos — proteínas, pre-workouts',
    emoji: '💪',
    color: '#f59e0b',
    assistant: 'Max',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
      <nav className="px-8 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">SA</div>
          <span className="font-bold text-lg">Sales Assistant IA</span>
        </div>
        <Link href="/admin" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
          Panel de Admin →
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-block bg-indigo-500/20 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-indigo-500/30">
          Demo interactivo
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Tu vendedor IA
          <br />
          <span className="text-indigo-400">en cualquier ecommerce</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
          Widget embebible que entiende tus productos y convierte visitas en ventas.
          Pruébalo ahora en las tiendas demo.
        </p>

        <div className="bg-slate-800 rounded-xl p-5 text-left max-w-lg mx-auto mb-16 border border-white/10">
          <p className="text-xs text-gray-500 mb-3">Instalación en cualquier ecommerce:</p>
          <code className="text-sm text-green-400">
            {'<script src="https://tudominio.com/widget.js"></script>'}<br />
            {'<script>'}<br />
            {'  Assistant.init({ clientId: "TU_ID" })'}<br />
            {'</script>'}
          </code>
        </div>

        <h2 className="text-2xl font-semibold mb-8 text-gray-200">Elige una tienda demo</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {DEMO_CLIENTS.map((c) => (
            <Link
              key={c.id}
              href={`/demo/${c.id}`}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 text-left transition-all"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: c.color + '33' }}>
                {c.emoji}
              </div>
              <h3 className="font-bold text-lg mb-1">{c.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{c.description}</p>
              <div className="flex items-center gap-2 text-sm" style={{ color: c.color }}>
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }}></div>
                Asistente: {c.assistant}
              </div>
              <div className="mt-4 text-sm text-white/40 group-hover:text-white/70 transition-colors">
                Ver tienda demo →
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 py-16 px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🧩', title: '1 línea de código', desc: 'Se instala con un script en cualquier ecommerce' },
            { icon: '🧠', title: 'IA contextual', desc: 'Conoce el producto, precio y stock en tiempo real' },
            { icon: '📊', title: 'Multi-tenant', desc: 'Cada cliente tiene su propio asistente y configuración' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-sm text-gray-600">
        Sales Assistant IA — Demo build
      </footer>
    </div>
  )
}
