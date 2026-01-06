/**
 * Yelp Scraper
 * Buscar negocios en Yelp usando Yelp Fusion API
 */

export interface YelpLead {
	source: 'yelp';
	businessId: string;
	name: string;
	categories: string[];
	location: {
		address: string;
		city: string;
		zipCode: string;
	};
	phone?: string;
	url?: string;
	rating?: number;
	reviewCount?: number;
	price?: string; // $, $$, $$$
	hours?: any;
	photos?: string[];
}

export async function scrapeYelp(
	query: string,
	location: string,
	maxResults = 20
): Promise<YelpLead[]> {
	try {
		const apiKey = process.env.YELP_API_KEY;
		if (!apiKey) {
			console.warn('⚠️ YELP_API_KEY no configurado');
			return [];
		}

		// Yelp Fusion API
		const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&limit=${maxResults}`;

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Yelp API error: ${response.statusText}`);
		}

		const data = await response.json();

		return (data.businesses || []).map((business: any) => ({
			source: 'yelp' as const,
			businessId: business.id,
			name: business.name,
			categories: business.categories?.map((c: any) => c.title) || [],
			location: {
				address: business.location?.address1 || '',
				city: business.location?.city || '',
				zipCode: business.location?.zip_code || '',
			},
			phone: business.phone,
			url: business.url,
			rating: business.rating,
			reviewCount: business.review_count,
			price: business.price,
			hours: business.hours,
			photos: business.photos,
		}));
	} catch (error) {
		console.error('Error scraping Yelp:', error);
		return [];
	}
}



