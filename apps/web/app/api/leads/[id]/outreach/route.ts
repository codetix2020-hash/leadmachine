import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/client';
import { startOutreachSequence } from '@/lib/outreach/orchestrator';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		await initializeDatabase();

		const { id } = await params;

		const { db } = await import('@/lib/db/client');
		const { leads } = await import('@/lib/db/schema');
		const { eq } = await import('drizzle-orm');

		// Obtener lead
		const [lead] = await db.select().from(leads).where(eq(leads.id, id));

		if (!lead) {
			return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
		}

		// Verificar que tiene enrichment
		if (!lead.enrichmentData && !lead.enrichment_data) {
			return NextResponse.json({ error: 'Run deep enrichment first' }, { status: 400 });
		}

		const enrichment = JSON.parse(lead.enrichmentData || lead.enrichment_data || '{}');

		// Iniciar outreach
		const result = await startOutreachSequence({
			leadId: id,
			lead,
			enrichment,
		});

		return NextResponse.json(result);
	} catch (error: any) {
		console.error('Outreach error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

