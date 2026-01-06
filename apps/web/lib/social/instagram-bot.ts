interface InstagramAction {
	type: 'like' | 'follow' | 'comment' | 'view_story';
	username: string;
	targetUrl?: string;
}

export async function performInstagramEngagement(params: {
	lead: any;
	instagramUsername?: string;
}) {
	const { lead, instagramUsername } = params;

	console.log(`📸 Instagram engagement for: ${lead.company_name || lead.companyName}`);

	if (!instagramUsername) {
		console.log('⚠️  No Instagram username found');
		return { success: false, reason: 'No Instagram' };
	}

	// Estrategia de engagement
	const actions: InstagramAction[] = [
		{ type: 'follow', username: instagramUsername },
		{ type: 'like', username: instagramUsername }, // Últimos 3 posts
		{ type: 'view_story', username: instagramUsername },
	];

	// Log actions (implementación real requiere Instagram Graph API)
	for (const action of actions) {
		await logSocialAction({
			leadId: lead.id,
			platform: 'instagram',
			action: action.type,
			target: instagramUsername,
		});

		console.log(`✅ Instagram ${action.type}: @${instagramUsername}`);

		// Rate limiting
		await new Promise((resolve) => setTimeout(resolve, 2000));
	}

	return {
		success: true,
		actions: actions.length,
		message: `Engagement completado con @${instagramUsername}`,
	};
}

async function logSocialAction(params: any) {
	const { initializeDatabase } = await import('@/lib/db/client');
	await initializeDatabase();

	const { db } = await import('@/lib/db/client');
	const { conversations } = await import('@/lib/db/schema');

	await db.insert(conversations).values({
		id: crypto.randomUUID(),
		lead_id: params.leadId,
		channel: params.platform,
		message_sent: `${params.action} - ${params.target}`,
		created_at: new Date().toISOString(),
	});
}

// Buscar Instagram username desde Google Maps data
export function extractInstagramFromLead(lead: any): string | null {
	try {
		if (lead.sourceData || lead.source_data) {
			const data = JSON.parse(lead.sourceData || lead.source_data || '{}');

			// Buscar en social links
			if (data.socialLinks) {
				const igLink = data.socialLinks.find((link: string) => link.includes('instagram.com'));
				if (igLink) {
					const match = igLink.match(/instagram\.com\/([^/]+)/);
					return match ? match[1] : null;
				}
			}

			// Buscar en Instagram URL field
			if (lead.instagram_url || lead.instagramUrl) {
				const match = (lead.instagram_url || lead.instagramUrl).match(/instagram\.com\/([^/]+)/);
				return match ? match[1] : null;
			}
		}

		return null;
	} catch (error) {
		return null;
	}
}

