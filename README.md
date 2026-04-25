# Sales Assistant IA — Demo

Widget embebible de ventas con IA para ecommerce. Sistema SaaS multi-tenant.

## Setup rápido (5 pasos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) → New project
2. En **SQL Editor**, ejecuta todo el contenido de `supabase/schema.sql`
3. Copia tu **Project URL** y **anon key** desde Settings > API

### 3. Obtener API key de Anthropic
1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. API Keys → Create Key

### 4. Configurar variables de entorno
Edita `.env.local` con tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Correr el proyecto
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Rutas del demo

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con las 3 tiendas demo |
| `/demo/11111111-...` | TechStore Pro (laptops, auriculares) |
| `/demo/22222222-...` | ModaElite (bolsos, zapatos) |
| `/demo/33333333-...` | FitLife Nutrition (suplementos) |
| `/admin` | Panel multi-tenant con todos los clientes |

## IDs de clientes demo

```
TechStore Pro:     11111111-1111-1111-1111-111111111111
ModaElite:         22222222-2222-2222-2222-222222222222
FitLife Nutrition: 33333333-3333-3333-3333-333333333333
```

## Integración del widget en cualquier sitio

```html
<script src="https://tudominio.com/widget.js"></script>
<script>
  window.Assistant.init({
    clientId: "TU_CLIENT_ID",
    productId: "ID_PRODUCTO" // opcional
  })
</script>
```

## API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/config?clientId=X` | GET | Config y settings del cliente |
| `/api/context` | POST | Datos del producto actual |
| `/api/chat` | POST | Enviar mensaje al asistente IA |

## Stack

- **Frontend**: Next.js 15 + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: Supabase (PostgreSQL + RLS)
- **IA**: Claude Sonnet (Anthropic API)
- **Deploy**: Vercel

## Deploy en Vercel

```bash
npx vercel
```

Agregar las mismas variables de entorno en el dashboard de Vercel.
