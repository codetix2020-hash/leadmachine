/**
 * Contact Finder
 * Encuentra información de contacto y decision makers
 */

export interface ContactInfo {
	decisionMaker?: {
		name: string;
		title: string;
		linkedinUrl?: string;
		email?: string;
		phone?: string;
		confidence: number;
	};
	alternativeContacts: Array<{
		name: string;
		role: string;
		email?: string;
		linkedinUrl?: string;
	}>;
	genericEmails: string[];
	phones: string[];
	bestContactMethod: 'email' | 'linkedin' | 'phone' | 'instagram';
}

export async function findContacts(lead: {
	name: string;
	website?: string;
	linkedin?: string;
	email?: string;
	phone?: string;
}): Promise<ContactInfo> {
	const contacts: ContactInfo = {
		alternativeContacts: [],
		genericEmails: [],
		phones: [],
		bestContactMethod: 'email',
	};

	try {
		// 1. Scraping website para emails y teléfonos
		if (lead.website) {
			try {
				const html = await fetch(lead.website).then((r) => r.text());
				contacts.genericEmails = extractEmails(html);
				contacts.phones = extractPhones(html);
			} catch (e) {
				// Ignorar errores
			}
		}

		// 2. Usar datos existentes
		if (lead.email) {
			contacts.genericEmails.push(lead.email);
		}
		if (lead.phone) {
			contacts.phones.push(lead.phone);
		}

		// 3. Intentar inferir email de decision maker
		if (lead.website && contacts.genericEmails.length === 0) {
			const inferred = inferEmail(lead.name, lead.website);
			if (inferred) {
				contacts.genericEmails.push(inferred);
			}
		}

		// 4. Determinar mejor método de contacto
		contacts.bestContactMethod = determineBestMethod(contacts);

		return contacts;
	} catch (error) {
		console.error('Error finding contacts:', error);
		return contacts;
	}
}

function extractEmails(html: string): string[] {
	const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
	const emails = html.match(emailRegex) || [];
	return [...new Set(emails)]; // Eliminar duplicados
}

function extractPhones(html: string): string[] {
	const phoneRegex = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/g;
	const phones = html.match(phoneRegex) || [];
	return [...new Set(phones)]; // Eliminar duplicados
}

function inferEmail(name: string, website: string): string | undefined {
	try {
		const domain = new URL(website).hostname.replace('www.', '');
		const [firstName, ...lastNameParts] = name.toLowerCase().split(' ');
		const lastName = lastNameParts.join('');

		// Probar combinaciones comunes
		const possibilities = [
			`${firstName}@${domain}`,
			`${firstName}.${lastName}@${domain}`,
			`${firstName[0]}${lastName}@${domain}`,
			`${firstName}${lastName[0]}@${domain}`,
			`info@${domain}`,
			`contacto@${domain}`,
			`contact@${domain}`,
		];

		// Retornar primera opción más probable
		return possibilities[4] || possibilities[0]; // info@ o nombre@
	} catch (e) {
		return undefined;
	}
}

function determineBestMethod(contacts: ContactInfo): 'email' | 'linkedin' | 'phone' | 'instagram' {
	if (contacts.decisionMaker?.email) {
		return 'email';
	}
	if (contacts.genericEmails.length > 0) {
		return 'email';
	}
	if (contacts.phones.length > 0) {
		return 'phone';
	}
	if (contacts.decisionMaker?.linkedinUrl) {
		return 'linkedin';
	}
	return 'email';
}

