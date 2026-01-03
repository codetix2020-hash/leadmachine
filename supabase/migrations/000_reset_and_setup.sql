-- LEADMACHINE - Reset completo y setup
-- Ejecuta esto en el SQL Editor de Supabase

-- =====================================================
-- PASO 1: ELIMINAR TODO LO EXISTENTE
-- =====================================================

-- Eliminar políticas RLS
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

-- Eliminar triggers
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_outreach_sequences_updated_at ON outreach_sequences;

-- Eliminar función
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar índices
DROP INDEX IF EXISTS idx_leads_type;
DROP INDEX IF EXISTS idx_leads_status;
DROP INDEX IF EXISTS idx_leads_score;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_conversations_lead_id;
DROP INDEX IF EXISTS idx_conversations_channel;
DROP INDEX IF EXISTS idx_conversations_created_at;
DROP INDEX IF EXISTS idx_outreach_sequences_lead_id;
DROP INDEX IF EXISTS idx_outreach_sequences_status;
DROP INDEX IF EXISTS idx_outreach_sequences_next_action_date;
DROP INDEX IF EXISTS idx_analytics_date;

-- Eliminar tablas (en orden inverso debido a las foreign keys)
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS outreach_sequences CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- =====================================================
-- PASO 2: CREAR TODO DE NUEVO
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  website TEXT,
  type TEXT NOT NULL CHECK (type IN ('codetix', 'reservaspro')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'call_scheduled', 'closed', 'lost')),
  industry TEXT,
  location TEXT,
  employee_count INTEGER,
  problem_detected TEXT,
  insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conversaciones
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'linkedin', 'whatsapp', 'instagram')),
  message_sent TEXT NOT NULL,
  message_received TEXT,
  sentiment TEXT CHECK (sentiment IN ('interested', 'needs_info', 'not_now', 'not_interested', 'auto_reply')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de secuencias de outreach
CREATE TABLE outreach_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sequence_type TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  next_action_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de analytics
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  leads_found INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  open_rate FLOAT DEFAULT 0,
  response_rate FLOAT DEFAULT 0,
  calls_scheduled INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  revenue_generated FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_leads_type ON leads(type);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_outreach_sequences_lead_id ON outreach_sequences(lead_id);
CREATE INDEX idx_outreach_sequences_status ON outreach_sequences(status);
CREATE INDEX idx_outreach_sequences_next_action_date ON outreach_sequences(next_action_date);
CREATE INDEX idx_analytics_date ON analytics(date DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_sequences_updated_at
  BEFORE UPDATE ON outreach_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de seguridad
CREATE POLICY "Enable read access for authenticated users" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON conversations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON outreach_sequences
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON outreach_sequences
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON outreach_sequences
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON analytics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

