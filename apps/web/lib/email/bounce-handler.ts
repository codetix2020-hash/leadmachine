import { initializeDatabase } from '@/lib/db/client';

// Tabla para tracking bounces
export async function recordBounce(params: {
	email: string;
	leadId?: string;
	bounceType: 'hard' | 'soft';
	reason: string;
}) {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { leads } = await import('@/lib/db/schema');
	const { eq } = await import('drizzle-orm');

	console.log(`📭 Bounce recorded: ${params.email} (${params.bounceType})`);

	// Si es hard bounce, marcar email como inválido
	if (params.bounceType === 'hard' && params.leadId) {
		await db
			.update(leads)
			.set({
				email: null, // Limpiar email inválido
				status: 'invalid_email' as any,
				updated_at: new Date().toISOString(),
			})
			.where(eq(leads.id, params.leadId));

		console.log(`❌ Email cleared for lead: ${params.leadId}`);
	}

	// Log en conversations
	try {
		const { conversations } = await import('@/lib/db/schema');
		await db.insert(conversations).values({
			id: crypto.randomUUID(),
			lead_id: params.leadId || 'unknown',
			channel: 'email',
			message_sent: `[BOUNCE ${params.bounceType.toUpperCase()}] ${params.reason}`,
			created_at: new Date().toISOString(),
		});
	} catch (e) {
		console.error('Error logging bounce:', e);
	}

	// TODO: Guardar en tabla bounces dedicada
}

