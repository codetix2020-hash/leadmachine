# 🎉 LEADMACHINE - ¡TOTALMENTE FUNCIONAL!

## ✅ Estado: COMPLETADO Y LISTO PARA USAR

### 🚀 Servidor corriendo en:
- **Local**: http://localhost:3000
- **Dashboard de Leads**: http://localhost:3000/en/dashboard/leads

---

## 📋 Lo que está funcionando:

### ✅ Base de Datos Supabase
- 4 tablas creadas y configuradas
- RLS (Row Level Security) habilitado
- Triggers automáticos funcionando

### ✅ APIs Configuradas
- ✅ **Google Maps API Key**: `AIzaSyDLCzQr29caybcJDEc4m6ZG0yoe_zjr-3c`
- ✅ **Anthropic (Claude) API Key**: Configurada
- ✅ **Supabase Keys**: Configuradas
- ✅ **Resend, Replicate, Slack**: Configuradas

### ✅ Sistema Completo
- 🔍 Google Maps Scraper - Busca negocios
- 🤖 Claude AI - Analiza y puntúa leads
- 📊 Dashboard - Gestiona leads con UI moderna
- 💾 Supabase - Almacena todos los datos

---

## 🎯 CÓMO USAR LEADMACHINE:

### Paso 1: Acceder al Dashboard
Ve a: **http://localhost:3000/en/dashboard/leads**

### Paso 2: Buscar Leads
1. Click en el botón **"🔍 Find Leads"**
2. Completa el formulario:
   - **Tipo de negocio**: Ej. "restaurantes", "peluquerías", "bares"
   - **Ubicación**: Ej. "Madrid, Spain", "Barcelona, Spain"
   - **Producto**: 
     - **Codetix** para restaurantes/bares (sistema de pedidos QR)
     - **Reservaspro** para spas/salones/clínicas (sistema de reservas)
3. Click en **"Buscar"**

### Paso 3: El sistema automáticamente:
1. ✅ Busca negocios en Google Maps
2. ✅ Analiza cada uno con Claude AI (~1 seg por lead)
3. ✅ Calcula un score de 0-100
4. ✅ Detecta problemas específicos
5. ✅ Genera insights personalizados
6. ✅ Guarda todo en Supabase

### Paso 4: Gestionar Leads
- **Filtrar** por tipo, status, score mínimo
- **Ver estadísticas**: Total, contactados, interesados, score promedio
- **Actualizar status**:
  - new → contacted → interested → call_scheduled → closed
- **Ver detalles**: Problema detectado, insight, contacto
- **Acciones rápidas**: Contactar, marcar interesado, agendar, cerrar, eliminar

---

## 🧪 EJEMPLO DE USO:

### Buscar restaurantes en Madrid para Codetix:
```
Tipo de negocio: restaurantes
Ubicación: Madrid, Spain
Producto: Codetix
```

### Buscar peluquerías en Barcelona para Reservaspro:
```
Tipo de negocio: peluquerías
Ubicación: Barcelona, Spain
Producto: Reservaspro
```

El sistema encontrará ~20 leads, los analizará con AI y te mostrará:
- **Score**: Probabilidad de conversión (0-100)
- **Problema detectado**: "No tiene presencia digital", "Rating bajo", etc.
- **Insight**: Observaciones únicas sobre el negocio
- **Contacto**: Email, teléfono, website

---

## 📡 API Endpoints disponibles:

### POST `/api/leads/discover`
Busca y analiza leads
```json
{
  "query": "restaurantes",
  "location": "Madrid, Spain",
  "type": "codetix",
  "maxResults": 20
}
```

### GET `/api/leads`
Lista leads con filtros
```
?type=codetix&status=new&minScore=70&page=1&limit=50
```

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

---

## 🎨 Features del Dashboard:

1. **Stats Cards**
   - Total de leads
   - Leads contactados
   - Leads interesados
   - Score promedio

2. **Filtros**
   - Por tipo (Codetix/Reservaspro)
   - Por status (new, contacted, interested, etc.)
   - Por score mínimo (50+, 70+, 80+)

3. **Lead Cards**
   - Nombre de la empresa
   - Ubicación
   - Score con color (verde 80+, amarillo 50+, rojo <50)
   - Problema detectado destacado
   - Insight personalizado
   - Información de contacto
   - Botones de acción contextuales

---

## 💡 Tips:

1. **Búsquedas efectivas**:
   - Usa ubicaciones específicas: "Barcelona, Catalunya" mejor que solo "Barcelona"
   - Prueba diferentes tipos: "restaurantes italianos", "spas lujo", "clínicas dentales"

2. **Scores altos (80+)**:
   - Negocios con teléfono pero sin website
   - Ratings bajos (<3.5) que necesitan mejorar
   - Muchas reseñas (negocio activo)
   - Tipo de negocio perfecto para el producto

3. **Rate Limits**:
   - Google Maps: ~1 búsqueda por segundo
   - Claude AI: ~1 análisis por segundo
   - Para 20 leads: ~30-40 segundos total

---

## 🐛 Troubleshooting:

### "No hay leads aún"
→ Haz tu primera búsqueda con el botón "Find Leads"

### "Error descubriendo leads"
→ Verifica las API keys en `.env`
→ Mira la consola del servidor para más detalles

### El servidor muestra warnings de Turbopack
→ Es normal en Windows con pnpm, no afecta la funcionalidad

---

## 📊 Próximos pasos sugeridos:

1. ✅ **YA FUNCIONA**: Buscar y gestionar leads
2. 🔜 **Outreach automático**: Enviar emails con Resend
3. 🔜 **LinkedIn integration**: Conectar con perfiles de LinkedIn
4. 🔜 **WhatsApp bot**: Contacto automatizado
5. 🔜 **Analytics avanzado**: Métricas y reportes
6. 🔜 **Secuencias automáticas**: Follow-ups programados

---

## 🎯 ¡EMPIEZA AHORA!

1. Ve a: **http://localhost:3000/en/dashboard/leads**
2. Click en **"🔍 Find Leads"**
3. Busca "restaurantes" en "Madrid, Spain"
4. Selecciona "Codetix"
5. ¡Observa la magia! 🪄

---

**¡LEADMACHINE está listo para generar tus primeros leads!** 🚀

Desarrollado con ❤️ usando:
- Next.js 16 (App Router + Turbopack)
- Supabase (PostgreSQL + RLS)
- Claude AI (Anthropic)
- Google Maps API
- TypeScript
- Tailwind CSS
- Supastarter




