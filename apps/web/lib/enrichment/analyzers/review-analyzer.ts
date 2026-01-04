import Anthropic from '@anthropic-ai/sdk';

interface ReviewAnalysis {
	totalReviews: number;
	averageRating: number;
	sentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
	commonComplaints: Array<{ issue: string; count: number }>;
	commonPraises: Array<{ aspect: string; count: number }>;
	painPoints: string[]; // Problemas que software puede resolver
}

export async function analyzeReviews(reviews: any[]): Promise<ReviewAnalysis> {
	if (!reviews || reviews.length === 0) {
		return {
			totalReviews: 0,
			averageRating: 0,
			sentiment: 'neutral',
			commonComplaints: [],
			commonPraises: [],
			painPoints: [],
		};
	}

	try {
		const claude = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
		});

		const reviewTexts = reviews.slice(0, 30).map((r) => `${r.rating}★: "${r.text}"`).join('\n');

		const analysis = await claude.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 1500,
			messages: [
				{
					role: 'user',
					content: `Analiza estas reviews de clientes. Responde SOLO JSON (sin markdown):

REVIEWS:
${reviewTexts}

Identifica:
1. Sentiment general (very_negative/negative/neutral/positive/very_positive)
2. Quejas más comunes con frecuencia
3. Elogios más comunes
4. Pain points que se pueden resolver con software/tecnología

JSON (sin markdown):
{
  "sentiment": "positive",
  "commonComplaints": [
    {"issue": "Difícil conseguir cita por teléfono", "count": 8},
    {"issue": "Tiempo de espera largo", "count": 5}
  ],
  "commonPraises": [
    {"aspect": "Excelente servicio", "count": 12}
  ],
  "painPoints": [
    "Sistema de reservas online necesario",
    "App para verificar tiempo de espera"
  ]
}`,
				},
			],
		});

		const text = analysis.content[0].type === 'text' ? analysis.content[0].text : '{}';

		const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
		const result = JSON.parse(cleaned);

		const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

		return {
			totalReviews: reviews.length,
			averageRating: Math.round(avgRating * 10) / 10,
			sentiment: result.sentiment || 'neutral',
			commonComplaints: result.commonComplaints || [],
			commonPraises: result.commonPraises || [],
			painPoints: result.painPoints || [],
		};
	} catch (error) {
		console.error('Error analyzing reviews:', error);
		return {
			totalReviews: reviews.length,
			averageRating: 0,
			sentiment: 'neutral',
			commonComplaints: [],
			commonPraises: [],
			painPoints: [],
		};
	}
}
