interface ContactInfo {
	emails: string[]; // Todos los emails encontrados
	primaryEmail?: string;
	confidence: number; // 0-100
	phones: string[];
	whatsappAvailable: boolean;
	linkedinUrl?: string;
	instagramUrl?: string;
	bestContactMethod: 'email' | 'whatsapp' | 'linkedin' | 'phone' | 'instagram' | 'none';
}

export async function findContacts(lead: {
	companyName: string;
	website?: string;
	phone?: string;
	location?: string;
}): Promise<ContactInfo> {
	const contacts: ContactInfo = {
		emails: [],
		phones: lead.phone ? [lead.phone] : [],
		whatsappAvailable: false,
		confidence: 0,
		bestContactMethod: 'none',
	};

	// 1. Buscar emails en website
	if (lead.website) {
		const websiteEmails = await scrapeEmailsFromWebsite(lead.website);
		contacts.emails.push(...websiteEmails);
	}

	// 2. Inferir email desde website
	if (lead.website && contacts.emails.length === 0) {
		const inferredEmails = inferEmailsFromDomain(lead.website, lead.companyName);
		contacts.emails.push(...inferredEmails);
		contacts.confidence = 60; // Inferido, no confirmado
	}

	// 3. WhatsApp detection (España: muchos negocios usan WhatsApp)
	if (lead.phone) {
		// En España, casi todo número es WhatsApp
		contacts.whatsappAvailable = true;
	}

	// 4. Buscar en LinkedIn
	// TODO: Implementar scraping LinkedIn

	// 5. Determinar mejor método
	if (contacts.emails.length > 0) {
		contacts.primaryEmail = contacts.emails[0];
		contacts.bestContactMethod = 'email';
		contacts.confidence = Math.max(contacts.confidence, 80);
	} else if (contacts.whatsappAvailable) {
		contacts.bestContactMethod = 'whatsapp';
		contacts.confidence = 90; // WhatsApp muy confiable en España
	} else if (lead.phone) {
		contacts.bestContactMethod = 'phone';
		contacts.confidence = 70;
	}

	return contacts;
}

async function scrapeEmailsFromWebsite(url: string): Promise<string[]> {
	try {
		const response = await fetch(url, {
			headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
		});
		const html = await response.text();

		// Regex para emails
		const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
		const matches = html.match(emailRegex) || [];

		// Filtrar emails comunes/genéricos y spam
		const filtered = matches.filter(
			(email) =>
				!email.includes('example.com') &&
				!email.includes('domain.com') &&
				!email.includes('wix.com') &&
				!email.includes('sentry.io') &&
				!email.includes('google.com') &&
				!email.includes('facebook.com') &&
				!email.includes('twitter.com')
		);

		// Deduplicar
		return [...new Set(filtered)];
	} catch (error) {
		console.error('Error scraping emails:', error);
		return [];
	}
}

function inferEmailsFromDomain(website: string, companyName: string): string[] {
	try {
		const domain = new URL(website).hostname.replace('www.', '');
		const businessName = companyName
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '')
			.substring(0, 20);

		// Patrones comunes
		return [
			`info@${domain}`,
			`contacto@${domain}`,
			`hola@${domain}`,
			`${businessName}@${domain}`,
			`contact@${domain}`,
		];
	} catch (error) {
		return [];
	}
}
