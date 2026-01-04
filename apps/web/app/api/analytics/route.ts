import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/analytics/aggregator';

export async function GET() {
	try {
		const analytics = await getAnalytics();

		return NextResponse.json({
			success: true,
			analytics,
		});
	} catch (error: any) {
		console.error('Analytics error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

