import { NextResponse } from 'next/server';
import { isTestingMode } from '@/lib/testing/dry-run-mode';
import { sendEmail } from '@/lib/outreach/email-sender';

export async function GET() {
	if (!isTestingMode()) {
		return NextResponse.json({ error: 'Not in testing mode' }, { status: 400 });
	}

	// Simular outreach
	await new Promise((resolve) => setTimeout(resolve, 500));

	const result = await sendEmail({
		to: 'test@leadmachine-internal.com',
		subject: '[TEST] Outreach Test',
		body: 'This is a test email. In testing mode, no email is actually sent.',
		leadId: 'test-lead-123',
	});

	return NextResponse.json({
		success: true,
		message: 'Outreach test passed',
		result,
	});
}

