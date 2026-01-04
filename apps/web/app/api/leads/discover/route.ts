/**
 * API Endpoint: Descubrir Leads
 * POST /api/leads/discover
 */

import { NextRequest, NextResponse } from 'next/server';
import {
	searchGoogleMaps,
	findCodetixLeads,
	findReservasproLeads,
} from '@/lib/lead-discovery/google-maps-scraper';
import { analyzeLeadsBatch } from '@/lib/enrichment/analyze-lead';
import { db, DUMMY_USER_ID } from '@/lib/db/client';
import { leads } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { query, location, type, maxResults = 20 } = body;

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

		console.log(`🔍 Buscando leads para ${type} en ${location}...`);

		// 1. Buscar leads en Google Maps
		let googleLeads;
		if (query) {
			// Búsqueda personalizada
			googleLeads = await searchGoogleMaps({
				query,
				location,
				maxResults,
			});
		} else {
			// Búsqueda predefinida según tipo
			if (type === 'codetix') {
				googleLeads = await findCodetixLeads(location, maxResults);
			} else {
				googleLeads = await findReservasproLeads(location, maxResults);
			}
		}

		console.log(`✅ Encontrados ${googleLeads.length} leads en Google Maps`);

		// 2. Analizar leads con Claude AI
		console.log('🤖 Analizando leads con Claude AI...');
		const analyzedLeads = await analyzeLeadsBatch(googleLeads, type);

		console.log('✅ Leads analizados');

		// 3. Guardar en SQLite
		console.log('💾 Guardando en SQLite...');
		const leadsToInsert = analyzedLeads.map((lead) => ({
			user_id: DUMMY_USER_ID,
			company_name: lead.company_name,
			email: lead.email || null,
			phone: lead.phone || null,
			website: lead.website || null,
			type: type as 'codetix' | 'reservaspro',
			score: lead.score,
			status: 'new' as const,
			industry: lead.industry || null,
			location: lead.location || null,
			problem_detected: lead.problem_detected || null,
			insight: lead.insight || null,
		}));

		const insertedLeads = await db.insert(leads).values(leadsToInsert).returning();

		console.log(`✅ ${insertedLeads.length} leads guardados en SQLite`);

		return NextResponse.json({
			success: true,
			leads: insertedLeads,
			count: insertedLeads.length,
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
