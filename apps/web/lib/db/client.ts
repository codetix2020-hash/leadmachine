import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

// Ruta de la base de datos (en la raíz del proyecto apps/web)
const dbPath = path.resolve(process.cwd(), 'leadmachine.db');

// Asegurar que el directorio existe
const dbDir = path.dirname(dbPath);
if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
}

// Crear conexión SQLite con libSQL (compatible con SQLite)
const sqlite = createClient({
	url: `file:${dbPath}`,
});

// Función para inicializar la base de datos (lazy initialization)
let initialized = false;
let initPromise: Promise<void> | null = null;

async function initializeDatabase() {
	if (initialized) return;
	if (initPromise) return initPromise;
	
	initPromise = (async () => {
		try {
			const migrations = [
				`CREATE TABLE IF NOT EXISTS leads (
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
					created_at TEXT NOT NULL DEFAULT (datetime('now')),
					updated_at TEXT NOT NULL DEFAULT (datetime('now'))
				)`,
				`CREATE TABLE IF NOT EXISTS conversations (
					id TEXT PRIMARY KEY,
					lead_id TEXT NOT NULL,
					channel TEXT NOT NULL CHECK (channel IN ('email', 'linkedin', 'whatsapp', 'instagram')),
					message_sent TEXT NOT NULL,
					message_received TEXT,
					sentiment TEXT CHECK (sentiment IN ('interested', 'needs_info', 'not_now', 'not_interested', 'auto_reply')),
					created_at TEXT NOT NULL DEFAULT (datetime('now')),
					FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
				)`,
				`CREATE TABLE IF NOT EXISTS outreach_sequences (
					id TEXT PRIMARY KEY,
					lead_id TEXT NOT NULL,
					sequence_type TEXT NOT NULL,
					current_step INTEGER NOT NULL DEFAULT 1,
					next_action_date TEXT,
					status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
					created_at TEXT NOT NULL DEFAULT (datetime('now')),
					updated_at TEXT NOT NULL DEFAULT (datetime('now')),
					FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
				)`,
				`CREATE TABLE IF NOT EXISTS analytics (
					id TEXT PRIMARY KEY,
					date TEXT NOT NULL UNIQUE,
					leads_found INTEGER NOT NULL DEFAULT 0,
					messages_sent INTEGER NOT NULL DEFAULT 0,
					open_rate REAL NOT NULL DEFAULT 0,
					response_rate REAL NOT NULL DEFAULT 0,
					calls_scheduled INTEGER NOT NULL DEFAULT 0,
					deals_closed INTEGER NOT NULL DEFAULT 0,
					revenue_generated REAL NOT NULL DEFAULT 0,
					created_at TEXT NOT NULL DEFAULT (datetime('now'))
				)`,
			];

			for (const migration of migrations) {
				await sqlite.execute(migration);
			}

			const indexes = [
				'CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id)',
				'CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type)',
				'CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)',
				'CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC)',
				'CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)',
				'CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id)',
				'CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel)',
				'CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC)',
				'CREATE INDEX IF NOT EXISTS idx_outreach_sequences_lead_id ON outreach_sequences(lead_id)',
				'CREATE INDEX IF NOT EXISTS idx_outreach_sequences_status ON outreach_sequences(status)',
				'CREATE INDEX IF NOT EXISTS idx_outreach_sequences_next_action_date ON outreach_sequences(next_action_date)',
				'CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date DESC)',
			];

			for (const index of indexes) {
				await sqlite.execute(index);
			}

			// Habilitar foreign keys
			await sqlite.execute('PRAGMA foreign_keys = ON');

			initialized = true;
			console.log('✅ SQLite database initialized at:', dbPath);
		} catch (error) {
			console.error('❌ Error initializing SQLite database:', error);
			initPromise = null; // Permitir reintentar
			throw error;
		}
	})();
	
	return initPromise;
}

// Inicializar al importar el módulo
initializeDatabase().catch((error) => {
	console.error('Failed to initialize database on module load:', error);
});

// Exportar función de inicialización para usar en APIs si es necesario
export { initializeDatabase };

// Crear cliente Drizzle
export const db = drizzle(sqlite, { schema });

// Exportar sqlite para operaciones directas si es necesario
export { sqlite };

// User ID dummy (sin auth)
export const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';
