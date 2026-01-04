/**
 * Website Analyzer
 * Analiza profundamente el website del lead
 */

import Anthropic from '@anthropic-ai/sdk';

export interface WebsiteAnalysis {
	hasWebsite: boolean;
	quality: 'none' | 'poor' | 'average' | 'good' | 'excellent';
	technologies: string[];
	hasBookingSystem: boolean;
	hasMobileVersion: boolean;
	loadSpeed: 'slow' | 'medium' | 'fast';
	design: 'outdated' | 'acceptable' | 'modern';
	seoScore: number;
	problems: string[];
	opportunities: string[];
	ctaAnalysis: {
		hasCTA: boolean;
		ctaQuality: string;
		conversionOptimization: number;
	};
}

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
	try {
		// 1. Fetch HTML
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			},
		});
		const html = await response.text();

		// 2. Detectar tech stack
		const technologies = detectTechnologies(html);

		// 3. Análisis básico rápido
		const hasBookingSystem = detectBookingSystem(html);
		const hasMobileVersion = detectMobileVersion(html);

		// 4. Análisis con Claude
		const claude = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY!,
		});

		const analysis = await claude.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 2000,
			messages: [
				{
					role: 'user',
					content: `Analiza este website HTML y devuelve JSON:

HTML (primeros 10000 chars):
${html.substring(0, 10000)}

Analiza:
1. Calidad del diseño (outdated/acceptable/modern)
2. Score SEO básico (0-100) basado en meta tags, estructura, headings
3. Problemas evidentes (ej: "No tiene teléfono visible", "Falta información de contacto")
4. Oportunidades de mejora (ej: "Implementar booking online", "Rediseño moderno")
5. Análisis de CTAs (call-to-actions)
6. Optimización de conversión (0-100)

Responde SOLO JSON válido, sin markdown:
{
  "quality": "poor",
  "design": "outdated",
  "seoScore": 45,
  "problems": ["No tiene sistema de reservas", "Diseño antiguo"],
  "opportunities": ["Implementar booking online", "Rediseño moderno"],
  "ctaAnalysis": {
    "hasCTA": false,
    "ctaQuality": "Falta call-to-action claro",
    "conversionOptimization": 30
  }
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
			hasWebsite: true,
			technologies,
			hasBookingSystem,
			hasMobileVersion,
			loadSpeed: 'medium', // TODO: Calcular con Lighthouse API
			...result,
		};
	} catch (error) {
		console.error('Error analyzing website:', error);
		return {
			hasWebsite: false,
			quality: 'none',
			technologies: [],
			hasBookingSystem: false,
			hasMobileVersion: false,
			loadSpeed: 'slow',
			design: 'outdated',
			seoScore: 0,
			problems: ['Error al analizar website'],
			opportunities: [],
			ctaAnalysis: {
				hasCTA: false,
				ctaQuality: 'No disponible',
				conversionOptimization: 0,
			},
		};
	}
}

function detectTechnologies(html: string): string[] {
	const tech: string[] = [];
	const lowerHtml = html.toLowerCase();

	if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) {
		tech.push('WordPress');
	}
	if (lowerHtml.includes('shopify')) {
		tech.push('Shopify');
	}
	if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixstatic')) {
		tech.push('Wix');
	}
	if (lowerHtml.includes('squarespace')) {
		tech.push('Squarespace');
	}
	if (lowerHtml.includes('react') || lowerHtml.includes('__next')) {
		tech.push('React/Next.js');
	}
	if (lowerHtml.includes('vue')) {
		tech.push('Vue.js');
	}
	if (lowerHtml.includes('angular')) {
		tech.push('Angular');
	}
	if (lowerHtml.includes('laravel')) {
		tech.push('Laravel');
	}
	if (lowerHtml.includes('drupal')) {
		tech.push('Drupal');
	}

	return tech;
}

function detectBookingSystem(html: string): boolean {
	const lowerHtml = html.toLowerCase();
	return (
		lowerHtml.includes('reservar') ||
		lowerHtml.includes('booking') ||
		lowerHtml.includes('cita') ||
		lowerHtml.includes('appointment') ||
		lowerHtml.includes('calendario') ||
		lowerHtml.includes('calendar') ||
		lowerHtml.includes('reserva online') ||
		lowerHtml.includes('online booking')
	);
}

function detectMobileVersion(html: string): boolean {
	const lowerHtml = html.toLowerCase();
	return (
		lowerHtml.includes('viewport') ||
		lowerHtml.includes('responsive') ||
		lowerHtml.includes('mobile') ||
		lowerHtml.includes('@media')
	);
}

