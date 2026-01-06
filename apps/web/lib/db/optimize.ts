import { initializeDatabase } from './client';

export async function createIndices() {
	await initializeDatabase();

	console.log('📊 Creating database indices...');

	try {
		const { sqlite } = await import('./client');

		// Index en leads (ya existen algunos, pero verificamos todos)
		const indices = [
			'CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)',
			'CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score)',
			'CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at)',
			'CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)',
			'CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type)',
			'CREATE INDEX IF NOT EXISTS idx_conversations_lead ON conversations(lead_id)',
			'CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at)',
			'CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel)',
			'CREATE INDEX IF NOT EXISTS idx_sequences_lead ON outreach_sequences(lead_id)',
			'CREATE INDEX IF NOT EXISTS idx_sequences_next_action ON outreach_sequences(next_action_date)',
			'CREATE INDEX IF NOT EXISTS idx_sequences_status ON outreach_sequences(status)',
		];

		for (const indexSql of indices) {
			try {
				await sqlite.execute(indexSql);
			} catch (e: any) {
				// Ignorar si ya existe
				if (!e.message?.includes('already exists')) {
					console.warn(`Warning creating index:`, e);
				}
			}
		}

		console.log('✅ Database indices created');
	} catch (error) {
		console.error('❌ Error creating indices:', error);
	}
}

// Ejecutar al inicio del servidor
if (typeof window === 'undefined') {
	createIndices().catch(console.error);
}

