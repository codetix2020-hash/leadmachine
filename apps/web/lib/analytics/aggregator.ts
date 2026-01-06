import { initializeDatabase } from '@/lib/db/client';

export interface DashboardMetrics {
	overview: {
		totalLeads: number;
		contacted: number;
		interested: number;
		callsScheduled: number;
		closed: number;
		conversionRates: {
			leadToContacted: number;
			contactedToInterested: number;
			interestedToCalls: number;
			callsToClosed: number;
		};
	};
	pipeline: {
		totalValue: number; // € total en pipeline
		byStage: {
			new: { count: number; value: number };
			contacted: { count: number; value: number };
			interested: { count: number; value: number };
			callScheduled: { count: number; value: number };
		};
	};
	performance: {
		avgScore: number;
		avgDaysToClose: number;
		topProducts: Array<{ product: string; count: number; revenue: number }>;
	};
	channels: {
		email: { sent: number; opened: number; responded: number };
		whatsapp: { sent: number; responded: number };
		linkedin: { sent: number; responded: number };
	};
	timeline: {
		leadsPerDay: Array<{ date: string; count: number }>;
		revenuePerWeek: Array<{ week: string; amount: number }>;
	};
}

export async function getAnalytics(): Promise<DashboardMetrics> {
	await initializeDatabase();
	
	const { db } = await import('@/lib/db/client');
	const { leads, conversations } = await import('@/lib/db/schema');

	// 1. Overview metrics
	const allLeads = await db.select().from(leads);

	const totalLeads = allLeads.length;
	const contacted = allLeads.filter(
		(l) =>
			l.status === 'contacted' ||
			l.status === 'interested' ||
			l.status === 'call_scheduled' ||
			l.status === 'closed',
	).length;
	const interested = allLeads.filter(
		(l) =>
			l.status === 'interested' ||
			l.status === 'call_scheduled' ||
			l.status === 'closed',
	).length;
	const callsScheduled = allLeads.filter(
		(l) => l.status === 'call_scheduled' || l.status === 'closed',
	).length;
	const closed = allLeads.filter((l) => l.status === 'closed').length;

	// 2. Pipeline value (basado en enrichment data)
	let totalValue = 0;
	const byStage = {
		new: { count: 0, value: 0 },
		contacted: { count: 0, value: 0 },
		interested: { count: 0, value: 0 },
		callScheduled: { count: 0, value: 0 },
	};

	for (const lead of allLeads) {
		let dealValue = 0;

		// Extraer deal size de enrichment
		if (lead.enrichmentData) {
			try {
				const enrichment = JSON.parse(lead.enrichmentData);
				dealValue = enrichment.predictiveScores?.estimatedDealSize || 0;
			} catch (e) {
				// Ignorar errores de parsing
			}
		}

		totalValue += dealValue;

		// Agrupar por stage
		const stage = lead.status || 'new';
		if (stage === 'new' && byStage.new) {
			byStage.new.count++;
			byStage.new.value += dealValue;
		} else if (stage === 'contacted' && byStage.contacted) {
			byStage.contacted.count++;
			byStage.contacted.value += dealValue;
		} else if (stage === 'interested' && byStage.interested) {
			byStage.interested.count++;
			byStage.interested.value += dealValue;
		} else if (stage === 'call_scheduled' && byStage.callScheduled) {
			byStage.callScheduled.count++;
			byStage.callScheduled.value += dealValue;
		}
	}

	// 3. Performance metrics
	const scoresSum = allLeads.reduce((sum, l) => sum + (l.score || 0), 0);
	const avgScore = totalLeads > 0 ? scoresSum / totalLeads : 0;

	// 4. Channel performance
	const allConversations = await db.select().from(conversations);

	const emailSent = allConversations.filter((c) => c.channel === 'email').length;
	const emailResponded = allConversations.filter(
		(c) => c.channel === 'email' && c.message_received,
	).length;

	const whatsappSent = allConversations.filter((c) => c.channel === 'whatsapp').length;
	const whatsappResponded = allConversations.filter(
		(c) => c.channel === 'whatsapp' && c.message_received,
	).length;

	// 5. Timeline data
	const leadsPerDay = calculateLeadsPerDay(allLeads);

	return {
		overview: {
			totalLeads,
			contacted,
			interested,
			callsScheduled,
			closed,
			conversionRates: {
				leadToContacted: totalLeads > 0 ? (contacted / totalLeads) * 100 : 0,
				contactedToInterested: contacted > 0 ? (interested / contacted) * 100 : 0,
				interestedToCalls: interested > 0 ? (callsScheduled / interested) * 100 : 0,
				callsToClosed: callsScheduled > 0 ? (closed / callsScheduled) * 100 : 0,
			},
		},
		pipeline: {
			totalValue,
			byStage,
		},
		performance: {
			avgScore: Math.round(avgScore),
			avgDaysToClose: 45, // TODO: calcular real
			topProducts: calculateTopProducts(allLeads),
		},
		channels: {
			email: {
				sent: emailSent,
				opened: 0, // TODO: tracking
				responded: emailResponded,
			},
			whatsapp: {
				sent: whatsappSent,
				responded: whatsappResponded,
			},
			linkedin: {
				sent: 0,
				responded: 0,
			},
		},
		timeline: {
			leadsPerDay,
			revenuePerWeek: [],
		},
	};
}

function calculateLeadsPerDay(leads: any[]): Array<{ date: string; count: number }> {
	const last7Days: any[] = [];

	for (let i = 6; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split('T')[0];

		const count = leads.filter((l) => {
			const leadDate = new Date(l.created_at || new Date()).toISOString().split('T')[0];
			return leadDate === dateStr;
		}).length;

		last7Days.push({ date: dateStr, count });
	}

	return last7Days;
}

function calculateTopProducts(
	leads: any[],
): Array<{ product: string; count: number; revenue: number }> {
	const products = new Map<string, { count: number; revenue: number }>();

	for (const lead of leads) {
		const product = lead.type || 'unknown';

		let revenue = 0;
		if (lead.enrichmentData) {
			try {
				const enrichment = JSON.parse(lead.enrichmentData);
				revenue = enrichment.predictiveScores?.estimatedDealSize || 0;
			} catch (e) {
				// Ignorar errores de parsing
			}
		}

		if (!products.has(product)) {
			products.set(product, { count: 0, revenue: 0 });
		}

		const current = products.get(product)!;
		current.count++;
		current.revenue += revenue;
	}

	return Array.from(products.entries())
		.map(([product, data]) => ({ product, ...data }))
		.sort((a, b) => b.revenue - a.revenue);
}



