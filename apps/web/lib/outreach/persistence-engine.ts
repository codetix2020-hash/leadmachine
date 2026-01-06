import { initializeDatabase } from '@/lib/db/client';
import Anthropic from '@anthropic-ai/sdk';

// Secuencia completa de 90 días
const PERSISTENCE_SEQUENCE = [
	// FASE 1: SOFT TOUCH (Días 1-14)
	{ day: 1, channel: 'email', type: 'initial', urgency: 'low' },
	{ day: 2, channel: 'linkedin', type: 'profile_view', urgency: 'low' },
	{ day: 3, channel: 'linkedin', type: 'connection', urgency: 'low' },
	{ day: 4, channel: 'instagram', type: 'like_follow', urgency: 'low' },
	{ day: 5, channel: 'email', type: 'case_study', urgency: 'low' },
	{ day: 7, channel: 'linkedin', type: 'message', urgency: 'low' },
	{ day: 10, channel: 'whatsapp', type: 'initial', urgency: 'low' },
	{ day: 14, channel: 'email', type: 'special_offer', urgency: 'medium' },

	// FASE 2: MEDIUM PRESSURE (Días 15-30)
	{ day: 15, channel: 'linkedin', type: 'inmail', urgency: 'medium' },
	{ day: 17, channel: 'email', type: 'statistic', urgency: 'medium' },
	{ day: 20, channel: 'whatsapp', type: 'followup', urgency: 'medium' },
	{ day: 21, channel: 'instagram', type: 'dm', urgency: 'medium' },
	{ day: 25, channel: 'email', type: 'discount', urgency: 'medium' },
	{ day: 28, channel: 'sms', type: 'reminder', urgency: 'medium' },
	{ day: 30, channel: 'email', type: 'video', urgency: 'medium' },

	// FASE 3: HIGH PRESSURE (Días 31-60)
	{ day: 31, channel: 'email', type: 'urgent_competitor', urgency: 'high' },
	{ day: 35, channel: 'linkedin', type: 'aggressive', urgency: 'high' },
	{ day: 38, channel: 'whatsapp', type: 'competitor_comparison', urgency: 'high' },
	{ day: 42, channel: 'email', type: 'loss_estimation', urgency: 'high' },
	{ day: 45, channel: 'phone', type: 'call', urgency: 'high' },
	{ day: 50, channel: 'email', type: 'breakup', urgency: 'high' },
	{ day: 55, channel: 'linkedin', type: 'last_attempt', urgency: 'high' },
	{ day: 60, channel: 'email', type: 'reengage', urgency: 'medium' },

	// FASE 4: NUCLEAR (Días 61-90)
	{ day: 61, channel: 'linkedin', type: 'contact_ceo', urgency: 'critical' },
	{ day: 65, channel: 'physical_mail', type: 'case_study', urgency: 'critical' },
	{ day: 70, channel: 'linkedin', type: 'ceo_direct', urgency: 'critical' },
	{ day: 75, channel: 'whatsapp', type: 'group_message', urgency: 'critical' },
	{ day: 80, channel: 'email', type: 'irresistible_offer', urgency: 'critical' },
	{ day: 85, channel: 'phone', type: 'final_call', urgency: 'critical' },
	{ day: 90, channel: 'system', type: 'pause_6_months', urgency: 'none' },
];

