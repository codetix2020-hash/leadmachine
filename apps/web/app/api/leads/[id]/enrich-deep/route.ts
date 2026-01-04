/**
 * API Endpoint: Deep Enrichment de Lead
 * POST /api/leads/[id]/enrich-deep
 */

import { NextRequest, NextResponse } from 'next/server';
import { deepEnrichLead } from '@/lib/enrichment/master-enricher';
import { db, initializeDatabase } from '@/lib/db/client';
import { leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	await initializeDatabase();
	try {
		const { id } = await params;

		// Obtener lead de DB
		const [lead] = await db.select().from(leads).where(eq(leads.id, id));

		if (!lead) {
			return NextResponse.json(
				{ error: 'Lead not found' },
				{ status: 404 }
			);
		}

		console.log(`🔍 Iniciando deep enrichment para: ${lead.company_name}`);

		// Deep enrichment (puede tomar 10-30 segundos)
		const enrichment = await deepEnrichLead(lead);

		// Actualizar lead en DB con nuevo data
		await db
			.update(leads)
			.set({
				enrichmentData: JSON.stringify(enrichment),
				score: enrichment.predictiveScores.closeProbability,
				lastEnrichedAt: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.where(eq(leads.id, id));

		console.log(`✅ Deep enrichment completado para: ${lead.company_name}`);

		return NextResponse.json({
			success: true,
			enrichment,
		});
	} catch (error) {
		console.error('Error en deep enrichment:', error);
		return NextResponse.json(
			{
				error: 'Enrichment failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

