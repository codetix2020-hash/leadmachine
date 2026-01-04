/**
 * Competitor Analyzer
 * Analiza competidores cercanos
 */

import { scrapeGoogleMaps } from '@/lib/lead-discovery/sources/google-maps';

export interface CompetitorAnalysis {
	competitors: Array<{
		name: string;
		website?: string;
		advantages: string[];
		weaknesses: string[];
		priceRange?: string;
		rating?: number;
	}>;
	marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
	competitiveAdvantages: string[];
	threats: string[];
	opportunities: string[];
}

export async function analyzeCompetitors(lead: {
	name: string;
	location: string;
	industry?: string;
}): Promise<CompetitorAnalysis> {
	try {
		// 1. Buscar competidores cercanos en Google Maps
		const competitorsData = await scrapeGoogleMaps(
			lead.industry || lead.name,
			lead.location,
			10
		);

		// Filtrar el lead actual
		const competitors = competitorsData
			.filter((c) => c.company_name !== lead.name)
			.slice(0, 5);

		// 2. Análisis con Claude
		const Anthropic = (await import('@anthropic-ai/sdk')).default;
		const claude = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY!,
		});

		const analysis = await claude.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 3000,
			messages: [
				{
					role: 'user',
					content: `Analiza este negocio vs sus competidores:

NEGOCIO TARGET:
${JSON.stringify(lead)}

COMPETIDORES ENCONTRADOS:
${JSON.stringify(competitors)}

Identifica:
1. Qué hacen los competidores mejor
2. Debilidades de los competidores
3. Posición de mercado del target (líder, challenger, seguidor, nicho)
4. Amenazas competitivas
5. Oportunidades para ganar ventaja competitiva

Responde JSON válido:
{
  "competitors": [
    {
      "name": "Nombre competidor",
      "advantages": ["Tienen sistema online", "Más reviews"],
      "weaknesses": ["Precios altos", "Mala ubicación"]
    }
  ],
  "marketPosition": "follower",
  "competitiveAdvantages": ["Mejor ubicación", "Más reviews"],
  "threats": ["Competidor X tiene booking online"],
  "opportunities": ["Ser el primero con app móvil", "Mejorar atención al cliente"]
}`,
				},
			],
		});

		const result = JSON.parse(
			analysis.content[0].type === 'text'
				? analysis.content[0].text
				: JSON.stringify(analysis.content[0])
		);

		return result;
	} catch (error) {
		console.error('Error analyzing competitors:', error);
		return {
			competitors: [],
			marketPosition: 'niche',
			competitiveAdvantages: [],
			threats: [],
			opportunities: [],
		};
	}
}

