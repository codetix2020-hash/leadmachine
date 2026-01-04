import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/client';

/**
 * GET - Obtener un lead por ID
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		await initializeDatabase();

		const { id } = await params;

		const { db } = await import('@/lib/db/client');
		const { leads } = await import('@/lib/db/schema');
		const { eq } = await import('drizzle-orm');

		const [lead] = await db.select().from(leads).where(eq(leads.id, id));

		if (!lead) {
			return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
		}

		return NextResponse.json({ lead });
	} catch (error: any) {
		console.error('Error fetching lead:', error);
		return NextResponse.json({ error: error.message || 'Error obteniendo lead' }, { status: 500 });
	}
}
