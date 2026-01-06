/**
 * Orchestrator para búsqueda multi-fuente de leads
 * Coordina múltiples scrapers y deduplica resultados
 */

import { scrapeGoogleMaps, type GoogleMapsLead } from './sources/google-maps';
import { scrapeInstagram, type InstagramLead } from './sources/instagram';
import { scrapeLinkedIn, type LinkedInResult } from './sources/linkedin';
import { scrapeFacebook, type FacebookLead } from './sources/facebook';
import { scrapeYelp, type YelpLead } from './sources/yelp';

export type SourceType = 'google' | 'instagram' | 'linkedin' | 'facebook' | 'yelp';

export interface DiscoveryConfig {
	query: string;
	location: string;
	sources: SourceType[];
	maxLeadsPerSource?: number;
}

export interface UnifiedLead {
	source: SourceType;
	company_name: string;
	location?: string;
	phone?: string;
	website?: string;
	email?: string;
	// Datos específicos por fuente
	sourceData?: any;
	// Metadata
	score?: number;
	rating?: number;
	reviewCount?: number;
}

/**
 * Descubrir leads desde múltiples fuentes simultáneamente
 */
export async function discoverLeads(
	config: DiscoveryConfig
): Promise<UnifiedLead[]> {
	const { query, location, sources, maxLeadsPerSource = 20 } = config;

	console.log(
		`🔍 Descubriendo leads desde ${sources.length} fuentes: ${sources.join(', ')}`
	);

	// Ejecutar todas las búsquedas en paralelo
	const results = await Promise.allSettled([
		sources.includes('google')
			? scrapeGoogleMaps(query, location, maxLeadsPerSource)
			: Promise.resolve([]),
		sources.includes('instagram')
			? scrapeInstagram(query, location, maxLeadsPerSource)
			: Promise.resolve([]),
		sources.includes('linkedin')
			? scrapeLinkedIn(query, location, maxLeadsPerSource)
			: Promise.resolve([]),
		sources.includes('facebook')
			? scrapeFacebook(query, location, maxLeadsPerSource)
			: Promise.resolve([]),
		sources.includes('yelp')
			? scrapeYelp(query, location, maxLeadsPerSource)
			: Promise.resolve([]),
	]);

	// Procesar resultados
	const allLeads: UnifiedLead[] = [];

	// Google Maps
	if (sources.includes('google') && results[0].status === 'fulfilled') {
		const googleLeads = results[0].value as GoogleMapsLead[];
		allLeads.push(
			...googleLeads.map((lead) => ({
				source: 'google' as const,
				company_name: lead.company_name,
				location: lead.location || lead.address,
				phone: lead.phone,
				website: lead.website,
				sourceData: lead,
				rating: lead.rating,
				reviewCount: lead.reviewCount,
			}))
		);
	}

	// Instagram
	if (sources.includes('instagram') && results[1].status === 'fulfilled') {
		const instagramLeads = results[1].value as InstagramLead[];
		allLeads.push(
			...instagramLeads.map((lead) => ({
				source: 'instagram' as const,
				company_name: lead.displayName || lead.username,
				location: lead.location,
				phone: lead.contactPhone,
				website: lead.website,
				email: lead.contactEmail,
				sourceData: lead,
			}))
		);
	}

	// LinkedIn
	if (sources.includes('linkedin') && results[2].status === 'fulfilled') {
		const linkedinResult = results[2].value as LinkedInResult;
		// Companies
		allLeads.push(
			...linkedinResult.companies.map((company) => ({
				source: 'linkedin' as const,
				company_name: company.name,
				location: company.location,
				website: company.website,
				sourceData: company,
			}))
		);
		// TODO: Agregar personas como leads separados si es necesario
	}

	// Facebook
	if (sources.includes('facebook') && results[3].status === 'fulfilled') {
		const facebookLeads = results[3].value as FacebookLead[];
		allLeads.push(
			...facebookLeads.map((lead) => ({
				source: 'facebook' as const,
				company_name: lead.name,
				location:
					lead.location &&
					`${lead.location.street || ''}, ${lead.location.city || ''}`.trim(),
				phone: lead.phone,
				website: lead.website,
				email: lead.email,
				sourceData: lead,
				rating: lead.rating,
				reviewCount: lead.reviewCount,
			}))
		);
	}

	// Yelp
	if (sources.includes('yelp') && results[4].status === 'fulfilled') {
		const yelpLeads = results[4].value as YelpLead[];
		allLeads.push(
			...yelpLeads.map((lead) => ({
				source: 'yelp' as const,
				company_name: lead.name,
				location: `${lead.location.address}, ${lead.location.city}`,
				phone: lead.phone,
				website: lead.url,
				sourceData: lead,
				rating: lead.rating,
				reviewCount: lead.reviewCount,
			}))
		);
	}

	// Log errores
	results.forEach((result, index) => {
		if (result.status === 'rejected') {
			const sourceName = ['google', 'instagram', 'linkedin', 'facebook', 'yelp'][
				index
			];
			console.error(`❌ Error en ${sourceName}:`, result.reason);
		}
	});

	// Deduplicar leads
	const uniqueLeads = deduplicateLeads(allLeads);

	console.log(
		`✅ Encontrados ${allLeads.length} leads totales, ${uniqueLeads.length} únicos después de deduplicación`
	);

	return uniqueLeads;
}

/**
 * Deduplicar leads por nombre similar y ubicación
 */
function deduplicateLeads(leads: UnifiedLead[]): UnifiedLead[] {
	const seen = new Map<string, UnifiedLead>();

	for (const lead of leads) {
		// Crear clave única basada en nombre normalizado + ubicación
		const normalizedName = lead.company_name
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]/g, '');
		const normalizedLocation = (lead.location || '')
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]/g, '');

		const key = `${normalizedName}_${normalizedLocation}`;

		if (!seen.has(key)) {
			seen.set(key, lead);
		} else {
			// Si ya existe, merge datos (priorizar fuente con más info)
			const existing = seen.get(key)!;
			const merged = mergeLeadData(existing, lead);
			seen.set(key, merged);
		}
	}

	return Array.from(seen.values());
}

/**
 * Merge datos de dos leads del mismo negocio
 */
function mergeLeadData(lead1: UnifiedLead, lead2: UnifiedLead): UnifiedLead {
	return {
		...lead1,
		// Priorizar datos que existan
		phone: lead1.phone || lead2.phone,
		website: lead1.website || lead2.website,
		email: lead1.email || lead2.email,
		location: lead1.location || lead2.location,
		rating: lead1.rating || lead2.rating,
		reviewCount: lead1.reviewCount || lead2.reviewCount,
		// Mantener sourceData de ambas fuentes
		sourceData: {
			...lead1.sourceData,
			...lead2.sourceData,
			sources: [lead1.source, lead2.source],
		},
	};
}