export async function initializePersistenceSequence(params: {
	leadId: string;
	lead: any;
	enrichment: any;
}) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { outreachSequences } = await import('@/lib/db/schema');

	const { leadId } = params;

	console.log(`🎯 Initializing PERSISTENCE SEQUENCE for: ${params.lead.company_name}`);

	// Crear todas las acciones programadas
	for (const action of PERSISTENCE_SEQUENCE) {
		const executionDate = new Date();
		executionDate.setDate(executionDate.getDate() + action.day);

		await db.insert(outreachSequences).values({
			id: crypto.randomUUID(),
			lead_id: leadId,
			sequence_type: action.channel,
			current_step: action.day,
			next_action_date: executionDate.toISOString(),
			status: 'active',
			metadata: JSON.stringify({
				type: action.type,
				urgency: action.urgency,
			}),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}

	console.log(`✅ ${PERSISTENCE_SEQUENCE.length} acciones programadas`);
}

// Ejecutar acciones pendientes
export async function executePersistenceActions(): Promise<{
	executed: number;
	cancelled: number;
	errors: number;
}> {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { leads, outreachSequences, conversations } = await import('@/lib/db/schema');
	const { eq, and, lte } = await import('drizzle-orm');

	console.log('⚡ Executing persistence actions...');

	const now = new Date();
	let executed = 0;
	let cancelled = 0;
	let errors = 0;

	// Obtener acciones pendientes
	const pending = await db
		.select()
		.from(outreachSequences)
		.where(
			and(
				eq(outreachSequences.status, 'active'),
				lte(outreachSequences.next_action_date, now.toISOString()),
			),
		);

	console.log(`📋 Found ${pending.length} pending actions`);

	for (const action of pending) {
		try {
			// Obtener lead
			const [lead] = await db.select().from(leads).where(eq(leads.id, action.lead_id));

			if (!lead) continue;

			// Si ya respondió o está en call/closed, cancelar secuencia
			if (['interested', 'call_scheduled', 'closed'].includes(lead.status || '')) {
				await db
					.update(outreachSequences)
					.set({ status: 'cancelled', updated_at: new Date().toISOString() })
					.where(eq(outreachSequences.lead_id, lead.id));

				console.log(`✅ Sequence cancelled - lead responded: ${lead.company_name}`);
				cancelled++;
				continue;
			}

			const metadata = JSON.parse(action.metadata || '{}');

			// Ejecutar acción según canal
			await executeAction({
				lead,
				channel: action.sequence_type,
				type: metadata.type,
				urgency: metadata.urgency,
				step: action.current_step,
			});

			// Marcar como completado
			await db
				.update(outreachSequences)
				.set({ status: 'completed', updated_at: new Date().toISOString() })
				.where(eq(outreachSequences.id, action.id));

			console.log(
				`✅ Executed: ${action.sequence_type} - ${metadata.type} for ${lead.company_name}`,
			);
			executed++;
		} catch (error) {
			console.error('❌ Error executing action:', error);
			errors++;
		}
	}

	return { executed, cancelled, errors };
}

async function executeAction(params: {
	lead: any;
	channel: string;
	type: string;
	urgency: string;
	step: number;
}) {
	const { lead, channel, type, urgency } = params;

	let enrichment = null;
	if (lead.enrichmentData) {
		try {
			enrichment = JSON.parse(lead.enrichmentData);
		} catch (e) {
			// Ignorar errores de parsing
		}
	}

	switch (channel) {
		case 'email':
			await sendPersistenceEmail({ lead, enrichment, type, urgency });
			break;

		case 'linkedin':
			await sendLinkedInMessage({ lead, enrichment, type, urgency });
			break;

		case 'whatsapp':
			await sendWhatsAppPersistence({ lead, enrichment, type, urgency });
			break;

		case 'instagram':
			await performInstagramAction({ lead, type });
			break;

		case 'sms':
			await sendSMS({ lead, enrichment, type });
			break;

		case 'phone':
			await logPhoneCallNeeded({ lead, type });
			break;

		case 'physical_mail':
			await logPhysicalMailNeeded({ lead });
			break;

		case 'system':
			await pauseSequence({ lead });
			break;
	}
}

async function sendPersistenceEmail(params: any) {
	const { lead, enrichment, type, urgency } = params;

	const { generatePersonalizedEmail } = await import('@/lib/outreach/email-generator');
	const { sendEmail } = await import('@/lib/outreach/email-sender');

	// Generar email según tipo y urgencia
	const emailContent = await generateUrgentEmail({
		lead,
		enrichment,
		type,
		urgency,
	});

	if (lead.email) {
		await sendEmail({
			to: lead.email,
			subject: emailContent.subject,
			body: emailContent.body,
			leadId: lead.id,
		});
	}
}

async function generateUrgentEmail(params: any): Promise<{ subject: string; body: string }> {
	const { type, urgency, lead, enrichment } = params;

	const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

	let prompt = '';

	switch (type) {
		case 'urgent_competitor':
			prompt = `Genera email URGENTE mencionando que competidor de ${lead.company_name} acaba de implementar sistema similar y está ganando clientes. Tono: urgente pero no desesperado.`;
			break;

		case 'loss_estimation':
			prompt = `Genera email mostrando PÉRDIDA ECONÓMICA estimada por no tener el sistema. Calcular cuánto pierden al mes en no-shows y gestión manual. Tono: data-driven, impactante.`;
			break;

		case 'breakup':
			prompt = `Genera BREAKUP EMAIL - "última oportunidad". Asumir que no están interesados, ofrecer ayudar de otra forma o pedir referidos. Tono: profesional, no insistente.`;
			break;

		case 'irresistible_offer':
			prompt = `Genera oferta IRRESISTIBLE - 50% descuento primer año + setup gratis + garantía 30 días. Solo válida 48 horas. Tono: urgente, limitado.`;
			break;

		case 'statistic':
			prompt = `Genera email con estadística IMPACTANTE del sector (ej: "Negocios con reservas online aumentan ingresos 35%"). Tono: profesional, data-driven.`;
			break;

		case 'discount':
			prompt = `Genera email con DESCUENTO temporal (ej: 30% descuento si implementan esta semana). Tono: urgente pero profesional.`;
			break;

		case 'reengage':
			prompt = `Genera email de RE-ENGAGEMENT después de 60 días. Nuevo ángulo, nuevo valor, nueva propuesta. Tono: fresco, no insistente.`;
			break;

		default:
			prompt = `Genera email personalizado según tipo: ${type}. Urgency: ${urgency}.`;
	}

	const response = await claude.messages.create({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 1000,
		messages: [
			{
				role: 'user',
				content: `${prompt}

Lead: ${lead.company_name}
Deal estimado: €${enrichment?.predictiveScores?.estimatedDealSize || 0}
Urgency level: ${urgency}

Responde JSON (sin markdown):
{
  "subject": "...",
  "body": "..."
}`,
			},
		],
	});

	const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
	const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
	return JSON.parse(cleaned);
}

async function sendLinkedInMessage(params: any) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { conversations } = await import('@/lib/db/schema');

	// TODO: LinkedIn automation con Phantombuster o similar
	console.log('📱 LinkedIn message queued:', params.lead.company_name);

	// Log para revisión manual por ahora
	await db.insert(conversations).values({
		id: crypto.randomUUID(),
		lead_id: params.lead.id,
		channel: 'linkedin',
		message_sent: `[${params.type}] LinkedIn action needed for ${params.lead.company_name}`,
		created_at: new Date().toISOString(),
	});
}

