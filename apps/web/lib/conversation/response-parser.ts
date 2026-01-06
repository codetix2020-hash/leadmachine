import Anthropic from '@anthropic-ai/sdk';

export interface ParsedResponse {
	sentiment: 'interested' | 'needs_info' | 'not_interested' | 'not_now' | 'objection';
	intent: string; // "wants_pricing", "wants_demo", "has_objection", etc
	urgency: 'high' | 'medium' | 'low';
	keyPoints: string[]; // Puntos clave mencionados
	suggestedAction:
		| 'send_pricing'
		| 'send_case_study'
		| 'schedule_call'
		| 'answer_question'
		| 'ask_referral';
	shouldAutoRespond: boolean;
	suggestedResponse?: string;
}

export async function parseResponse(params: {
	leadMessage: string;
	leadContext: any; // Info del lead
	conversationHistory: string[];
}): Promise<ParsedResponse> {
	const claude = new Anthropic({
		apiKey: process.env.ANTHROPIC_API_KEY,
	});

	const response = await claude.messages.create({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 2000,
		messages: [
			{
				role: 'user',
				content: `Eres experto en ventas B2B. Analiza esta respuesta de un lead:

LEAD INFO:
- Negocio: ${params.leadContext.companyName}
- Producto ofrecido: ${params.leadContext.recommendedProduct || 'ReservasPro'}
- Deal estimado: €${params.leadContext.estimatedDealSize || 0}

HISTORIAL CONVERSACIÓN:
${params.conversationHistory.join('\n')}

MENSAJE NUEVO DEL LEAD:
"${params.leadMessage}"

ANALIZA:
1. Sentiment (interested/needs_info/not_interested/not_now/objection)
2. Intent (qué quiere específicamente)
3. Urgency (high/medium/low)
4. Key points mencionados
5. Suggested action (qué hacer ahora)
6. Si deberíamos responder automático o esperar intervención humana
7. Si auto-respond = true, genera la respuesta perfecta

REGLAS RESPUESTA AUTOMÁTICA:
- Interested → Enviar case study + link calendario
- Needs pricing → Enviar precios + ROI
- Has question → Responder pregunta específica
- Objection → Manejar objeción con data
- Not interested → Agradecer + pedir referidos
- Not now → Preguntar cuándo re-contactar

Responde JSON (sin markdown):
{
  "sentiment": "interested",
  "intent": "wants_demo",
  "urgency": "high",
  "keyPoints": ["Interesado en sistema", "Quiere ver demo primero"],
  "suggestedAction": "schedule_call",
  "shouldAutoRespond": true,
  "suggestedResponse": "Perfecto! Tengo disponibilidad esta semana..."
}`,
			},
		],
	});

	const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

	const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
	return JSON.parse(cleaned);
}



