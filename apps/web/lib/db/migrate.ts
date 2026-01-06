/**
 * Script de migración para crear las tablas en SQLite
 * Ejecutar una vez: pnpm tsx lib/db/migrate.ts
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const dbPath = path.join(process.cwd(), 'leadmachine.db');
const dbDir = path.dirname(dbPath);

if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite, { schema });

// Crear las tablas manualmente
console.log('📦 Creando tablas en SQLite...');

// Tabla leads
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    company_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    website TEXT,
    type TEXT NOT NULL CHECK (type IN ('codetix', 'reservaspro')),
    score INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'call_scheduled', 'closed', 'lost')),
    industry TEXT,
    location TEXT,
    employee_count INTEGER,
    problem_detected TEXT,
    insight TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
  CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
`);

// Tabla conversations
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'linkedin', 'whatsapp', 'instagram')),
    message_sent TEXT NOT NULL,
    message_received TEXT,
    sentiment TEXT CHECK (sentiment IN ('interested', 'needs_info', 'not_now', 'not_interested', 'auto_reply')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
  CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
`);

// Tabla outreach_sequences
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS outreach_sequences (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    sequence_type TEXT NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 1,
    next_action_date TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_outreach_sequences_lead_id ON outreach_sequences(lead_id);
  CREATE INDEX IF NOT EXISTS idx_outreach_sequences_status ON outreach_sequences(status);
  CREATE INDEX IF NOT EXISTS idx_outreach_sequences_next_action_date ON outreach_sequences(next_action_date);
`);

// Tabla analytics
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    leads_found INTEGER NOT NULL DEFAULT 0,
    messages_sent INTEGER NOT NULL DEFAULT 0,
    open_rate REAL NOT NULL DEFAULT 0,
    response_rate REAL NOT NULL DEFAULT 0,
    calls_scheduled INTEGER NOT NULL DEFAULT 0,
    deals_closed INTEGER NOT NULL DEFAULT 0,
    revenue_generated REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date DESC);
`);

console.log('✅ Tablas creadas exitosamente en leadmachine.db');
sqlite.close();



