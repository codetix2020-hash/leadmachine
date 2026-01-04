import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/client';
import { deepEnrichLead } from '@/lib/enrichment/master-enricher';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		await initializeDatabase();

		const { id } = await params;

		const { db } = await import('@/lib/db/client');
		const { leads } = await import('@/lib/db/schema');
		const { eq, sql } = await import('drizzle-orm');

		// Obtener lead
		const [lead] = await db.select().from(leads).where(eq(leads.id, id));

		if (!lead) {
			return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
		}

		// Deep enrichment (10-20 segundos)
		console.log(`🔍 Iniciando deep enrichment para: ${lead.company_name}`);
		const enrichment = await deepEnrichLead(lead);
		console.log(`✅ Deep enrichment completado para: ${lead.company_name}`);

		// Guardar en DB
		await db
			.update(leads)
			.set({
				enrichmentData: JSON.stringify(enrichment),
				score: enrichment.predictiveScores?.closeProbability || lead.score,
				updated_at: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(leads.id, id));

		return NextResponse.json({
			success: true,
			enrichment,
		});
	} catch (error: any) {
		console.error('Deep enrichment error:', error);
		return NextResponse.json({ error: error.message || 'Enrichment failed' }, { status: 500 });
	}
}

