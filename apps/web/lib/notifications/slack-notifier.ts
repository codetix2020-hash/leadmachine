const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

interface SlackNotification {
	type: 'lead_hot' | 'response_received' | 'call_scheduled' | 'deal_closed' | 'error' | 'info';
	title: string;
	message: string;
	data?: any;
	urgency: 'low' | 'medium' | 'high' | 'critical';
}

export async function sendSlackNotification(notification: SlackNotification) {
	if (!SLACK_WEBHOOK) {
		console.log('⚠️  Slack webhook not configured');
		return;
	}

	const emoji = getEmoji(notification.type);
	const color = getColor(notification.urgency);

	const payload = {
		text: `${emoji} ${notification.title}`,
		attachments: [
			{
				color,
				text: notification.message,
				fields: notification.data
					? Object.keys(notification.data).map((key) => ({
							title: key,
							value: String(notification.data[key]),
							short: true,
						}))
					: [],
				footer: 'LEADMACHINE',
				ts: Math.floor(Date.now() / 1000),
			},
		],
	};

	try {
		await fetch(SLACK_WEBHOOK, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		console.log('✅ Slack notification sent');
	} catch (error) {
		console.error('❌ Slack notification failed:', error);
	}
}

function getEmoji(type: string): string {
	const emojis: Record<string, string> = {
		lead_hot: '🔥',
		response_received: '📧',
		call_scheduled: '📅',
		deal_closed: '💰',
		error: '❌',
		info: '📢',
	};
	return emojis[type] || '📢';
}

function getColor(urgency: string): string {
	const colors: Record<string, string> = {
		low: '#36a64f',
		medium: '#ffcc00',
		high: '#ff9900',
		critical: '#ff0000',
	};
	return colors[urgency] || '#cccccc';
}

// Helpers específicos
export async function notifyHotLead(lead: any, score: number) {
	await sendSlackNotification({
		type: 'lead_hot',
		title: '🔥 Lead Caliente Detectado',
		message: `${lead.company_name || lead.companyName} - Score: ${score}/100`,
		data: {
			Negocio: lead.company_name || lead.companyName,
			Score: `${score}/100`,
			'Deal estimado': `€${lead.estimatedDealSize || 0}`,
			Ubicación: lead.location || 'N/A',
		},
		urgency: score > 90 ? 'critical' : 'high',
	});
}

export async function notifyResponse(lead: any, sentiment: string) {
	await sendSlackNotification({
		type: 'response_received',
		title: '📧 Lead Respondió',
		message: `${lead.company_name || lead.companyName} - ${sentiment}`,
		data: {
			Negocio: lead.company_name || lead.companyName,
			Sentiment: sentiment,
			Email: lead.email || 'N/A',
		},
		urgency: sentiment === 'interested' ? 'high' : 'medium',
	});
}

export async function notifyCallScheduled(lead: any) {
	await sendSlackNotification({
		type: 'call_scheduled',
		title: '📅 Call Agendado',
		message: `${lead.company_name || lead.companyName} agendó una llamada`,
		data: {
			Negocio: lead.company_name || lead.companyName,
			Email: lead.email || 'N/A',
			Phone: lead.phone || 'N/A',
		},
		urgency: 'critical',
	});
}

export async function notifyDealClosed(lead: any, amount: number) {
	await sendSlackNotification({
		type: 'deal_closed',
		title: '💰 DEAL CERRADO',
		message: `${lead.company_name || lead.companyName} - €${amount}`,
		data: {
			Negocio: lead.company_name || lead.companyName,
			Monto: `€${amount}`,
			Producto: lead.type || 'N/A',
		},
		urgency: 'critical',
	});
}

export async function notifyError(error: any) {
	await sendSlackNotification({
		type: 'error',
		title: '❌ Error del Sistema',
		message: error.message || 'Unknown error',
		data: error.context,
		urgency: 'high',
	});
}

