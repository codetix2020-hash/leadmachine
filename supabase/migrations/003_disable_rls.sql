-- 🔓 DESACTIVAR RLS TEMPORALMENTE PARA DESARROLLO
-- Ejecuta esto en Supabase SQL Editor

ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_sequences DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- Verificar que se desactivó
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'conversations', 'outreach_sequences', 'analytics');

