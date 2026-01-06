import { NextResponse } from 'next/server';
import { runMassDiscovery, autoEnrichNewLeads, autoOutreachQualifiedLeads } from '@/lib/auto-discovery/mass-searcher';
import { executePersistenceActions } from '@/lib/outreach/persistence-engine';

export async function GET() {
	try {
		console.log('⏰ MASTER CRON RUNNING...');

		const results = {
			timestamp: new Date().toISOString(),
			discovery: null as any,
			enrichment: null as any,
			outreach: null as any,
			persistence: null as any,
		};

		const hour = new Date().getHours();

		// 1. Mass Discovery (cada 6 horas)
		if (hour % 6 === 0) {
			console.log('🔍 Running mass discovery...');
			results.discovery = await runMassDiscovery();
		}

		// 2. Auto-enrich leads (cada 2 horas)
		if (hour % 2 === 0) {
			console.log('🤖 Auto-enriching leads...');
			results.enrichment = await autoEnrichNewLeads();
		}

		// 3. Auto-outreach qualified leads (cada 4 horas)
		if (hour % 4 === 0) {
			console.log('📧 Auto-outreach...');
			results.outreach = await autoOutreachQualifiedLeads();
		}

		// 4. Execute persistence actions (cada hora)
		console.log('⚡ Executing persistence...');
		results.persistence = await executePersistenceActions();

		// 5. Daily digest a las 9am
		if (hour === 9) {
			console.log('📊 Sending daily digest...');
			const { sendDailyDigest } = await import('@/lib/notifications/daily-digest');
			await sendDailyDigest();
			results.digest = 'sent';
		}

		console.log('✅ MASTER CRON COMPLETED');

		return NextResponse.json({
			success: true,
			results,
		});
	} catch (error: any) {
		console.error('❌ CRON ERROR:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}



