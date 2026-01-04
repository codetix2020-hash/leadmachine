/**
 * Health check endpoint para verificar que el servidor y la BD funcionan
 */
import { NextResponse } from 'next/server';
import { initializeDatabase, sqlite } from '@/lib/db/client';

export async function GET() {
	try {
		await initializeDatabase();
		
		// Probar conexión a la BD
		await sqlite.execute('SELECT 1');
		
		return NextResponse.json({
			status: 'ok',
			database: 'connected',
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: 'error',
				database: 'disconnected',
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