async function sendWhatsAppPersistence(params: any) {
	if (!params.lead.phone) return;

	const { sendWhatsAppMessage } = await import('@/lib/outreach/whatsapp-sender');

	// Generar mensaje WhatsApp según urgencia
	let message = '';

	if (params.urgency === 'high' || params.urgency === 'critical') {
		message = `Hola! 👋 Última oportunidad para ${params.lead.company_name}: tu competencia acaba de implementar sistema de reservas y está captando tus clientes. ¿5 min para mostrarte cómo recuperar ventaja?`;
	} else {
		message = `Hola! Soy Emiliano de CodeTix. Vi ${params.lead.company_name} y tengo algo que te interesará. ¿Te cuento?`;
	}

	await sendWhatsAppMessage({
		phone: params.lead.phone,
		message,
		leadId: params.lead.id,
	});
}

async function performInstagramAction(params: any) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { conversations } = await import('@/lib/db/schema');

	console.log('📸 Instagram action queued:', params.type);

	// Log para revisión manual
	await db.insert(conversations).values({
		id: crypto.randomUUID(),
		lead_id: params.lead.id,
		channel: 'instagram',
		message_sent: `[${params.type}] Instagram action needed for ${params.lead.company_name}`,
		created_at: new Date().toISOString(),
	});
}

async function sendSMS(params: any) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { conversations } = await import('@/lib/db/schema');

	console.log('📱 SMS queued:', params.lead.company_name);

	// TODO: Twilio integration
	// Por ahora solo log
	await db.insert(conversations).values({
		id: crypto.randomUUID(),
		lead_id: params.lead.id,
		channel: 'email', // Usar email como placeholder
		message_sent: `[SMS ${params.type}] SMS queued for ${params.lead.company_name}`,
		created_at: new Date().toISOString(),
	});
}

async function logPhoneCallNeeded(params: any) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { conversations } = await import('@/lib/db/schema');

	console.log('📞 PHONE CALL NEEDED:', params.lead.company_name);

	// Log para usuario manual
	await db.insert(conversations).values({
		id: crypto.randomUUID(),
		lead_id: params.lead.id,
		channel: 'email',
		message_sent: `[PHONE CALL ${params.type}] Llamar manualmente a ${params.lead.company_name} - Tel: ${params.lead.phone || 'N/A'}`,
		created_at: new Date().toISOString(),
	});
}

async function logPhysicalMailNeeded(params: any) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { conversations } = await import('@/lib/db/schema');

	console.log('📮 PHYSICAL MAIL NEEDED:', params.lead.company_name);

	// Log para enviar correo físico
	await db.insert(conversations).values({
		id: crypto.randomUUID(),
		lead_id: params.lead.id,
		channel: 'email',
		message_sent: `[PHYSICAL MAIL] Enviar correo físico con caso de estudio a ${params.lead.company_name} - Dirección: ${params.lead.location || 'N/A'}`,
		created_at: new Date().toISOString(),
	});
}

async function pauseSequence(params: any) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { outreachSequences } = await import('@/lib/db/schema');
	const { eq } = await import('drizzle-orm');

	console.log('⏸️ PAUSING SEQUENCE for 6 months:', params.lead.company_name);

	// Pausar todas las acciones futuras
	await db
		.update(outreachSequences)
		.set({ status: 'paused', updated_at: new Date().toISOString() })
		.where(eq(outreachSequences.lead_id, params.lead.id));
}



