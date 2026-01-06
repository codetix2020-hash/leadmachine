export function prioritizeLeads(leads: any[]): any[] {
	return leads
		.map((lead) => {
			let priority = lead.score || 50;

			// +20 si tiene email
			if (lead.email) priority += 20;

			// +15 si tiene teléfono (WhatsApp)
			if (lead.phone) priority += 15;

			// +10 si tiene website
			if (lead.website) priority += 10;

			// +30 si tiene enrichment
			if (lead.enrichmentData || lead.enrichment_data) priority += 30;

			return {
				...lead,
				contactability: priority,
			};
		})
		.sort((a, b) => b.contactability - a.contactability);
}



