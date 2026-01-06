import { NextResponse } from 'next/server';
import { parseResponse } from '@/lib/conversation/response-parser';
import { autoRespond } from '@/lib/conversation/auto-responder';
import { initializeDatabase } from '@/lib/db/client';

export async function POST(req: Request) {
	try {
		await initializeDatabase();

		const { db } = await import('@/lib/db/client');
		const { leads, conversations } = await import('@/lib/db/schema');
		const { eq } = await import('drizzle-orm');

		const event = await req.json();

		console.log('📧 Webhook received:', event.type);

		// Manejar bounces
		if (event.type === 'email.bounced') {
			const { recordBounce } = await import('@/lib/email/bounce-handler');
			
			const allLeads = await db.select().from(leads);
			const bouncedEmail = event.data?.to || event.data?.email;
			const lead = allLeads.find((l) => l.email && l.email.toLowerCase() === bouncedEmail?.toLowerCase());

			await recordBounce({
				email: bouncedEmail,
				leadId: lead?.id,
				bounceType: event.data?.bounce_type === 'Permanent' ? 'hard' : 'soft',
				reason: event.data?.bounce_reason || 'Unknown',
			});

			return NextResponse.json({ received: true, handled: 'bounce' });
		}

		// Solo procesar respuestas (replies) de Resend
		// Resend envía eventos como: email.sent, email.delivered, email.bounced, etc
		// Para replies, necesitamos verificar el evento correcto
		if (event.type !== 'email.received') {
			// Puede ser otro tipo de evento, simplemente confirmamos recepción
			return NextResponse.json({ received: true });
		}

		const { from, to, subject, text } = event.data;

		console.log(`📨 Email from: ${from}`);
		console.log(`📝 Subject: ${subject}`);
		console.log(`📄 Text: ${text?.substring(0, 100)}...`);

		// 1. Encontrar lead por email
		// El email puede venir de "from" (remitente) o en el campo correspondiente
		const senderEmail = from?.email || from;

		const allLeads = await db.select().from(leads);
		const lead = allLeads.find((l) => l.email && l.email.toLowerCase() === senderEmail.toLowerCase());

		if (!lead) {
			console.log('❌ Lead not found for:', senderEmail);
			return NextResponse.json({ received: true, message: 'Lead not found' });
		}

		console.log(`✅ Lead found: ${lead.company_name}`);

		// 2. Obtener historial conversación
		const history = await db
			.select()
			.from(conversations)
			.where(eq(conversations.lead_id, lead.id));

		// Ordenar por created_at (puede ser string ISO)
		const sortedHistory = history.sort((a, b) => {
			const dateA = new Date(a.created_at || 0).getTime();
			const dateB = new Date(b.created_at || 0).getTime();
			return dateA - dateB;
		});

		const conversationHistory = sortedHistory.map(
			(c) =>
				`${c.message_sent ? 'Nosotros: ' + c.message_sent : ''}
${c.message_received ? 'Lead: ' + c.message_received : ''}`,
		);

		// 3. Analizar con Claude
		let enrichment = null;
		if (lead.enrichmentData) {
			try {
				enrichment = JSON.parse(lead.enrichmentData);
			} catch (e) {
				// Ignorar errores de parsing
			}
		}

		const parsed = await parseResponse({
			leadMessage: text || '',
			leadContext: {
				companyName: lead.company_name,
				recommendedProduct: enrichment?.recommendedProduct,
				estimatedDealSize: enrichment?.predictiveScores?.estimatedDealSize,
			},
			conversationHistory,
		});

		console.log('🤖 Parsed response:', parsed);

		// Notificar respuesta a Slack
		try {
			const { notifyResponse } = await import('@/lib/notifications/slack-notifier');
			await notifyResponse(lead, parsed.sentiment || 'neutral');
		} catch (e) {
			console.error('Error notifying Slack:', e);
		}

		// 4. Auto-responder si procede
		if (parsed.shouldAutoRespond) {
			await autoRespond({
				leadId: lead.id,
				parsedResponse: parsed,
				originalMessage: text || '',
			});

			console.log('✅ Auto-responded');
		} else {
			console.log('⏸️  Waiting for human intervention');

			// Guardar respuesta sin auto-responder
			await db.insert(conversations).values({
				id: crypto.randomUUID(),
				lead_id: lead.id,
				channel: 'email',
				message_sent: '', // No se envió respuesta automática
				message_received: text || '',
				sentiment: parsed.sentiment,
				created_at: new Date().toISOString(),
			});
		}

		return NextResponse.json({ received: true, parsed });
	} catch (error: any) {
		console.error('❌ Webhook error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}



