import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/client';

export async function GET() {
	const checks = {
		database: false,
		api: false,
		env: false,
	};

	// Check database
	try {
		await initializeDatabase();
		const { db } = await import('@/lib/db/client');
		const { leads } = await import('@/lib/db/schema');
		await db.select().from(leads).limit(1);
		checks.database = true;
	} catch (error) {
		console.error('DB check failed:', error);
	}

	// Check API keys
	checks.env = !!(
		process.env.ANTHROPIC_API_KEY &&
		process.env.GOOGLE_MAPS_API_KEY &&
		process.env.RESEND_API_KEY
	);

	checks.api = true;

	const healthy = Object.values(checks).every((v) => v === true);

	return NextResponse.json(
		{
			healthy,
			checks,
			timestamp: new Date().toISOString(),
		},
		{
			status: healthy ? 200 : 503,
		},
	);
}
