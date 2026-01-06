/**
 * Growth Signals Detector
 * Detecta señales de crecimiento y oportunidades de timing
 */

export interface GrowthSignals {
	isGrowing: boolean;
	signals: Array<{
		type:
			| 'hiring'
			| 'expansion'
			| 'funding'
			| 'partnership'
			| 'award'
			| 'media';
		description: string;
		date?: Date;
		urgency: 'low' | 'medium' | 'high';
	}>;
	urgencyScore: number;
	bestTiming: string;
}

export async function detectGrowthSignals(lead: {
	name: string;
	website?: string;
	linkedin?: string;
	instagram?: string;
}): Promise<GrowthSignals> {
	const signals: any[] = [];

	try {
		// 1. Buscar señales en website
		if (lead.website) {
			try {
				const html = await fetch(lead.website).then((r) => r.text());
				const lowerHtml = html.toLowerCase();

				if (
					lowerHtml.includes('estamos contratando') ||
					lowerHtml.includes('join our team') ||
					lowerHtml.includes('se busca') ||
					lowerHtml.includes('buscamos')
				) {
					signals.push({
						type: 'hiring',
						description: 'Anuncio de contratación en website',
						urgency: 'high',
					});
				}

				if (
					lowerHtml.includes('nuevo local') ||
					lowerHtml.includes('abrimos') ||
					lowerHtml.includes('expanding') ||
					lowerHtml.includes('expansion')
				) {
					signals.push({
						type: 'expansion',
						description: 'Señales de expansión',
						urgency: 'high',
					});
				}
			} catch (e) {
				// Ignorar errores de fetch
			}
		}

		// 2. Calcular urgency score
		const urgencyScore = calculateUrgency(signals);
		const bestTiming = determineBestTiming(signals, urgencyScore);

		return {
			isGrowing: signals.length > 0,
			signals,
			urgencyScore,
			bestTiming,
		};
	} catch (error) {
		console.error('Error detecting growth signals:', error);
		return {
			isGrowing: false,
			signals: [],
			urgencyScore: 0,
			bestTiming: 'Timing normal - contactar cuando sea conveniente',
		};
	}
}

function calculateUrgency(signals: any[]): number {
	if (signals.length === 0) return 30;

	const highUrgencyCount = signals.filter((s) => s.urgency === 'high').length;
	const mediumUrgencyCount = signals.filter(
		(s) => s.urgency === 'medium'
	).length;

	return Math.min(
		100,
		30 + highUrgencyCount * 30 + mediumUrgencyCount * 15
	);
}

function determineBestTiming(signals: any[], urgencyScore: number): string {
	if (urgencyScore >= 70) {
		return 'AHORA - Oportunidad urgente detectada';
	}
	if (urgencyScore >= 50) {
		return 'Esta semana - Señales positivas detectadas';
	}
	if (urgencyScore >= 30) {
		return 'Este mes - Timing adecuado';
	}
	return 'Timing normal - contactar cuando sea conveniente';
}



