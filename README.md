# 🚀 LEADMACHINE

Sistema automático de generación y gestión de leads con IA, construido sobre Supastarter Next.js.

## 📋 Características

- **🔍 Descubrimiento Automático de Leads**: Busca negocios en Google Maps basándote en ubicación y tipo de negocio
- **🤖 Análisis con IA**: Claude AI analiza cada lead para detectar problemas, calcular score y dar insights
- **📊 Dashboard Interactivo**: Gestiona todos tus leads con filtros y acciones rápidas
- **📈 Scoring Inteligente**: Cada lead recibe un score de 0-100 basado en su probabilidad de conversión
- **🎯 Dos Productos**:
  - **Codetix**: Sistema de pedidos con QR para restaurantes y bares
  - **Reservaspro**: Sistema de reservas para spas, salones y clínicas

## 🛠️ Setup

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Crea/actualiza tu archivo `.env` con estas keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://llquwqbqzlpycemxuxur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude (para analizar leads)
ANTHROPIC_API_KEY=your_anthropic_key

# Google Maps (para buscar negocios)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Resend (para emails outreach)
RESEND_API_KEY=your_resend_key

# Replicate (para imágenes)
REPLICATE_API_TOKEN=your_replicate_token

# Slack (notificaciones)
SLACK_WEBHOOK_URL=your_slack_webhook

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup de la base de datos

La base de datos ya está configurada en Supabase con estas tablas:
- `leads`: Almacena todos los leads descubiertos
- `conversations`: Registro de conversaciones con cada lead
- `outreach_sequences`: Secuencias de contacto automatizadas
- `analytics`: Métricas y estadísticas

### 4. Obtener API Keys

#### Google Maps API Key
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita estas APIs:
   - Places API
   - Geocoding API
4. Ve a "Credentials" → "Create Credentials" → "API Key"
5. Copia tu API key y añádela al `.env`

**IMPORTANTE**: Esta es la key que falta y necesitas para que funcione la búsqueda de leads.

#### Anthropic API Key
Ya la tienes configurada: `sk-ant-api03-...`

## 🚀 Uso

### Iniciar el servidor de desarrollo

```bash
pnpm dev
```

La app estará disponible en `http://localhost:3000`

### Dashboard de Leads

1. Ve a `/dashboard/leads`
2. Click en "🔍 Find Leads"
3. Completa el formulario:
   - **Tipo de negocio**: ej. "restaurantes", "peluquerías"
   - **Ubicación**: ej. "Barcelona, Spain"
   - **Producto**: Selecciona Codetix o Reservaspro
4. Click en "Buscar"

El sistema:
1. Buscará negocios en Google Maps
2. Analizará cada uno con Claude AI
3. Calculará scores automáticamente
4. Guardará los leads en Supabase

### Gestionar Leads

En el dashboard puedes:
- **Filtrar** por tipo, status, score mínimo
- **Ver detalles** de cada lead (problema detectado, insight, contacto)
- **Actualizar status**: new → contacted → interested → call_scheduled → closed
- **Marcar como perdido** o eliminar leads

## 📡 API Endpoints

### POST `/api/leads/discover`
Descubre nuevos leads

```json
{
  "query": "restaurantes",
  "location": "Barcelona, Spain",
  "type": "codetix",
  "maxResults": 20
}
```

### GET `/api/leads`
Obtiene leads con filtros

Query params: `type`, `status`, `minScore`, `industry`, `page`, `limit`

### PUT `/api/leads`
Actualiza un lead

```json
{
  "id": "uuid",
  "status": "contacted"
}
```

### DELETE `/api/leads?id=uuid`
Elimina un lead

## 📁 Estructura del Proyecto

```
apps/web/
├── app/
│   ├── api/
│   │   └── leads/
│   │       ├── discover/route.ts  # Descubrir leads
│   │       └── route.ts           # CRUD de leads
│   └── dashboard/
│       └── leads/page.tsx         # UI principal
├── components/
│   └── dashboard/
│       └── lead-card/LeadCard.tsx # Card de lead
├── lib/
│   ├── lead-discovery/
│   │   └── google-maps-scraper.ts # Scraper de Google Maps
│   └── enrichment/
│       └── analyze-lead.ts        # Análisis con Claude
└── types/
    ├── lead.ts                    # Tipos de Lead
    ├── conversation.ts
    └── analytics.ts
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build producción
pnpm build

# Iniciar producción
pnpm start

# Setup database (si necesitas recrear)
pnpm db:setup

# Reset database (eliminar todos los datos)
pnpm db:reset
```

## 🎯 Próximos Pasos

1. **Obtener Google Maps API Key** (OBLIGATORIO para buscar leads)
2. Configurar límites de API usage en Google Cloud
3. Personalizar prompts de Claude para mejor análisis
4. Implementar sistema de outreach automático
5. Añadir integración con LinkedIn/WhatsApp
6. Dashboard de analytics avanzado

## 🐛 Troubleshooting

### "GOOGLE_MAPS_API_KEY no está configurada"
Necesitas obtener una API key de Google Maps (ver instrucciones arriba).

### "Error descubriendo leads"
Verifica:
1. Que todas las API keys estén correctamente configuradas
2. Que Supabase esté accesible
3. Los logs en la consola del servidor

### "No se encontró la ubicación"
Asegúrate de usar ubicaciones válidas como:
- "Madrid, Spain"
- "Barcelona, Catalunya"
- "London, UK"

## 📝 Notas

- El análisis con Claude tarda ~1 segundo por lead (rate limiting)
- Google Maps devuelve máximo 60 resultados por búsqueda
- Los scores son calculados automáticamente por la IA
- Todos los datos se guardan en Supabase en tiempo real

## 🤝 Contribuir

Este es un proyecto privado construido sobre Supastarter.

---

**Desarrollado con ❤️ usando Next.js, Supabase, Claude AI y Google Maps**
