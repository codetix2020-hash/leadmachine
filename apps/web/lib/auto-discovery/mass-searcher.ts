import { discoverLeads } from '@/lib/lead-discovery/orchestrator';
import { initializeDatabase } from '@/lib/db/client';

// Ciudades España (top 50 por población)
const SPANISH_CITIES = [
	'Madrid',
	'Barcelona',
	'Valencia',
	'Sevilla',
	'Zaragoza',
	'Málaga',
	'Murcia',
	'Palma',
	'Las Palmas',
	'Bilbao',
	'Alicante',
	'Córdoba',
	'Valladolid',
	'Vigo',
	'Gijón',
	'Hospitalet',
	'A Coruña',
	'Vitoria',
	'Granada',
	'Elche',
	'Oviedo',
	'Badalona',
	'Cartagena',
	'Terrassa',
	'Jerez',
	'Sabadell',
	'Santa Cruz',
	'Pamplona',
	'Almería',
	'Fuenlabrada',
	'Leganés',
	'Santander',
	'Burgos',
	'Alcorcón',
	'Getafe',
	'Salamanca',
	'Huelva',
	'Marbella',
	'León',
	'Tarragona',
	'Cádiz',
	'Lleida',
	'Badajoz',
	'Santa Coloma',
	'Donostia',
	'Ourense',
	'Mataró',
	'Jaén',
	'Dos Hermanas',
	'Reus',
];

// Tipos de negocio para ReservasPro
const RESERVASPRO_BUSINESSES = [
	'barberías',
	'peluquerías',
	'centros de estética',
	'clínicas dentales',
	'fisioterapeutas',
	'spas',
	'centros de masaje',
	'clínicas veterinarias',
	'salones de belleza',
	'centros de depilación',
	'gimnasios boutique',
	'estudios de yoga',
	'centros de pilates',
	'clínicas de fisioterapia',
	'tatuadores',
	'estudios de uñas',
];

// Tipos para CodeTix
const CODETIX_BUSINESSES = [
	'startups tecnológicas',
	'agencias digitales',
	'empresas e-commerce',
	'SaaS companies',
	'consultoras tech',
	'empresas fintech',
];

interface DiscoveryStats {
	searches: number;
	leadsFound: number;
	errors: number;
}

export async function runMassDiscovery(): Promise<DiscoveryStats> {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { leads } = await import('@/lib/db/schema');
	const { eq } = await import('drizzle-orm');

	console.log('🚀 Starting MASS DISCOVERY...');

	const stats: DiscoveryStats = {
		searches: 0,
		leadsFound: 0,
		errors: 0,
	};

	// Para cada ciudad (limitado a 10 ciudades por ejecución para no saturar)
	const citiesToSearch = SPANISH_CITIES.slice(0, 10);

	for (const city of citiesToSearch) {
		// Para cada tipo de negocio
		for (const businessType of RESERVASPRO_BUSINESSES) {
			try {
				console.log(`🔍 Searching: ${businessType} in ${city}`);

				const results = await discoverLeads({
					query: businessType,
					location: `${city}, Spain`,
					sources: ['google', 'facebook'],
					maxLeadsPerSource: 20,
				});

				// Guardar leads en DB
				for (const lead of results) {
					// Check si ya existe (por company_name y location)
					const allLeads = await db.select().from(leads);
					const existing = allLeads.filter(
						(l) => l.company_name.toLowerCase() === lead.company_name.toLowerCase(),
					);

					if (existing.length === 0) {
						await db.insert(leads).values({
							id: crypto.randomUUID(),
							user_id: '00000000-0000-0000-0000-000000000000',
							company_name: lead.company_name,
							phone: lead.phone,
							website: lead.website,
							location: lead.location || `${city}, Spain`,
							type: 'reservaspro',
							score: 50, // Análisis profundo después
							status: 'new',
							source: lead.source || 'google',
							sourceData: JSON.stringify(lead.sourceData || lead),
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
						});

						stats.leadsFound++;
					}
				}

				stats.searches++;

				// Rate limiting: esperar 2 segundos entre búsquedas
				await new Promise((resolve) => setTimeout(resolve, 2000));
			} catch (error) {
				console.error(`❌ Error searching ${businessType} in ${city}:`, error);
				stats.errors++;
			}
		}
	}

	console.log('✅ MASS DISCOVERY COMPLETED');
	console.log(`📊 Stats:`, stats);

	return stats;
}

// Auto-enrich nuevos leads
export async function autoEnrichNewLeads(): Promise<{ enriched: number; errors: number }> {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { leads } = await import('@/lib/db/schema');
	const { isNull } = await import('drizzle-orm');

	console.log('🤖 Auto-enriching new leads...');

	let enriched = 0;
	let errors = 0;

	// Obtener leads sin enrichment
	const newLeads = await db
		.select()
		.from(leads)
		.where(isNull(leads.enrichmentData))
		.limit(50); // Procesar 50 por vez

	console.log(`📋 Found ${newLeads.length} leads to enrich`);

	for (const lead of newLeads) {
		try {
			console.log(`🔍 Enriching: ${lead.company_name}`);

			const { deepEnrichLead } = await import('@/lib/enrichment/master-enricher');
			const enrichment = await deepEnrichLead(lead);

			// Guardar
			await db
				.update(leads)
				.set({
					enrichmentData: JSON.stringify(enrichment),
					score: enrichment.predictiveScores?.closeProbability || 50,
					updated_at: new Date().toISOString(),
				})
				.where(eq(leads.id, lead.id));

			console.log(
				`✅ Enriched: ${lead.company_name} (${enrichment.predictiveScores?.closeProbability}%)`,
			);
			enriched++;

			// Rate limiting
			await new Promise((resolve) => setTimeout(resolve, 3000));
		} catch (error) {
			console.error(`❌ Error enriching ${lead.company_name}:`, error);
			errors++;
		}
	}

	return { enriched, errors };
}

// Auto-outreach a leads calificados
export async function autoOutreachQualifiedLeads(): Promise<{
	started: number;
	errors: number;
}> {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { leads } = await import('@/lib/db/schema');
	const { and, gte, eq, isNotNull } = await import('drizzle-orm');

	console.log('📧 Auto-outreach to qualified leads...');

	let started = 0;
	let errors = 0;

	// Leads con score >70 y sin contactar
	const qualified = await db
		.select()
		.from(leads)
		.where(and(gte(leads.score, 70), eq(leads.status, 'new'), isNotNull(leads.enrichmentData)))
		.limit(20); // 20 por ejecución

	console.log(`📋 Found ${qualified.length} qualified leads`);

	for (const lead of qualified) {
		try {
			const enrichment = JSON.parse(lead.enrichmentData!);

			const { startOutreachSequence } = await import('@/lib/outreach/orchestrator');

			await startOutreachSequence({
				leadId: lead.id,
				lead,
				enrichment,
			});

			console.log(`✅ Outreach started: ${lead.company_name}`);
			started++;

			// Rate limiting
			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (error) {
			console.error(`❌ Error outreach ${lead.company_name}:`, error);
			errors++;
		}
	}

	return { started, errors };
}

