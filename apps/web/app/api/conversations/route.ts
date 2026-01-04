import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/client';

export async function GET() {
	try {
		await initializeDatabase();

		const { db } = await import('@/lib/db/client');
		const { conversations, leads } = await import('@/lib/db/schema');
		const { eq } = await import('drizzle-orm');

		const allConvs = await db.select().from(conversations);

		// Ordenar por created_at
		const sortedConvs = allConvs.sort((a, b) => {
			const dateA = new Date(a.created_at || 0).getTime();
			const dateB = new Date(b.created_at || 0).getTime();
			return dateB - dateA; // Más recientes primero
		});

		// Enriquecer con nombre del lead
		const enriched = await Promise.all(
			sortedConvs.map(async (conv) => {
				const [lead] = await db.select().from(leads).where(eq(leads.id, conv.lead_id));

				return {
					...conv,
					leadId: conv.lead_id, // Agregar alias camelCase
					leadName: lead?.company_name || 'Unknown',
					messageSent: conv.message_sent, // Alias
					messageReceived: conv.message_received, // Alias
					createdAt: conv.created_at, // Alias
				};
			}),
		);

		return NextResponse.json({
			success: true,
			conversations: enriched,
		});
	} catch (error: any) {
		console.error('Error fetching conversations:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

