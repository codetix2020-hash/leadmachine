import { Resend } from 'resend';
import { isTestingMode } from '@/lib/testing/dry-run-mode';
import { verifyEmail } from '@/lib/email/verifier';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: { to: string; subject: string; body: string; leadId: string }) {
	// TESTING MODE: No enviar, solo log
	if (isTestingMode()) {
		console.log('🧪 [DRY RUN] Email would be sent:');
		console.log(`  To: ${params.to}`);
		console.log(`  Subject: ${params.subject}`);
		console.log(`  Body preview: ${params.body.substring(0, 100)}...`);

		// Simular éxito
		await logEmailSent({
			leadId: params.leadId,
			emailId: 'dry-run-' + Date.now(),
			subject: params.subject,
			body: params.body,
		});

		return {
			success: true,
			emailId: 'dry-run-' + Date.now(),
			mode: 'testing',
		};
	}

	// MODO REAL: Enviar de verdad
	try {
		// Verificar email antes de enviar
		const isValid = await verifyEmail(params.to);
		if (!isValid) {
			console.log(`❌ Invalid email, skipping: ${params.to}`);
			return { success: false, error: 'Invalid email' };
		}

		const { data, error } = await resend.emails.send({
			from: 'Emiliano - CodeTix <emiliano@codetix.com>',
			to: params.to,
			subject: params.subject,
			html: formatEmailHTML(params.body),
		});

		if (error) {
			console.error('❌ Error sending email:', error);
			return { success: false, error };
		}

		console.log('✅ Email sent:', data?.id);

		// Guardar en DB que se envió
		await logEmailSent({
			leadId: params.leadId,
			emailId: data?.id,
			subject: params.subject,
			body: params.body,
		});

		return { success: true, emailId: data?.id };
	} catch (error: any) {
		console.error('❌ Error:', error);
		return { success: false, error: error.message };
	}
}

function formatEmailHTML(body: string): string {
	return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${body.split('\n').map((p) => `<p style="margin-bottom: 16px;">${p}</p>`).join('')}
      
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      
      <p style="margin-bottom: 8px;"><strong>Emiliano</strong></p>
      <p style="margin-bottom: 4px; color: #6b7280;">Co-founder, CodeTix</p>
      <p style="margin-bottom: 0;"><a href="https://codetix.com" style="color: #3b82f6;">codetix.com</a></p>
    </div>
  `;
}

async function logEmailSent(params: any) {
	// Guardar en tabla conversations
	const { db } = await import('@/lib/db/client');
	const { conversations } = await import('@/lib/db/schema');

		await db.insert(conversations).values({
			id: crypto.randomUUID(),
			lead_id: params.leadId,
			channel: 'email' as const,
			message_sent: params.body || params.subject, // Guardar body completo si está disponible
			created_at: new Date().toISOString(),
		});
}

