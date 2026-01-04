import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: { to: string; subject: string; body: string; leadId: string }) {
	try {
		const { data, error } = await resend.emails.send({
			from: 'Emiliano - CodeTix <emiliano@codetix.com>',
			to: params.to,
			subject: params.subject,
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          ${params.body.split('\n').map((p) => `<p>${p}</p>`).join('')}
          
          <br/>
          <p>—<br/>
          <strong>Emiliano</strong><br/>
          Co-founder, CodeTix<br/>
          <a href="https://codetix.com">codetix.com</a>
          </p>
        </div>
      `,
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
		});

		return { success: true, emailId: data?.id };
	} catch (error: any) {
		console.error('❌ Error:', error);
		return { success: false, error: error.message };
	}
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

