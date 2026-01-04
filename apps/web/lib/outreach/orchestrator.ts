import { generatePersonalizedEmail } from './email-generator';
import { sendEmail } from './email-sender';

export async function startOutreachSequence(params: { leadId: string; lead: any; enrichment: any }) {
	const { leadId, lead, enrichment } = params;

	console.log(`🚀 Starting outreach for: ${lead.company_name || lead.companyName}`);

	// Verificar que tiene email
	if (!lead.email) {
		console.log('❌ No email found');
		return { success: false, error: 'No email' };
	}

	// Generar email inicial (step 1)
	const emailContent = await generatePersonalizedEmail({
		lead,
		enrichment,
		sequenceStep: 1,
	});

	// Enviar
	const result = await sendEmail({
		to: lead.email,
		subject: emailContent.subject,
		body: emailContent.body + '\n\n' + emailContent.cta,
		leadId,
	});

	if (result.success) {
		// Programar follow-ups
		await scheduleFollowUps({
			leadId,
			lead,
			enrichment,
		});
	}

	return result;
}

async function scheduleFollowUps(params: any) {
	// Crear entradas en outreach_sequences
	const { db } = await import('@/lib/db/client');
	const { outreach_sequences } = await import('@/lib/db/schema');

	const followUpDays = [3, 7, 14, 21, 30, 45]; // Días después del inicial

	for (let i = 0; i < followUpDays.length; i++) {
		const daysFromNow = followUpDays[i];
		const nextDate = new Date();
		nextDate.setDate(nextDate.getDate() + daysFromNow);

		await db.insert(outreach_sequences).values({
			id: crypto.randomUUID(),
			lead_id: params.leadId,
			sequence_type: 'email',
			current_step: i + 2, // Steps 2-7
			next_action_date: nextDate.toISOString(),
			status: 'active',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}

	console.log(`✅ Scheduled ${followUpDays.length} follow-ups`);
}

