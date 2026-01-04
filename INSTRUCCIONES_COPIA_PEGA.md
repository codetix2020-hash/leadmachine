# ✅ MIGRACIÓN AUTOMÁTICA - INSTRUCCIONES RÁPIDAS

## 🎯 LO QUE SE ACABÓ DE HACER:

✅ **SQL Editor de Supabase abierto** en tu navegador
✅ **Archivo SQL abierto** en Notepad

---

## 📋 SIGUIENTES PASOS (30 segundos):

### 1. Copia el SQL
- En **Notepad**: Presiona `Ctrl+A` (seleccionar todo)
- Presiona `Ctrl+C` (copiar)

### 2. Pega en Supabase
- Ve al navegador donde está el **SQL Editor**
- Haz click en el editor de texto grande
- Presiona `Ctrl+V` (pegar)

### 3. Ejecuta
- Haz click en el botón verde **"Run"** (abajo a la derecha)
- Espera ~2 segundos
- Deberías ver: **"Success. No rows returned"**

---

## ✅ DESPUÉS DE EJECUTAR:

La migración habrá:
- ✅ Añadido columna `user_id` a la tabla `leads`
- ✅ Creado índice para `user_id`
- ✅ Deshabilitado Row Level Security (RLS)
- ✅ Eliminado políticas de autenticación

---

## 🚀 ENTONCES PODRÁS:

1. Ir a **http://localhost:3000**
2. Ser redirigido a **/app/leads** automáticamente
3. Click en **"🔍 Find Leads"**
4. Buscar leads y verlos aparecer con scores de IA

---

## 💡 PARA FUTURAS MIGRACIONES:

Solo ejecuta:
```bash
pnpm db:migrate
```

Y el script automáticamente:
- Abrirá el SQL Editor
- Abrirá el archivo SQL
- Solo tendrás que copiar y pegar

---

**¡Ya casi está listo! Solo copia y pega el SQL y haz click en "Run"!** 🎉

