/**
 * Review Analyzer
 * Analiza reviews de Google y otras plataformas
 */

export interface ReviewAnalysis {
	totalReviews: number;
	averageRating: number;
	sentiment:
		| 'very_negative'
		| 'negative'
		| 'neutral'
		| 'positive'
		| 'very_positive';
	commonComplaints: Array<{ issue: string; count: number }>;
	commonPraises: Array<{ aspect: string; count: number }>;
	painPoints: string[];
	recentTrend: 'improving' | 'declining' | 'stable';
	responseRate: number;
	competitorComparison: {
		betterThan: number;
		worseThan: number;
	};
}

export async function analyzeReviews(lead: {
	name: string;
	googlePlaceId?: string;
	rating?: number;
	reviewCount?: number;
}): Promise<ReviewAnalysis> {
	try {
		// TODO: Obtener reviews reales de Google Places API
		// Por ahora usar datos básicos si están disponibles

		const Anthropic = (await import('@anthropic-ai/sdk')).default;
		const claude = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY!,
		});

		// Análisis con Claude basado en datos disponibles
		const analysis = await claude.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 2000,
			messages: [
				{
					role: 'user',
					content: `Analiza las reviews de este negocio:

NEGOCIO: ${lead.name}
RATING: ${lead.rating || 'N/A'} / 5
TOTAL REVIEWS: ${lead.reviewCount || 0}

Basándote en estos datos, identifica:
1. Sentiment global (very_negative/negative/neutral/positive/very_positive)
2. Problemas comunes típicos de negocios similares
3. Pain points que podemos resolver con nuestro producto
4. Tendencia probable (improving/declining/stable)

Responde JSON:
{
  "sentiment": "positive",
  "commonComplaints": [
    {"issue": "Difícil conseguir cita", "count": 5},
    {"issue": "No contestan teléfono", "count": 3}
  ],
  "commonPraises": [
    {"aspect": "Buen servicio", "count": 8},
    {"aspect": "Profesionales", "count": 6}
  ],
  "painPoints": ["Sistema de reservas necesario", "Comunicación deficiente"],
  "recentTrend": "stable"
}`,
				},
			],
		});

		const result = JSON.parse(
			analysis.content[0].type === 'text'
				? analysis.content[0].text
				: JSON.stringify(analysis.content[0])
		);

		return {
			totalReviews: lead.reviewCount || 0,
			averageRating: lead.rating || 0,
			responseRate: 0,
			competitorComparison: {
				betterThan: 50,
				worseThan: 50,
			},
			...result,
		};
	} catch (error) {
		console.error('Error analyzing reviews:', error);
		return {
			totalReviews: 0,
			averageRating: 0,
			sentiment: 'neutral',
			commonComplaints: [],
			commonPraises: [],
			painPoints: [],
			recentTrend: 'stable',
			responseRate: 0,
			competitorComparison: {
				betterThan: 0,
				worseThan: 0,
			},
		};
	}
}

