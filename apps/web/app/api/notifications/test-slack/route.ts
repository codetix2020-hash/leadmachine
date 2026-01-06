import { NextResponse } from 'next/server';
import { sendSlackNotification } from '@/lib/notifications/slack-notifier';

export async function GET() {
	try {
		await sendSlackNotification({
			type: 'lead_hot',
			title: 'Test Notification',
			message: 'LEADMACHINE funcionando correctamente',
			data: {
				Sistema: 'Operativo',
				Timestamp: new Date().toISOString(),
			},
			urgency: 'low',
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

