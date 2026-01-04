-- 🔓 MIGRACIÓN: Añadir user_id y deshabilitar RLS para desarrollo sin auth

-- 1. Añadir columna user_id a la tabla leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000';

-- 2. Crear índice para user_id
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- 3. DESHABILITAR RLS temporalmente para desarrollo
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_sequences DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON outreach_sequences;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON outreach_sequences;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON outreach_sequences;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON analytics;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON analytics;

-- ✅ LISTO: Ahora puedes usar la app sin autenticación
-- Los leads se guardarán con user_id = '00000000-0000-0000-0000-000000000000'

