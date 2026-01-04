/**
 * Master Enricher
 * Orquesta todos los analizadores y genera análisis completo con IA
 */

import { analyzeWebsite } from './analyzers/website-analyzer';
import { analyzeSocialMedia } from './analyzers/social-analyzer';
import { analyzeCompetitors } from './analyzers/competitor-analyzer';
import { analyzeReviews } from './analyzers/review-analyzer';
import { detectGrowthSignals } from './analyzers/growth-signals';
import { findContacts } from './analyzers/contact-finder';
import Anthropic from '@anthropic-ai/sdk';

export interface DeepEnrichment {
	// Análisis básico (existente)
	basicScore: number;
	basicProblem: string;
	basicInsight: string;

	// Análisis profundo
	website?: any;
	social?: any;
	competitors?: any;
	reviews?: any;
	growthSignals?: any;
	contacts?: any;

	// Scores predictivos
	predictiveScores: {
		closeProbability: number;
		estimatedDealSize: number;
		daysToClose: number;
		churnRisk: number;
	};

	// Recomendaciones
	recommendations: {
		priority: 'low' | 'medium' | 'high' | 'urgent';
		bestApproach: string;
		keyTalkingPoints: string[];
		objectionsPredicted: string[];
		bestTiming: string;
	};
}

export async function deepEnrichLead(lead: any): Promise<DeepEnrichment> {
	console.log(`🔍 Deep enriching: ${lead.company_name || lead.name}`);

	// Ejecutar todos los análisis en paralelo
	const [
		website,
		social,
		competitors,
		reviews,
		growthSignals,
		contacts,
	] = await Promise.allSettled([
		lead.website ? analyzeWebsite(lead.website) : Promise.resolve(null),
		analyzeSocialMedia({
			name: lead.company_name || lead.name,
			instagram: lead.instagram_url,
			facebook: undefined,
			linkedin: lead.linkedin_url,
		}),
		analyzeCompetitors({
			name: lead.company_name || lead.name,
			location: lead.location || '',
			industry: lead.industry,
		}),
		analyzeReviews({
			name: lead.company_name || lead.name,
			rating: undefined,
			reviewCount: undefined,
		}),
		detectGrowthSignals({
			name: lead.company_name || lead.name,
			website: lead.website,
			linkedin: lead.linkedin_url,
			instagram: lead.instagram_url,
		}),
		findContacts({
			name: lead.company_name || lead.name,
			website: lead.website,
			linkedin: lead.linkedin_url,
			email: lead.email,
			phone: lead.phone,
		}),
	]);

	// Preparar datos para análisis maestro
	const analysisData = {
		lead: {
			name: lead.company_name || lead.name,
			location: lead.location,
			industry: lead.industry,
			type: lead.type,
			score: lead.score,
			problem: lead.problem_detected,
			insight: lead.insight,
		},
		website: website.status === 'fulfilled' ? website.value : null,
		social: social.status === 'fulfilled' ? social.value : null,
		competitors: competitors.status === 'fulfilled' ? competitors.value : null,
		reviews: reviews.status === 'fulfilled' ? reviews.value : null,
		growthSignals:
			growthSignals.status === 'fulfilled' ? growthSignals.value : null,
		contacts: contacts.status === 'fulfilled' ? contacts.value : null,
	};

	// Generar análisis maestro con Claude
	const masterAnalysis = await generateMasterAnalysis(analysisData);

	return {
		basicScore: lead.score || 0,
		basicProblem: lead.problem_detected || '',
		basicInsight: lead.insight || '',
		website: analysisData.website,
		social: analysisData.social,
		competitors: analysisData.competitors,
		reviews: analysisData.reviews,
		growthSignals: analysisData.growthSignals,
		contacts: analysisData.contacts,
		...masterAnalysis,
	};
}

async function generateMasterAnalysis(data: any) {
	const claude = new Anthropic({
		apiKey: process.env.ANTHROPIC_API_KEY!,
	});

	const response = await claude.messages.create({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 4000,
		messages: [
			{
				role: 'user',
				content: `Eres un experto en ventas B2B. Analiza este lead completamente:

LEAD INFO:
${JSON.stringify(data.lead)}

ANÁLISIS WEBSITE:
${JSON.stringify(data.website)}

ANÁLISIS SOCIAL:
${JSON.stringify(data.social)}

COMPETIDORES:
${JSON.stringify(data.competitors)}

REVIEWS:
${JSON.stringify(data.reviews)}

SEÑALES DE CRECIMIENTO:
${JSON.stringify(data.growthSignals)}

CONTACTOS:
${JSON.stringify(data.contacts)}

Basándote en TODO esto, genera:

1. PROBABILIDAD DE CIERRE (0-100%):
   - Considera: necesidad detectada, presupuesto estimado, timing, pain points
   
2. TAMAÑO ESTIMADO DEL DEAL (EUR):
   - Producto: ${data.lead.type === 'codetix' ? 'CodeTix (sistema de citas médicas)' : 'ReservasPro (sistema de reservas restaurantes)'}
   - Basado en tamaño empresa, industria, ubicación
   
3. DÍAS ESTIMADOS PARA CERRAR:
   - Urgencia detectada
   - Complejidad de venta
   
4. CHURN RISK (0-100):
   - Probabilidad de que cancelen después de comprar
   
5. PRIORIDAD (low/medium/high/urgent):
   - Combina probabilidad + deal size + timing
   
6. MEJOR APPROACH:
   - Email/LinkedIn/Teléfono
   - Qué mencionar específicamente
   - Angle de entrada
   
7. KEY TALKING POINTS:
   - 3-5 puntos clave para el pitch
   - Basados en sus pain points reales
   
8. OBJECIONES PREDECIBLES:
   - Qué dirán probablemente
   - Cómo responder
   
9. BEST TIMING:
   - Cuándo contactar
   - Por qué

Responde SOLO JSON válido, sin markdown:
{
  "predictiveScores": {
    "closeProbability": 75,
    "estimatedDealSize": 2400,
    "daysToClose": 45,
    "churnRisk": 20
  },
  "recommendations": {
    "priority": "high",
    "bestApproach": "Email personalizado mencionando que...",
    "keyTalkingPoints": ["Punto 1", "Punto 2", "Punto 3"],
    "objectionsPredicted": ["Muy caro", "Ya tenemos algo"],
    "bestTiming": "Esta semana - están contratando"
  }
}`,
			},
		],
	});

	try {
		const analysis = JSON.parse(
			response.content[0].type === 'text'
				? response.content[0].text
				: JSON.stringify(response.content[0])
		);
		return analysis;
	} catch (error) {
		console.error('Error parsing Claude response:', error);
		// Retornar valores por defecto
		return {
			predictiveScores: {
				closeProbability: 50,
				estimatedDealSize: 2000,
				daysToClose: 60,
				churnRisk: 30,
			},
			recommendations: {
				priority: 'medium',
				bestApproach: 'Contactar por email con propuesta personalizada',
				keyTalkingPoints: [
					'Solucionar problema detectado',
					'Mejorar eficiencia operativa',
				],
				objectionsPredicted: ['Precio', 'Ya tenemos sistema'],
				bestTiming: 'Esta semana',
			},
		};
	}
}

