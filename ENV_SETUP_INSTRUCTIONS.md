# INSTRUCCIONES PARA CONFIGURAR VARIABLES DE ENTORNO

## 🎯 Paso 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta (si no tienes una)
3. Crea un nuevo proyecto
4. Anota el nombre y contraseña de la base de datos

## 🔑 Paso 2: Obtener las credenciales de Supabase

En tu proyecto de Supabase:

1. Ve a **Project Settings** → **API**
2. Copia estos valores:
   - `Project URL` → esto va en `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → esto va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → esto va en `SUPABASE_SERVICE_ROLE_KEY`

3. Ve a **Project Settings** → **Database**
4. Copia la `Connection string` (URI format) → esto va en `DATABASE_URL`
   - Reemplaza `[YOUR-PASSWORD]` con tu contraseña real

## 📝 Paso 3: Actualizar el archivo .env

Abre el archivo `supastarter-nextjs/.env` y reemplaza los valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Database (Prisma)
DATABASE_URL=postgresql://postgres:tu-contraseña@db.tu-proyecto.supabase.co:5432/postgres
```

## 🗄️ Paso 4: Ejecutar las migraciones

Una vez configuradas las variables, ejecuta:

```bash
cd supastarter-nextjs
cd packages/database
pnpm prisma migrate dev --name init
```

O aplica la migración de Supabase que ya creamos:

```bash
# En el dashboard de Supabase, ve a SQL Editor y ejecuta:
# El contenido del archivo: supastarter-nextjs/supabase/migrations/001_initial_schema.sql
```

## 🚀 Paso 5: Iniciar el servidor

```bash
cd supastarter-nextjs
pnpm dev
```

## ⚡ Opción Rápida (para desarrollo local)

Si solo quieres probar sin configurar Supabase ahora, puedes usar SQLite temporalmente:

```env
DATABASE_URL=file:./dev.db
```

Y luego correr:
```bash
pnpm dev
```

---

## 🔧 Variables Opcionales (para después)

Estas no son necesarias para que la app arranque:

- `ANTHROPIC_API_KEY` - Para Claude AI (cuando implementes enrichment)
- `GOOGLE_MAPS_API_KEY` - Para lead discovery
- `SENDGRID_API_KEY` - Para envío de emails
- `APIFY_API_KEY` - Para scraping

