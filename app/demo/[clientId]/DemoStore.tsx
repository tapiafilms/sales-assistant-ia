'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

interface Product {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  stock: number
  image_url: string
}

interface Client {
  id: string
  name: string
  assistant_name: string
  tone: string
}

interface Settings {
  primary_color?: string
  welcome_message?: string
}

interface Props {
  client: Client
  products: Product[]
  settings: Settings
}

export default function DemoStore({ client, products, settings }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [widgetReady, setWidgetReady] = useState(false)
  const color = settings.primary_color || '#6366f1'

  useEffect(() => {
    if (widgetReady && selectedProduct) {
      // Re-inicializar el widget cuando cambia el producto
      const container = document.getElementById('sales-assistant-widget')
      if (container) container.remove()
      ;(window as any).Assistant?.init({
        clientId: client.id,
        productId: selectedProduct.id,
      })
    }
  }, [selectedProduct, widgetReady, client.id])

  useEffect(() => {
    if (widgetReady) {
      ;(window as any).Assistant?.init({
        clientId: client.id,
        productId: selectedProduct?.id || null,
      })
    }
  }, [widgetReady])

  return (
    <>
      <Script
        src="/widget.js"
        strategy="afterInteractive"
        onLoad={() => setWidgetReady(true)}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav style={{ background: color }} className="text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg font-bold">
              {client.name[0]}
            </div>
            <span className="text-xl font-bold">{client.name}</span>
          </div>
          <div className="flex gap-6 text-sm opacity-90">
            <span className="cursor-pointer hover:opacity-70">Inicio</span>
            <span className="cursor-pointer hover:opacity-70">Productos</span>
            <span className="cursor-pointer hover:opacity-70">Contacto</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-80">🛒 Carrito (0)</span>
          </div>
        </nav>

        {/* Demo badge */}
        <div className="bg-amber-50 border-b border-amber-200 text-center py-2 text-sm text-amber-800">
          <span className="font-semibold">DEMO</span> — Sales Assistant IA embebido en este ecommerce •{' '}
          <span className="font-medium">Asistente: {client.assistant_name}</span>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Hero */}
          {!selectedProduct && (
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Bienvenido a {client.name}
              </h1>
              <p className="text-gray-500 text-lg">
                Selecciona un producto para ver el asistente IA en acción
              </p>
            </div>
          )}

          {/* Product detail view */}
          {selectedProduct ? (
            <div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
              >
                ← Volver al catálogo
              </button>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-between">
                    <div>
                      <span className="text-sm font-medium px-3 py-1 rounded-full text-white" style={{ background: color }}>
                        {selectedProduct.stock > 10 ? 'En stock' : `¡Solo ${selectedProduct.stock} disponibles!`}
                      </span>
                      <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{selectedProduct.name}</h2>
                      <p className="text-4xl font-bold mb-4" style={{ color }}>{selectedProduct.price}</p>
                      <p className="text-gray-600 mb-6">{selectedProduct.description}</p>

                      <div className="space-y-2 mb-8">
                        {selectedProduct.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <span style={{ color }} className="font-bold">✓</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        className="flex-1 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: color }}
                      >
                        Agregar al carrito
                      </button>
                      <button className="px-4 py-3 rounded-xl border-2 font-semibold transition-colors hover:bg-gray-50" style={{ borderColor: color, color }}>
                        ♡
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                      💬 ¿Tienes dudas? El asistente {client.assistant_name} está listo para ayudarte
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Product grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold" style={{ color }}>{product.price}</span>
                      <button
                        className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                        style={{ background: color }}
                      >
                        Ver más
                      </button>
                    </div>
                    {product.stock <= 5 && (
                      <p className="text-xs text-red-500 mt-2 font-medium">⚡ Solo {product.stock} disponibles</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-gray-400 border-t mt-16">
          <p>{client.name} — Powered by <strong>Sales Assistant IA</strong></p>
        </footer>
      </div>
    </>
  )
}
