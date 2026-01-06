# 🔓 CONFIGURACIÓN AUTOMÁTICA - DATABASE_URL

## ⚡ SOLUCIÓN RÁPIDA (1 minuto):

Para que el script `pnpm db:migrate` funcione automáticamente, necesitas:

### Paso 1: Obtener la contraseña de Supabase

1. Ve a: **https://supabase.com/dashboard/project/llquwqbqzlpycemxuxur/settings/database**
2. En la sección **"Connection string"**, busca la línea que dice **"URI"**
3. Debe verse algo como:
   ```
   postgresql://postgres.llquwqbqzlpycemxuxur:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. Copia el **[PASSWORD]** (la parte entre `:` y `@`)

### Paso 2: Actualizar .env

Abre el archivo `.env` y reemplaza esta línea:

```env
DATABASE_URL=postgresql://postgres:your-password@db.llquwqbqzlpycemxuxur.supabase.co:5432/postgres
```

Por esta (con tu contraseña real):

```env
DATABASE_URL=postgresql://postgres.llquwqbqzlpycemxuxur:[TU_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Reemplaza `[TU_PASSWORD]` con la contraseña que copiaste**

### Paso 3: Ejecutar migración

```bash
pnpm db:migrate
```

¡Y listo! La migración se ejecutará automáticamente. ✅

---

## 🎯 ¿NO TIENES LA CONTRASEÑA?

Si no tienes la contraseña de la base de datos:

1. Ve a Supabase Dashboard > Settings > Database
2. Click en **"Reset database password"**
3. Copia la nueva contraseña
4. Úsala en DATABASE_URL

---

## 📝 ALTERNATIVA: Ejecutar SQL manualmente

Si prefieres ejecutar el SQL manualmente (solo 1 vez):

1. Ve a: **https://supabase.com/dashboard/project/llquwqbqzlpycemxuxur/sql/new**
2. Abre: `supabase/migrations/002_add_user_id_disable_rls.sql`
3. Copia y pega todo el contenido
4. Click "Run"

---

**Una vez configurado DATABASE_URL, siempre podrás ejecutar `pnpm db:migrate` y todo será automático!** 🚀



