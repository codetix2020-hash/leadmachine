import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/outreach/email-sender';
import { isTestingMode } from '@/lib/testing/dry-run-mode';

export async function POST() {
	try {
		const result = await sendEmail({
			to: 'test@leadmachine-internal.com',
			subject: '[TEST] Email Deliverability Test',
			body: 'This is a test email to verify deliverability. If you see this in testing mode, it means no email was actually sent.',
			leadId: 'test-email-' + Date.now(),
		});

		return NextResponse.json({
			success: true,
			result,
			mode: isTestingMode() ? 'testing' : 'live',
		});
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

