import { initializeDatabase } from '@/lib/db/client';
import { sendSlackNotification } from './slack-notifier';

export async function sendDailyDigest() {
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { leads, conversations } = await import('@/lib/db/schema');

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// Stats del día
	const allLeads = await db.select().from(leads);
	const todayLeads = allLeads.filter((l) => {
		const leadDate = new Date(l.created_at || 0);
		return leadDate >= today;
	});

	const allConvs = await db.select().from(conversations);
	const todayResponses = allConvs.filter((c) => {
		const convDate = new Date(c.created_at || 0);
		return c.message_received && convDate >= today;
	});

	const todayCalls = allLeads.filter((l) => {
		const updatedDate = new Date(l.updated_at || 0);
		return l.status === 'call_scheduled' && updatedDate >= today;
	});

	await sendSlackNotification({
		type: 'info',
		title: '📊 Daily Digest - LEADMACHINE',
		message: 'Resumen del día',
		data: {
			'Nuevos leads': todayLeads.length,
			Respuestas: todayResponses.length,
			'Calls agendados': todayCalls.length,
			'Total leads': allLeads.length,
		},
		urgency: 'low',
	});
}

