/**
 * Script de seed para datos iniciales
 * Ejecutar: pnpm tsx lib/db/seed.ts
 */

import { db } from './client';
import { leads, analytics } from './schema';
import { DUMMY_USER_ID } from './client';

async function seed() {
	console.log('🌱 Iniciando seed de datos...');

	try {
		// Verificar si ya hay datos
		const existingLeads = await db.select().from(leads).limit(1);
		if (existingLeads.length > 0) {
			console.log('⚠️  Ya hay leads en la base de datos. Saltando seed.');
			return;
		}

		// Crear algunos leads de ejemplo
		const sampleLeads = [
			{
				user_id: DUMMY_USER_ID,
				company_name: 'Ejemplo Restaurante 1',
				email: 'contacto@restaurante1.com',
				phone: '+34 600 000 001',
				website: 'https://restaurante1.com',
				type: 'reservaspro' as const,
				score: 85,
				status: 'new' as const,
				industry: 'Restaurantes',
				location: 'Madrid, España',
				problem_detected: 'No tiene sistema de reservas online',
				insight: 'Alto potencial para implementar sistema de reservas',
			},
			{
				user_id: DUMMY_USER_ID,
				company_name: 'Ejemplo Clínica 1',
				email: 'info@clinica1.com',
				phone: '+34 600 000 002',
				website: 'https://clinica1.com',
				type: 'codetix' as const,
				score: 90,
				status: 'new' as const,
				industry: 'Salud',
				location: 'Barcelona, España',
				problem_detected: 'Gestión manual de citas',
				insight: 'Necesita sistema de gestión de citas médicas',
			},
		];

		const insertedLeads = await db.insert(leads).values(sampleLeads).returning();
		console.log(`✅ ${insertedLeads.length} leads de ejemplo creados`);

		// Crear analytics de ejemplo para hoy
		const today = new Date().toISOString().split('T')[0];
		await db.insert(analytics).values({
			date: today,
			leads_found: insertedLeads.length,
			messages_sent: 0,
			open_rate: 0,
			response_rate: 0,
			calls_scheduled: 0,
			deals_closed: 0,
			revenue_generated: 0,
		});
		console.log('✅ Analytics inicial creado');

		console.log('✅ Seed completado exitosamente');
	} catch (error) {
		console.error('❌ Error en seed:', error);
		throw error;
	}
}

seed()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});



