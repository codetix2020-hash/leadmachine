/**
 * Google Maps Scraper
 * Re-exporta la funcionalidad existente
 */

import {
	searchGoogleMaps,
	findCodetixLeads,
	findReservasproLeads,
} from '../google-maps-scraper';

export interface GoogleMapsLead {
	source: 'google';
	company_name: string;
	location?: string;
	address?: string;
	phone?: string;
	website?: string;
	rating?: number;
	reviewCount?: number;
	placeId?: string;
	types?: string[];
	coordinates?: {
		lat: number;
		lng: number;
	};
}

export async function scrapeGoogleMaps(
	query: string,
	location: string,
	maxResults = 20
): Promise<GoogleMapsLead[]> {
	try {
		const results = await searchGoogleMaps({
			query,
			location,
			maxResults,
		});

		return results.map((result) => ({
			source: 'google' as const,
			company_name: result.name || result.company_name || 'Unknown',
			location: result.location || location,
			address: result.address,
			phone: result.phone,
			website: result.website,
			rating: result.rating,
			reviewCount: result.reviewCount,
			placeId: result.placeId,
			types: result.types,
			coordinates: result.coordinates,
		}));
	} catch (error) {
		console.error('Error scraping Google Maps:', error);
		return [];
	}
}

// Exportar funciones específicas por tipo
export { findCodetixLeads, findReservasproLeads };



