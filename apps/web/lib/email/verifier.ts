// Verificar emails antes de enviar (evitar bounces)

interface EmailVerification {
	valid: boolean;
	disposable: boolean;
	reason?: string;
}

export async function verifyEmail(email: string): Promise<boolean> {
	// 1. Validación básica formato
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		console.log(`❌ Invalid format: ${email}`);
		return false;
	}

	// 2. Check disposable domains
	const disposableDomains = [
		'tempmail.com',
		'guerrillamail.com',
		'10minutemail.com',
		'throwaway.email',
		'mailinator.com',
		'trashmail.com',
		'throwaway.email',
		'temp-mail.org',
		'yopmail.com',
		'sharklasers.com',
		'getnada.com',
		'mohmal.com',
		'fakemail.net',
		'dispostable.com',
	];

	const domain = email.split('@')[1]?.toLowerCase();
	if (domain && disposableDomains.includes(domain)) {
		console.log(`❌ Disposable email: ${email}`);
		return false;
	}

	// 3. Check against bounce list
	const isBounced = await isInBounceList(email);
	if (isBounced) {
		console.log(`❌ Previously bounced: ${email}`);
		return false;
	}

	// 4. Check common typos/patterns
	const commonTypos = ['test@test.com', 'example@example.com', 'admin@admin.com'];
	if (commonTypos.includes(email.toLowerCase())) {
		console.log(`❌ Common typo/test email: ${email}`);
		return false;
	}

	return true;
}

async function isInBounceList(email: string): Promise<boolean> {
	// TODO: Implementar tabla de bounces en DB
	// Por ahora: return false
	try {
		const { db } = await import('@/lib/db/client');
		const { conversations } = await import('@/lib/db/schema');
		const { eq, sql } = await import('drizzle-orm');

		// Check si hay bounces registrados en conversations
		// Por ahora retornar false hasta tener tabla de bounces
		return false;
	} catch (error) {
		return false;
	}
}

// Opcional: Verificación MX con DNS
async function checkMXRecord(domain: string): Promise<boolean> {
	try {
		// Requiere node:dns en Node.js
		// const dns = require('dns').promises
		// const addresses = await dns.resolveMx(domain)
		// return addresses.length > 0
		return true; // Por ahora asumir válido
	} catch (error) {
		return false;
	}
}

