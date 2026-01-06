import { initializeDatabase } from '@/lib/db/client';
import { leads, conversations, outreachSequences } from '@/lib/db/schema';

export async function exportAllData() {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');

	console.log('💾 Exporting all data...');

	const allLeads = await db.select().from(leads);
	const allConvs = await db.select().from(conversations);
	const allSeqs = await db.select().from(outreachSequences);

	const backup = {
		timestamp: new Date().toISOString(),
		version: '1.0',
		data: {
			leads: allLeads,
			conversations: allConvs,
			outreachSequences: allSeqs,
		},
		stats: {
			totalLeads: allLeads.length,
			totalConversations: allConvs.length,
			totalSequences: allSeqs.length,
		},
	};

	return backup;
}

export async function importData(backup: any) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');

	console.log('📥 Importing data...');

	// Validar backup
	if (!backup.data || !backup.version) {
		throw new Error('Invalid backup format');
	}

	// Import leads
	if (backup.data.leads?.length > 0) {
		for (const lead of backup.data.leads) {
			try {
				await db.insert(leads).values(lead);
			} catch (error) {
				console.error(`Error importing lead ${lead.id}:`, error);
			}
		}
	}

	// Import conversations
	if (backup.data.conversations?.length > 0) {
		for (const conv of backup.data.conversations) {
			try {
				await db.insert(conversations).values(conv);
			} catch (error) {
				console.error(`Error importing conversation:`, error);
			}
		}
	}

	// Import sequences
	if (backup.data.outreachSequences?.length > 0) {
		for (const seq of backup.data.outreachSequences) {
			try {
				await db.insert(outreachSequences).values(seq);
			} catch (error) {
				console.error(`Error importing sequence:`, error);
			}
		}
	}

	console.log('✅ Import completed');
}

