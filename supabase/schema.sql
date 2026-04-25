-- ============================================================
-- Sales Assistant IA - Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla de clientes (multi-tenant)
create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text unique not null,
  api_key     text unique default gen_random_uuid()::text,
  tone        text default 'profesional',
  assistant_name text default 'Asistente',
  active      boolean default true,
  created_at  timestamptz default now()
);

-- Tabla de productos por cliente
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete cascade,
  name        text not null,
  price       text not null,
  description text,
  features    jsonb default '[]',
  stock       int default 0,
  image_url   text,
  created_at  timestamptz default now()
);

-- Tabla de conversaciones
create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete cascade,
  product_id  uuid references products(id) on delete set null,
  session_id  text not null,
  created_at  timestamptz default now()
);

-- Tabla de mensajes
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role            text check (role in ('user', 'assistant')) not null,
  content         text not null,
  created_at      timestamptz default now()
);

-- Tabla de configuración por cliente
create table if not exists settings (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references clients(id) on delete cascade unique,
  welcome_message text default '¡Hola! ¿En qué puedo ayudarte hoy?',
  primary_color   text default '#6366f1',
  position        text default 'bottom-right',
  show_avatar     boolean default true,
  proactive_msg   text default '¿Tienes alguna pregunta sobre este producto?',
  updated_at      timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table clients      enable row level security;
alter table products     enable row level security;
alter table conversations enable row level security;
alter table messages     enable row level security;
alter table settings     enable row level security;

-- Política: acceso público de lectura por client_id/api_key (para el widget)
create policy "Widget puede leer productos por client_id"
  on products for select using (true);

create policy "Widget puede leer settings por client_id"
  on settings for select using (true);

create policy "Widget puede insertar conversaciones"
  on conversations for insert with check (true);

create policy "Widget puede insertar mensajes"
  on messages for insert with check (true);

create policy "Widget puede leer conversaciones"
  on conversations for select using (true);

create policy "Widget puede leer mensajes"
  on messages for select using (true);

-- ============================================================
-- Datos de demo (3 clientes ficticios)
-- ============================================================

-- Cliente 1: Tienda de tecnología
insert into clients (id, name, email, api_key, tone, assistant_name) values
  ('11111111-1111-1111-1111-111111111111', 'TechStore Pro', 'demo@techstore.com', 'demo-techstore-key', 'moderno y entusiasta', 'Alex');

insert into products (client_id, name, price, description, features, stock, image_url) values
  ('11111111-1111-1111-1111-111111111111', 'Laptop UltraBook X1', '$1,299', 'Laptop ultradelgada para profesionales con 20h de batería', '["Intel Core i7 13a gen", "16GB RAM DDR5", "512GB NVMe SSD", "Pantalla 14\" OLED", "Peso: 1.2kg", "Batería 20h"]', 15, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
  ('11111111-1111-1111-1111-111111111111', 'Auriculares Pro X', '$249', 'Auriculares con cancelación de ruido activa y 30h de batería', '["Cancelación ruido activa", "30h batería", "Bluetooth 5.3", "Carga rápida 15min = 3h", "Plegables"]', 42, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
  ('11111111-1111-1111-1111-111111111111', 'Smartwatch FitPro', '$189', 'Smartwatch deportivo con GPS y monitor de salud avanzado', '["GPS integrado", "Monitor cardíaco 24/7", "100+ modos deporte", "Resistente al agua 50m", "Batería 7 días"]', 28, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400');

insert into settings (client_id, welcome_message, primary_color, position, proactive_msg) values
  ('11111111-1111-1111-1111-111111111111', '¡Hola! Soy Alex de TechStore. ¿Te ayudo a encontrar el producto perfecto? 🚀', '#6366f1', 'bottom-right', '¿Tienes dudas sobre las especificaciones técnicas?');

-- Cliente 2: Tienda de moda
insert into clients (id, name, email, api_key, tone, assistant_name) values
  ('22222222-2222-2222-2222-222222222222', 'ModaElite', 'demo@modaelite.com', 'demo-modaelite-key', 'elegante y sofisticado', 'Sofía');

insert into products (client_id, name, price, description, features, stock, image_url) values
  ('22222222-2222-2222-2222-222222222222', 'Bolso Premium Leather', '$399', 'Bolso artesanal de cuero genuino italiano con herrajes dorados', '["Cuero italiano 100%", "Herrajes bañados en oro", "Forro en seda", "Compartimentos organizadores", "Incluye bolsa guardado"]', 8, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'),
  ('22222222-2222-2222-2222-222222222222', 'Zapatos Stiletto Classic', '$280', 'Stilettos clásicos de cuero con tacón de 10cm', '["Cuero genuino", "Tacón 10cm", "Plantilla acolchada", "Suela antideslizante", "Tallas 35-42"]', 20, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400');

insert into settings (client_id, welcome_message, primary_color, position, proactive_msg) values
  ('22222222-2222-2222-2222-222222222222', 'Bienvenida a ModaElite. Soy Sofía, tu asesora de moda personal ✨', '#ec4899', 'bottom-right', '¿Puedo ayudarte a encontrar la talla perfecta?');

-- Cliente 3: Suplementos deportivos
insert into clients (id, name, email, api_key, tone, assistant_name) values
  ('33333333-3333-3333-3333-333333333333', 'FitLife Nutrition', 'demo@fitlife.com', 'demo-fitlife-key', 'energético y motivador', 'Max');

insert into products (client_id, name, price, description, features, stock, image_url) values
  ('33333333-3333-3333-3333-333333333333', 'Proteína Whey Gold', '$59', 'Proteína de suero de leche de alta calidad, 25g proteína por servicio', '["25g proteína por servicio", "5.5g BCAAs naturales", "Sin azúcar añadida", "30 servicios", "Sabores: chocolate, vainilla, fresa"]', 150, 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400'),
  ('33333333-3333-3333-3333-333333333333', 'Pre-Workout Extreme', '$45', 'Pre-entreno con cafeína, creatina y beta-alanina para máximo rendimiento', '["200mg cafeína", "3g creatina monohidrato", "2g beta-alanina", "Sin colorantes artificiales", "20 servicios"]', 80, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400');

insert into settings (client_id, welcome_message, primary_color, position, proactive_msg) values
  ('33333333-3333-3333-3333-333333333333', '¡Hola campeón! Soy Max, tu asesor de nutrición deportiva 💪', '#f59e0b', 'bottom-right', '¿Tienes alguna pregunta sobre ingredientes o cómo tomar este producto?');
