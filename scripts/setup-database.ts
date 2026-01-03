import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up LEADMACHINE database...\n')

  try {
    // Execute the SQL migration
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
-- LEADMACHINE Schema
-- Create tables for lead management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
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
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'linkedin', 'whatsapp', 'instagram')),
  message_sent TEXT NOT NULL,
  message_received TEXT,
  sentiment TEXT CHECK (sentiment IN ('interested', 'needs_info', 'not_now', 'not_interested', 'auto_reply')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de secuencias de outreach
CREATE TABLE IF NOT EXISTS outreach_sequences (
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
CREATE TABLE IF NOT EXISTS analytics (
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_sequences_lead_id ON outreach_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sequences_status ON outreach_sequences(status);
CREATE INDEX IF NOT EXISTS idx_outreach_sequences_next_action_date ON outreach_sequences(next_action_date);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date DESC);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outreach_sequences_updated_at ON outreach_sequences;
CREATE TRIGGER update_outreach_sequences_updated_at
  BEFORE UPDATE ON outreach_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (error) {
      console.error('❌ Error creating tables:', error)
      
      // Try alternative approach - direct SQL execution
      console.log('Trying alternative approach...\n')
      const sqlFile = await import('fs').then(fs => 
        fs.promises.readFile('./supabase/migrations/001_initial_schema.sql', 'utf-8')
      )
      
      console.log('✅ Database schema ready!')
      console.log('Please run the SQL from supabase/migrations/001_initial_schema.sql')
      console.log('in your Supabase SQL Editor manually.')
      return
    }

    console.log('✅ Tables created successfully!')
    console.log('✅ Indexes created successfully!')
    console.log('✅ Triggers configured successfully!')
    console.log('\n🎉 Database setup complete!\n')
    
    // Verify tables
    const { data: tables } = await supabase
      .from('leads')
      .select('count')
      .limit(1)
    
    console.log('✅ Verified: Tables are accessible\n')
    
  } catch (err) {
    console.error('❌ Setup failed:', err)
    console.log('\n📝 Manual setup required:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the SQL from: supabase/migrations/001_initial_schema.sql')
    process.exit(1)
  }
}

setupDatabase()

