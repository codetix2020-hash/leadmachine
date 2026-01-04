/**
 * API Endpoint: Descubrir Leads (Multi-fuente)
 * POST /api/leads/discover
 */

import { NextRequest, NextResponse } from 'next/server';
import { discoverLeads, type SourceType } from '@/lib/lead-discovery/orchestrator';
import { analyzeLeadsBatch } from '@/lib/enrichment/analyze-lead';
import { db, DUMMY_USER_ID, initializeDatabase } from '@/lib/db/client';
import { leads } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
	await initializeDatabase();
	try {
		const body = await request.json();
		const {
			query,
			location,
			type,
			maxResults = 20,
			sources = ['google', 'facebook'], // Por defecto: Google + Facebook
		} = body;

		// Validación
		if (!location) {
			return NextResponse.json({ error: 'Location es requerido' }, { status: 400 });
		}

		if (!type || !['codetix', 'reservaspro'].includes(type)) {
			return NextResponse.json(
				{ error: 'Type debe ser "codetix" o "reservaspro"' },
				{ status: 400 }
			);
		}

		// Validar sources
		const validSources: SourceType[] = ['google', 'instagram', 'linkedin', 'facebook', 'yelp'];
		const sourcesToUse = (sources as SourceType[]).filter((s) =>
			validSources.includes(s)
		);

		if (sourcesToUse.length === 0) {
			return NextResponse.json(
				{ error: 'Debes especificar al menos una fuente válida' },
				{ status: 400 }
			);
		}

		console.log(
			`🔍 Buscando leads para ${type} en ${location} desde fuentes: ${sourcesToUse.join(', ')}`
		);

		// 1. Búsqueda multi-fuente
		const rawLeads = await discoverLeads({
			query: query || (type === 'codetix' ? 'clínicas estéticas' : 'restaurantes'),
			location,
			sources: sourcesToUse,
			maxLeadsPerSource: maxResults,
		});

		console.log(`✅ Encontrados ${rawLeads.length} leads desde ${sourcesToUse.length} fuentes`);

		// 2. Analizar leads con Claude AI
		console.log('🤖 Analizando leads con Claude AI...');
		const analyzedLeads = await analyzeLeadsBatch(
			rawLeads.map((lead) => ({
				company_name: lead.company_name,
				email: lead.email,
				phone: lead.phone,
				website: lead.website,
				location: lead.location || location,
			})),
			type
		);

		console.log('✅ Leads analizados');

		// 3. Guardar en SQLite
		console.log('💾 Guardando en SQLite...');
		const leadsToInsert = analyzedLeads.map((lead, index) => ({
			user_id: DUMMY_USER_ID,
			company_name: lead.company_name,
			email: lead.email || rawLeads[index]?.email || null,
			phone: lead.phone || rawLeads[index]?.phone || null,
			website: lead.website || rawLeads[index]?.website || null,
			type: type as 'codetix' | 'reservaspro',
			score: lead.score,
			status: 'new' as const,
			industry: lead.industry || null,
			location: lead.location || rawLeads[index]?.location || location,
			problem_detected: lead.problem_detected || null,
			insight: lead.insight || null,
			source: rawLeads[index]?.source || 'google',
			sourceData: rawLeads[index]?.sourceData ? JSON.stringify(rawLeads[index].sourceData) : null,
		}));

		const insertedLeads = await db.insert(leads).values(leadsToInsert).returning();

		console.log(`✅ ${insertedLeads.length} leads guardados en SQLite`);

		// Estadísticas por fuente
		const statsBySource: Record<string, number> = {};
		insertedLeads.forEach((lead) => {
			const source = lead.source || 'unknown';
			statsBySource[source] = (statsBySource[source] || 0) + 1;
		});

		return NextResponse.json({
			success: true,
			leads: insertedLeads,
			count: insertedLeads.length,
			stats: {
				total: insertedLeads.length,
				bySources: statsBySource,
			},
		});
	} catch (error) {
		console.error('Error en /api/leads/discover:', error);
		return NextResponse.json(
			{
				error: 'Error descubriendo leads',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
