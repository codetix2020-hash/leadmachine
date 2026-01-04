import { generatePersonalizedEmail } from './email-generator';
import { sendEmail } from './email-sender';
import { sendWhatsAppMessage } from './whatsapp-sender';
import { findContacts } from '@/lib/enrichment/analyzers/contact-finder';

export async function startOutreachSequence(params: { leadId: string; lead: any; enrichment: any }) {
	const { leadId, lead, enrichment } = params;

	console.log(`🚀 Starting outreach for: ${lead.company_name || lead.companyName}`);

	// 1. Buscar/verificar contactos
	const contacts = await findContacts({
		companyName: lead.company_name || lead.companyName || 'Unknown',
		website: lead.website,
		phone: lead.phone,
		location: lead.location,
	});

	console.log('📞 Contact info:', contacts);

	// 2. Determinar mejor canal
	const method = contacts.bestContactMethod;

	if (method === 'none') {
		return {
			success: false,
			error: 'No contact method available',
			suggestion: 'Buscar manualmente en LinkedIn o Google',
			contacts,
		};
	}

	// 3. Generar mensaje personalizado
	const emailContent = await generatePersonalizedEmail({
		lead,
		enrichment,
		sequenceStep: 1,
	});

	// 4. Enviar por el mejor canal
	let result: any;

	if (method === 'email' && contacts.primaryEmail) {
		result = await sendEmail({
			to: contacts.primaryEmail,
			subject: emailContent.subject,
			body: emailContent.body + '\n\n' + emailContent.cta,
			leadId,
		});

		if (result.success) {
			await scheduleFollowUps({ leadId, lead, enrichment, method: 'email' });
			
			// Inicializar secuencia de persistencia completa (90 días)
			try {
				const { initializePersistenceSequence } = await import('@/lib/outreach/persistence-engine');
				await initializePersistenceSequence({ leadId, lead, enrichment });
				console.log(`✅ Persistence sequence initialized for: ${lead.company_name || lead.companyName}`);
			} catch (e) {
				console.error('Error initializing persistence sequence:', e);
			}
		}
	} else if (method === 'whatsapp') {
		// Convertir email a mensaje WhatsApp
		const whatsappMessage = convertEmailToWhatsApp(emailContent);

		result = await sendWhatsAppMessage({
			phone: lead.phone!,
			message: whatsappMessage,
			leadId,
		});

		// Devolver link para que usuario lo envíe manualmente
		result.whatsappLink = result.whatsappLink;
	} else if (method === 'phone') {
		result = {
			success: true,
			method: 'phone',
			phone: lead.phone,
			script: emailContent.body + '\n\n' + emailContent.cta,
			message: 'Llamar manualmente con el script generado',
		};
	}

	return {
		...result,
		contactMethod: method,
		contacts,
	};
}

function convertEmailToWhatsApp(emailContent: any): string {
	// Convertir email formal a mensaje WhatsApp casual
	const body = emailContent.body.replace(/Hola \[Owner\],/g, 'Hola! 👋').replace(/\n\n/g, '\n');

	return `${body}

¿Te interesa una demo de 15 minutos?

Saludos,
Emiliano - CodeTix
https://codetix.com`;
}

async function scheduleFollowUps(params: any) {
	// Crear entradas en outreach_sequences
	const { db } = await import('@/lib/db/client');
	const { outreachSequences } = await import('@/lib/db/schema');

	const followUpDays = [3, 7, 14, 21, 30, 45]; // Días después del inicial
	const method = params.method || 'email';

	for (let i = 0; i < followUpDays.length; i++) {
		const daysFromNow = followUpDays[i];
		const nextDate = new Date();
		nextDate.setDate(nextDate.getDate() + daysFromNow);

		await db.insert(outreachSequences).values({
			id: crypto.randomUUID(),
			lead_id: params.leadId,
			sequence_type: method,
			current_step: i + 2, // Steps 2-7
			next_action_date: nextDate.toISOString(),
			status: 'active' as const,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}

	console.log(`✅ Scheduled ${followUpDays.length} follow-ups`);
}

