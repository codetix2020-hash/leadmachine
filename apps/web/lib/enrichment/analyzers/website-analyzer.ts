import Anthropic from '@anthropic-ai/sdk';

interface WebsiteAnalysis {
	hasWebsite: boolean;
	quality: 'none' | 'poor' | 'average' | 'good' | 'excellent';
	hasBookingSystem: boolean;
	hasEcommerce: boolean;
	hasBlog: boolean;
	design: 'outdated' | 'acceptable' | 'modern';
	mobileOptimized: boolean;
	problems: string[];
	opportunities: string[];
	techStack: string[]; // WordPress, Shopify, custom, etc
}

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
	if (!url || !url.startsWith('http')) {
		return {
			hasWebsite: false,
			quality: 'none',
			hasBookingSystem: false,
			hasEcommerce: false,
			hasBlog: false,
			design: 'outdated',
			mobileOptimized: false,
			problems: ['URL inválida o no proporcionada'],
			opportunities: ['Crear website profesional'],
			techStack: [],
		};
	}

	try {
		const response = await fetch(url, {
			headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const html = await response.text();

		// Detectar tech stack básico
		const techStack: string[] = [];
		if (html.includes('wp-content') || html.includes('wordpress')) techStack.push('WordPress');
		if (html.includes('shopify')) techStack.push('Shopify');
		if (html.includes('wix')) techStack.push('Wix');
		if (html.includes('squarespace')) techStack.push('Squarespace');
		if (html.includes('react')) techStack.push('React');
		if (html.includes('next.js')) techStack.push('Next.js');

		const claude = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
		});

		const analysis = await claude.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 1500,
			messages: [
				{
					role: 'user',
					content: `Analiza este website de negocio. Responde SOLO JSON (sin markdown):

HTML (primeros 8000 chars):
${html.substring(0, 8000)}

Tech detectada: ${techStack.join(', ') || 'Desconocida'}

Analiza:
1. Calidad general (poor/average/good/excellent)
2. ¿Tiene sistema de reservas/booking online?
3. ¿Tiene e-commerce/tienda online?
4. ¿Tiene blog/contenido?
5. Diseño (outdated/acceptable/modern)
6. ¿Optimizado para móvil?
7. Problemas principales
8. Oportunidades de mejora (qué software necesitan)

JSON (sin markdown):
{
  "quality": "average",
  "hasBookingSystem": false,
  "hasEcommerce": false,
  "hasBlog": true,
  "design": "acceptable",
  "mobileOptimized": true,
  "problems": [
    "No tiene sistema de reservas online",
    "Checkout process confuso"
  ],
  "opportunities": [
    "Implementar booking system",
    "Optimizar conversión e-commerce"
  ]
}`,
				},
			],
		});

		const text = analysis.content[0].type === 'text' ? analysis.content[0].text : '{}';

		const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
		const result = JSON.parse(cleaned);

		return {
			hasWebsite: true,
			techStack,
			quality: result.quality || 'poor',
			hasBookingSystem: result.hasBookingSystem || false,
			hasEcommerce: result.hasEcommerce || false,
			hasBlog: result.hasBlog || false,
			design: result.design || 'outdated',
			mobileOptimized: result.mobileOptimized || false,
			problems: result.problems || [],
			opportunities: result.opportunities || [],
		};
	} catch (error) {
		console.error('Error analyzing website:', error);
		return {
			hasWebsite: false,
			quality: 'none',
			hasBookingSystem: false,
			hasEcommerce: false,
			hasBlog: false,
			design: 'outdated',
			mobileOptimized: false,
			problems: [`Website no accesible o no existe: ${error instanceof Error ? error.message : 'Unknown error'}`],
			opportunities: ['Crear website profesional'],
			techStack: [],
		};
	}
}
