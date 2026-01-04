import { analyzeWebsite } from './analyzers/website-analyzer';
import { analyzeReviews } from './analyzers/review-analyzer';
import Anthropic from '@anthropic-ai/sdk';

export async function deepEnrichLead(lead: any) {
	console.log(`🔍 Deep enriching: ${lead.company_name || lead.companyName}`);

	// 1. Análisis de website
	let websiteAnalysis = null;
	if (lead.website) {
		websiteAnalysis = await analyzeWebsite(lead.website);
	}

	// 2. Análisis de reviews
	let reviewAnalysis = null;
	if (lead.sourceData || lead.source_data) {
		try {
			const sourceData = JSON.parse(lead.sourceData || lead.source_data || '{}');
			if (sourceData.reviews) {
				reviewAnalysis = await analyzeReviews(sourceData.reviews);
			}
		} catch (e) {
			console.error('Error parsing source data:', e);
		}
	}

	// 3. Claude genera análisis maestro (detecta qué vender)
	const masterAnalysis = await generateMasterAnalysis({
		lead,
		website: websiteAnalysis,
		reviews: reviewAnalysis,
	});

	return masterAnalysis;
}

async function generateMasterAnalysis(data: any) {
	const claude = new Anthropic({
		apiKey: process.env.ANTHROPIC_API_KEY,
	});

	const lead = data.lead;

	const response = await claude.messages.create({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 3000,
		messages: [
			{
				role: 'user',
				content: `Eres experto en ventas de software B2B. Analiza este lead y determina QUÉ VENDERLE:

LEAD INFO:
- Nombre: ${lead.company_name || lead.companyName || 'Desconocido'}
- Industria: ${lead.industry || 'No especificada'}
- Ubicación: ${lead.location || 'No especificada'}
- Tipo asignado: ${lead.type || 'reservaspro'}

ANÁLISIS WEBSITE:
${JSON.stringify(data.website, null, 2)}

ANÁLISIS REVIEWS:
${JSON.stringify(data.reviews, null, 2)}

PRODUCTOS DISPONIBLES:
1. **ReservasPro** (€79-149/mes): Sistema de reservas para negocios locales (barberías, clínicas, spas, restaurantes)
2. **CodeTix** (€10k-30k): Desarrollo custom de apps, SaaS, marketplaces para startups/empresas

TASK:
1. Determina QUÉ producto venderle (ReservasPro o CodeTix)
2. Calcula probabilidad de cierre (0-100%)
3. Estima deal size en EUR
4. Días estimados para cerrar
5. Genera estrategia de contacto personalizada

CRITERIOS:
- Si es negocio local pequeño (barbería, spa, clínica, restaurante) → ReservasPro
- Si es startup, empresa tech, e-commerce grande → CodeTix
- Si necesitan booking/reservas → ReservasPro
- Si necesitan app custom, marketplace, SaaS → CodeTix

Responde SOLO JSON (sin markdown):
{
  "recommendedProduct": "reservaspro",
  "productReasoning": "Negocio local con necesidad clara de sistema de reservas",
  "predictiveScores": {
    "closeProbability": 75,
    "estimatedDealSize": 2400,
    "daysToClose": 45
  },
  "recommendations": {
    "priority": "high",
    "bestApproach": "Email personalizado mencionando problema específico detectado en reviews",
    "keyTalkingPoints": [
      "8 clientes mencionan dificultad para reservar cita",
      "Competencia ya tiene sistema online",
      "ROI: Reducir no-shows 40% = €500/mes adicionales"
    ],
    "pitchAngle": "Sistema que resuelve X problema detectado en reviews",
    "bestTiming": "Esta semana - alta actividad detectada",
    "expectedObjections": [
      "Precio - Respuesta: Se paga solo reduciendo no-shows",
      "Ya tenemos agenda papel - Respuesta: Clientes prefieren online"
    ]
  }
}`,
			},
		],
	});

	const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

	const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
	const analysis = JSON.parse(cleaned);

	return {
		website: data.website,
		reviews: data.reviews,
		...analysis,
	};
}
