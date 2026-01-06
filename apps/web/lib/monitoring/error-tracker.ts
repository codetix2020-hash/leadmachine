import { notifyError } from '@/lib/notifications/slack-notifier';

export async function trackError(error: {
	type: string;
	message: string;
	stack?: string;
	context?: any;
}) {
	console.error('🔴 Error tracked:', error);

	// Log en DB (TODO: tabla errors)

	// Notificar a Slack
	await notifyError(error);
}

export function setupErrorHandlers() {
	// Global error handler
	if (typeof window !== 'undefined') {
		window.addEventListener('error', (event) => {
			trackError({
				type: 'JavaScript Error',
				message: event.message,
				stack: event.error?.stack,
			});
		});

		window.addEventListener('unhandledrejection', (event) => {
			trackError({
				type: 'Unhandled Promise Rejection',
				message: String(event.reason),
			});
		});
	}
}

