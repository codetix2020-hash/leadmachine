import { sendEmail } from '@/lib/outreach/email-sender';
import { initializeDatabase } from '@/lib/db/client';

export async function autoRespond(params: {
	leadId: string;
	parsedResponse: any;
	originalMessage: string;
}) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { leads, conversations } = await import('@/lib/db/schema');
	const { eq } = await import('drizzle-orm');

	const { leadId, parsedResponse, originalMessage } = params;

	console.log(`🤖 Auto-responding to lead ${leadId}`);

	// 1. Obtener lead de DB
	const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));

	if (!lead || !lead.email) {
		console.log('❌ Lead not found or no email');
		return { success: false };
	}

	// 2. Determinar qué enviar
	let subject = '';
	let body = parsedResponse.suggestedResponse || '';

	switch (parsedResponse.suggestedAction) {
		case 'send_pricing':
			subject = 'Re: Precios ReservasPro';
			body = generatePricingEmail(lead, parsedResponse);
			break;

		case 'send_case_study':
			subject = 'Re: Caso de éxito - Barberías Barcelona';
			body = generateCaseStudyEmail(lead);
			break;

		case 'schedule_call':
			subject = 'Re: Agenda tu demo';
			body = generateSchedulingEmail(lead);
			break;

		case 'answer_question':
			subject = 'Re: Tu pregunta sobre ReservasPro';
			// Ya viene en suggestedResponse
			break;

		case 'ask_referral':
			subject = 'Re: Gracias por tu tiempo';
			body = generateReferralEmail(lead);
			break;

		default:
			// Usar suggested response tal cual
			subject = 'Re: ' + (lead.company_name || 'Lead');
	}

	// 3. Enviar email
	await sendEmail({
		to: lead.email,
		subject,
		body,
		leadId,
	});

	// 4. Actualizar status del lead
	await updateLeadStatus(leadId, parsedResponse.sentiment);

	// 5. Guardar en conversaciones (mensaje recibido + enviado)
	await db.insert(conversations).values({
		id: crypto.randomUUID(),
		lead_id: leadId,
		channel: 'email',
		message_sent: body,
		message_received: originalMessage,
		sentiment: parsedResponse.sentiment,
		created_at: new Date().toISOString(),
	});

	return { success: true };
}

function generatePricingEmail(lead: any, parsed: any): string {
	return `Hola,

Gracias por tu interés! Para ${lead.company_name}:

**ReservasPro - Planes:**

🔹 Plan Básico - €79/mes
- Sistema de reservas online
- Calendario integrado
- Recordatorios automáticos
- Panel de control

🔹 Plan Pro - €129/mes (Recomendado)
- Todo lo del Básico +
- Multi-sede
- Reportes avanzados
- Integración WhatsApp
- Soporte prioritario

**ROI Típico:**
Reducción no-shows 40% = €400-800/mes adicionales
Inversión se recupera en 2-3 semanas.

¿Te parece si agendamos 15 minutos para mostrarte el sistema?

👉 Agenda aquí: https://calendly.com/codetix/15min

Saludos,
Emiliano - CodeTix`;
}

function generateCaseStudyEmail(lead: any): string {
	return `Hola,

Perfecto! Te comparto un caso real de Barcelona:

**Sharp Blendz Barbershop (Ciutat Vella)**
Antes: Agenda en papel, 30% no-shows
Después: ReservasPro implementado

Resultados en 60 días:
✅ No-shows bajaron a 8% (ahorro €600/mes)
✅ Bookings online: 65% de total citas
✅ Tiempo en teléfono: -70%
✅ ROI: 450%

Similar a ${lead.company_name}, tenían el mismo desafío de gestión de citas.

¿Quieres ver cómo funcionaría para ti?
👉 https://calendly.com/codetix/15min

Saludos,
Emiliano`;
}

function generateSchedulingEmail(lead: any): string {
	return `Perfecto!

Tengo disponibilidad esta semana para mostrarte:
- Demo del sistema (5 min)
- Cómo funcionaría para ${lead.company_name} (5 min)
- ROI estimado para tu caso (5 min)

Total: 15 minutos.

Agenda el mejor horario para ti:
👉 https://calendly.com/codetix/15min

Nos vemos pronto!

Saludos,
Emiliano - CodeTix`;
}

function generateReferralEmail(lead: any): string {
	return `Hola,

Entiendo que ahora no es el momento, sin problema.

Rápida pregunta: ¿Conoces alguna barbería/spa/clínica que sí esté buscando optimizar reservas?

Estaría agradecido por la introducción 🙏

De todas formas, aquí estoy si en el futuro ${lead.company_name} necesita algo.

Saludos,
Emiliano - CodeTix`;
}

async function updateLeadStatus(leadId: string, sentiment: string) {
	const { db } = await import('@/lib/db/client');
	const { leads } = await import('@/lib/db/schema');
	const { eq } = await import('drizzle-orm');

	let newStatus = 'new';

	if (sentiment === 'interested') {
		newStatus = 'interested';
	} else if (sentiment === 'not_interested') {
		newStatus = 'lost';
	} else if (sentiment === 'not_now') {
		newStatus = 'contacted'; // Mantener contacted para poder re-contactar
	}

	await db
		.update(leads)
		.set({ status: newStatus, updated_at: new Date().toISOString() })
		.where(eq(leads.id, leadId));
}

