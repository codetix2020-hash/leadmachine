import { isTestingMode } from '@/lib/testing/dry-run-mode';

export async function sendWhatsAppMessage(params: { phone: string; message: string; leadId: string }) {
	// TESTING MODE: No enviar, solo log
	if (isTestingMode()) {
		console.log('🧪 [DRY RUN] WhatsApp would be sent:');
		console.log(`  To: ${params.phone}`);
		console.log(`  Message preview: ${params.message.substring(0, 100)}...`);

		// Guardar en DB para testing
		const { db } = await import('@/lib/db/client');
		const { conversations } = await import('@/lib/db/schema');

		await db.insert(conversations).values({
			id: crypto.randomUUID(),
			lead_id: params.leadId,
			channel: 'whatsapp' as const,
			message_sent: `[DRY RUN] ${params.message}`,
			created_at: new Date().toISOString(),
		});

		return {
			success: true,
			whatsappLink: `https://wa.me/${params.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(params.message)}`,
			method: 'dry-run',
		};
	}

	try {
		// WhatsApp Business API o WhatsApp Web automation

		// OPCIÓN 1: Link directo (manual click)
		const cleanPhone = params.phone.replace(/[^0-9]/g, '');
		const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(params.message)}`;

		console.log('📱 WhatsApp link:', whatsappLink);

		// Guardar en DB
		const { db } = await import('@/lib/db/client');
		const { conversations } = await import('@/lib/db/schema');

		await db.insert(conversations).values({
			id: crypto.randomUUID(),
			lead_id: params.leadId,
			channel: 'whatsapp' as const,
			message_sent: params.message,
			created_at: new Date().toISOString(),
		});

		return {
			success: true,
			whatsappLink,
			method: 'manual', // User clicks link
		};
	} catch (error: any) {
		console.error('WhatsApp error:', error);
		return { success: false, error: error.message };
	}
}



