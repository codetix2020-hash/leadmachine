/**
 * API Endpoint: Obtener Lead por ID
 * GET /api/leads/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db/client';
import { leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	await initializeDatabase();
	try {
		const { id } = await params;

		const [lead] = await db.select().from(leads).where(eq(leads.id, id));

		if (!lead) {
			return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
		}

		return NextResponse.json({ lead });
	} catch (error) {
		console.error('Error en GET /api/leads/[id]:', error);
		return NextResponse.json({ error: 'Error obteniendo lead' }, { status: 500 });
	}
}

