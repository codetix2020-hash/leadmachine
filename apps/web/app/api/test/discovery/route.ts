import { NextResponse } from 'next/server';
import { isTestingMode, getTestLead } from '@/lib/testing/dry-run-mode';

export async function GET() {
	if (!isTestingMode()) {
		return NextResponse.json({ error: 'Not in testing mode' }, { status: 400 });
	}

	// Simular discovery
	await new Promise((resolve) => setTimeout(resolve, 500));

	return NextResponse.json({
		success: true,
		message: 'Discovery test passed',
		leads: [getTestLead()],
	});
}

