export async function trackError(error: {
	type: string;
	message: string;
	stack?: string;
	context?: any;
}) {
	console.error('🔴 Error tracked:', error);

	// Log en DB
	// TODO: Implementar tabla errors

	// Notificar a Slack si es crítico
	const { sendSlackNotification } = await import('@/lib/notifications/slack-notifier');

	await sendSlackNotification({
		type: 'error',
		title: `Error: ${error.type}`,
		message: error.message,
		data: error.context,
		urgency: 'high',
	});
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

