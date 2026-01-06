import { NextResponse } from 'next/server';
import { isTestingMode } from '@/lib/testing/dry-run-mode';

export async function GET() {
	if (!isTestingMode()) {
		return NextResponse.json({ error: 'Not in testing mode' }, { status: 400 });
	}

	// Simular conversation AI
	await new Promise((resolve) => setTimeout(resolve, 500));

	return NextResponse.json({
		success: true,
		message: 'Conversation AI test passed',
		parsed: {
			sentiment: 'positive',
			intent: 'interested',
			shouldAutoRespond: true,
		},
	});
}

