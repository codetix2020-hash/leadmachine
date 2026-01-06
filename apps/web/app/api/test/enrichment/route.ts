import { NextResponse } from 'next/server';
import { isTestingMode, getTestLead } from '@/lib/testing/dry-run-mode';

export async function GET() {
	if (!isTestingMode()) {
		return NextResponse.json({ error: 'Not in testing mode' }, { status: 400 });
	}

	// Simular enrichment
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const testLead = getTestLead();
	const enrichment = testLead ? JSON.parse(testLead.enrichmentData || '{}') : null;

	return NextResponse.json({
		success: true,
		message: 'Enrichment test passed',
		enrichment,
	});
}

