# 🚀 LEADMACHINE

Sistema automático de generación y gestión de leads para **CodeTix** (venta de entradas) y **ReservasPro** (sistema de reservas online).

## 🎯 ¿Qué es LEADMACHINE?

LEADMACHINE es una plataforma completa que:
- 🔍 **Descubre leads** automáticamente usando Google Maps API
- 🤖 **Analiza negocios** con Claude AI para detectar problemas y oportunidades
- 📊 **Califica leads** con un sistema de scoring inteligente (0-100)
- 📈 **Gestiona el pipeline** completo de ventas
- 💬 **Automatiza outreach** (próximamente)
- 📉 **Analiza resultados** en tiempo real

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 16 + React + TypeScript
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** Claude 3.5 Sonnet (Anthropic)
- **Lead Discovery:** Google Maps API
- **UI:** Tailwind CSS + Shadcn UI
- **Monorepo:** Turborepo + pnpm

---

## 📦 Setup Instructions

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/codetix2020-hash/leadmachine.git
cd leadmachine/supastarter-nextjs
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
pnpm install
\`\`\`

### 3. Configurar variables de entorno

Crea un archivo \`.env\` en la raíz con:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Claude AI (para análisis de leads)
ANTHROPIC_API_KEY=tu-api-key-de-anthropic

# Google Maps (para lead discovery)
GOOGLE_MAPS_API_KEY=tu-api-key-de-google-maps

# Opcional - para scraping avanzado
APIFY_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Configurar base de datos

\`\`\`bash
pnpm db:setup
\`\`\`

O manualmente: Ve a tu Supabase Dashboard > SQL Editor y ejecuta el contenido de \`supabase/migrations/001_initial_schema.sql\`

### 5. Iniciar servidor de desarrollo

\`\`\`bash
pnpm dev
\`\`\`

La app estará en: **http://localhost:3000**

---

## 🚀 Cómo usar

### 1. Descubrir Leads

1. Ve a **Dashboard > Leads**
2. Haz clic en **"Find Leads"**
3. Completa el formulario:
   - **Tipo de negocio:** "barberías", "restaurantes", "discotecas"
   - **Ubicación:** "Barcelona, Spain"
   - **Producto:** CodeTix o ReservasPro
4. LEADMACHINE automáticamente:
   - Busca negocios en Google Maps
   - Analiza cada uno con Claude AI
   - Detecta problemas y oportunidades
   - Calcula un score de 0-100
   - Los guarda en tu base de datos

### 2. Gestionar Leads

- **Filtrar** por tipo, status, score mínimo
- **Ver detalles** de cada lead (problema detectado, insight, contacto)
- **Cambiar status:** New → Contacted → Interested → Call Scheduled → Closed
- **Marcar como perdido** si no están interesados

### 3. Pipeline

Ve a **Dashboard > Pipeline** para ver el flujo de ventas por etapa.

### 4. Analytics

Ve a **Dashboard > Analytics** para ver métricas y rendimiento.

---

## 📡 API Endpoints

### POST `/api/leads/discover`

Descubre y guarda nuevos leads.

**Request:**
\`\`\`json
{
  "query": "barberías",
  "location": "Barcelona, Spain",
  "type": "reservaspro"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "count": 15,
  "leads": [...]
}
\`\`\`

### GET `/api/leads`

Obtiene leads con filtros y paginación.

**Query params:**
- \`type\` - "codetix" | "reservaspro"
- \`status\` - "new" | "contacted" | "interested" | "call_scheduled" | "closed" | "lost"
- \`minScore\` - número (ej: 50)
- \`page\` - número (default: 1)
- \`limit\` - número (default: 50)

**Ejemplo:**
\`\`\`bash
GET /api/leads?type=reservaspro&status=new&minScore=70&page=1&limit=20
\`\`\`

### PUT `/api/leads`

Actualiza un lead.

**Request:**
\`\`\`json
{
  "id": "uuid-del-lead",
  "status": "contacted"
}
\`\`\`

### DELETE `/api/leads?id=xxx`

Elimina un lead.

---

## 🗄️ Database Schema

### Tabla: \`leads\`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| company_name | TEXT | Nombre del negocio |
| email | TEXT | Email (opcional) |
| phone | TEXT | Teléfono |
| website | TEXT | Website |
| type | ENUM | "codetix" o "reservaspro" |
| score | INTEGER | 0-100 |
| status | ENUM | "new", "contacted", "interested", etc. |
| industry | TEXT | Industria del negocio |
| location | TEXT | Dirección |
| problem_detected | TEXT | Problema identificado por AI |
| insight | TEXT | Observación clave |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### Tabla: \`conversations\`

Para tracking de comunicación con leads.

### Tabla: \`outreach_sequences\`

Para secuencias automatizadas de outreach.

### Tabla: \`analytics\`

Para métricas diarias.

---

## 🧰 Scripts Útiles

\`\`\`bash
# Desarrollo
pnpm dev               # Inicia servidor de desarrollo
pnpm build             # Build para producción
pnpm start             # Inicia servidor de producción

# Database
pnpm db:setup          # Configura tablas en Supabase
pnpm db:reset          # Elimina todos los datos (cuidado!)

# Code Quality
pnpm lint              # Revisa errores de lint
pnpm format            # Formatea código
pnpm check             # Check completo
\`\`\`

---

## 📁 Estructura del Proyecto

\`\`\`
supastarter-nextjs/
├── apps/web/
│   ├── app/
│   │   ├── api/
│   │   │   └── leads/
│   │   │       ├── discover/route.ts    # Descubrir leads
│   │   │       └── route.ts             # CRUD de leads
│   │   └── dashboard/
│   │       ├── leads/page.tsx           # Página de leads
│   │       ├── pipeline/page.tsx        # Pipeline
│   │       └── analytics/page.tsx       # Analytics
│   ├── components/
│   │   └── dashboard/
│   │       ├── lead-card/               # Componente de lead
│   │       ├── pipeline-view/           # Vista de pipeline
│   │       └── analytics-charts/        # Gráficos
│   ├── lib/
│   │   ├── lead-discovery/
│   │   │   └── google-maps-scraper.ts   # Google Maps API
│   │   ├── enrichment/
│   │   │   └── analyze-lead.ts          # Claude AI analysis
│   │   ├── outreach/                     # Email/LinkedIn automation
│   │   ├── ai/                           # Conversational AI
│   │   └── scoring/                      # Lead scoring logic
│   └── types/
│       ├── lead.ts                       # Tipos de Lead
│       ├── conversation.ts               # Tipos de Conversation
│       └── analytics.ts                  # Tipos de Analytics
├── scripts/
│   ├── setup-database.ts                 # Setup inicial DB
│   └── reset-database.ts                 # Reset de datos
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        # Schema SQL
└── package.json
\`\`\`

---

## 🤖 Cómo funciona el AI

### Lead Analysis con Claude

Cuando descubres leads, Claude analiza cada negocio y:

1. **Detecta problemas específicos:**
   - "No tienen sistema de reservas online"
   - "Venden entradas manualmente"
   - "Website anticuado"

2. **Genera insights:**
   - "Alto tráfico, buen candidato"
   - "Negocio familiar, decision maker es el dueño"

3. **Calcula score inteligente:**
   - Basado en fit con el producto
   - Señales de website, reseñas, ubicación
   - Tamaño estimado del negocio

4. **Recomienda producto:**
   - CodeTix para eventos, teatros, clubs
   - ReservasPro para restaurantes, spas, barberías

---

## 🔮 Próximas Features

- [ ] Outreach automation (email, LinkedIn)
- [ ] WhatsApp integration
- [ ] Instagram DM automation
- [ ] AI conversation handler
- [ ] Analytics avanzados con gráficos
- [ ] Export a CSV
- [ ] Webhooks para integraciones
- [ ] Mobile app

---

## 📝 License

Propietario - Codetix 2020

---

## 🤝 Contribuir

Este es un proyecto privado. Para acceso, contacta al equipo de Codetix.

---

## 📞 Soporte

Para preguntas o problemas:
- Email: hello@codetix.com
- GitHub Issues: https://github.com/codetix2020-hash/leadmachine/issues

---

**Hecho con ❤️ por el equipo de Codetix**
