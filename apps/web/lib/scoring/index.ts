// Lead Scoring Library
// Lógica para scoring de leads

export function calculateLeadScore(lead: any) {
	// TODO: Implementar algoritmo de scoring
	// Factores:
	// - Tamaño de empresa
	// - Industria
	// - Engagement
	// - Budget estimado
	// - Pain points detectados
	
	let score = 0;
	
	// Base score por tipo
	if (lead.type === 'codetix') {
		score += 20;
	} else if (lead.type === 'reservaspro') {
		score += 20;
	}
	
	// Score por engagement
	if (lead.email) score += 10;
	if (lead.phone) score += 10;
	if (lead.website) score += 15;
	
	// Score por tamaño
	if (lead.employee_count > 10) score += 20;
	if (lead.employee_count > 50) score += 25;
	
	return Math.min(score, 100);
}

export function getPriority(score: number) {
	if (score >= 80) return 'high';
	if (score >= 50) return 'medium';
	return 'low';
}

