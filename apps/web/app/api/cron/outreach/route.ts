import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/client';
import { generatePersonalizedEmail } from '@/lib/outreach/email-generator';
import { sendEmail } from '@/lib/outreach/email-sender';

export async function GET() {
	try {
		await initializeDatabase();

		console.log('⏰ Running outreach cron...');

		const { db } = await import('@/lib/db/client');
		const { outreach_sequences, leads } = await import('@/lib/db/schema');
		const { eq, and, lte } = await import('drizzle-orm');

		// Buscar follow-ups pendientes
		const now = new Date().toISOString();
		const pending = await db
			.select()
			.from(outreach_sequences)
			.where(and(eq(outreach_sequences.status, 'active'), lte(outreach_sequences.next_action_date, now)));

		console.log(`📋 Found ${pending.length} pending follow-ups`);

		for (const sequence of pending) {
			// Obtener lead
			const [lead] = await db.select().from(leads).where(eq(leads.id, sequence.lead_id));

			if (!lead || !lead.email) continue;

			// Obtener enrichment
			let enrichment = null;
			if (lead.enrichmentData || lead.enrichment_data) {
				try {
					enrichment = JSON.parse(lead.enrichmentData || lead.enrichment_data || '{}');
				} catch (e) {
					console.error('Error parsing enrichment');
					continue;
				}
			}

			// Generar email
			const emailContent = await generatePersonalizedEmail({
				lead,
				enrichment,
				sequenceStep: sequence.current_step,
			});

			// Enviar
			await sendEmail({
				to: lead.email,
				subject: emailContent.subject,
				body: emailContent.body + '\n\n' + emailContent.cta,
				leadId: lead.id,
			});

			// Marcar como completado
			await db
				.update(outreach_sequences)
				.set({ status: 'completed', updated_at: new Date().toISOString() })
				.where(eq(outreach_sequences.id, sequence.id));

			console.log(`✅ Sent follow-up step ${sequence.current_step} to ${lead.company_name}`);
		}

		return NextResponse.json({
			success: true,
			processed: pending.length,
		});
	} catch (error: any) {
		console.error('❌ Cron error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

