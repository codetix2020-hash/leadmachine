import Anthropic from '@anthropic-ai/sdk';

interface EmailTemplate {
	subject: string;
	body: string;
	cta: string;
}

export async function generatePersonalizedEmail(params: {
	lead: any;
	enrichment: any;
	sequenceStep: number; // 1 = inicial, 2-7 = follow-ups
}): Promise<EmailTemplate> {
	const { lead, enrichment, sequenceStep } = params;

	const claude = new Anthropic({
		apiKey: process.env.ANTHROPIC_API_KEY,
	});

	// Construir contexto para Claude
	const context = `
LEAD INFO:
- Nombre: ${lead.company_name || lead.companyName}
- Ubicación: ${lead.location || 'No especificada'}
- Website: ${lead.website || 'No tiene'}
- Teléfono: ${lead.phone || 'No disponible'}
- Industria: ${lead.industry || 'No especificada'}

ANÁLISIS:
- Producto recomendado: ${enrichment.recommendedProduct || 'No determinado'}
- Probabilidad cierre: ${enrichment.predictiveScores?.closeProbability || 0}%
- Deal size: €${enrichment.predictiveScores?.estimatedDealSize || 0}
- Prioridad: ${enrichment.recommendations?.priority || 'medium'}

ESTRATEGIA:
- Best approach: ${enrichment.recommendations?.bestApproach || 'No especificado'}
- Key talking points: ${enrichment.recommendations?.keyTalkingPoints?.join(', ') || 'Ninguno'}
- Pitch angle: ${enrichment.recommendations?.pitchAngle || 'No especificado'}

PROBLEMAS DETECTADOS:
${enrichment.website?.problems?.join('\n') || 'Ninguno'}

STEP: ${sequenceStep} de 7
`;

	const prompt =
		sequenceStep === 1
			? `Genera EMAIL INICIAL de venta B2B ultra-personalizado.

${context}

REGLAS:
1. Subject line pegadizo (mención específica a su negocio)
2. Primer párrafo: Menciona algo ESPECÍFICO que viste (problema, competidor, review)
3. Segundo párrafo: Beneficio concreto con número (ej: "20% más citas")
4. CTA: Call de 15 min con link calendario
5. Firma: Emiliano - CodeTix
6. Máximo 100 palabras
7. Tono: Directo, sin fluff, enfocado en ROI

Responde JSON (sin markdown):
{
  "subject": "Via Laietana - Sistema de reservas que falta",
  "body": "Hola [Owner],\\n\\nVi tu tienda Shopify...",
  "cta": "¿15 min call esta semana? [LINK]"
}`;
			: `Genera FOLLOW-UP #${sequenceStep - 1} de secuencia de emails.

${context}

FOLLOW-UP STRATEGY por step:
- Step 2 (día 3): Caso de estudio relevante
- Step 3 (día 7): Estadística impactante del sector
- Step 4 (día 14): "Última oportunidad" + descuento
- Step 5 (día 21): Re-engage con nuevo ángulo
- Step 6 (día 30): Video personalizado oferta
- Step 7 (día 45): Breakup email ("Asumo que no es prioridad")

Responde JSON (sin markdown):
{
  "subject": "Re: Sistema de reservas - Caso Barcelona",
  "body": "Quick follow-up...",
  "cta": "Reserva 15 min: [LINK]"
}`;

	const response = await claude.messages.create({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 1000,
		messages: [{ role: 'user', content: prompt }],
	});

	const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

	const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
	const email = JSON.parse(cleaned);

	// Reemplazar [LINK] con Calendly real
	const calendlyLink = 'https://calendly.com/codetix/15min';
	email.body = email.body.replace(/\[LINK\]/g, calendlyLink);
	email.cta = email.cta.replace(/\[LINK\]/g, calendlyLink);

	return email;
}



