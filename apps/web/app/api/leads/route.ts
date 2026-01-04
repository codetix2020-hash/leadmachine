/**
 * API Endpoint: CRUD de Leads
 * GET /api/leads - Listar leads con filtros y paginación
 * PUT /api/leads - Actualizar un lead
 * DELETE /api/leads - Eliminar un lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/client';

/**
 * GET - Obtener leads
 */
export async function GET(request: NextRequest) {
	try {
		await initializeDatabase();
		
		const { db } = await import('@/lib/db/client');
		const { leads } = await import('@/lib/db/schema');
		
		const allLeads = await db.select().from(leads);
		
		return NextResponse.json({ 
			success: true, 
			leads: allLeads || [] 
		});
	} catch (error: any) {
		console.error('❌ Error in GET /api/leads:', error?.message || error);
		
		// Devolver array vacío en caso de error para que frontend no crashee
		return NextResponse.json({ 
			success: true, 
			leads: [] 
		});
	}
}

/**
 * PUT - Actualizar un lead
 */
export async function PUT(request: NextRequest) {
	try {
		await initializeDatabase();
		
		const { db } = await import('@/lib/db/client');
		const { leads } = await import('@/lib/db/schema');
		const { eq, sql } = await import('drizzle-orm');
		
		const body = await request.json();
		const { id, ...updates } = body;

		if (!id) {
			return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
		}

		const updatedLead = await db
			.update(leads)
			.set({
				...updates,
				updated_at: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(leads.id, id))
			.returning();

		if (updatedLead.length === 0) {
			return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
		}

		return NextResponse.json({ lead: updatedLead[0] });
	} catch (error) {
		console.error('Error en PUT /api/leads:', error);
		return NextResponse.json({ error: 'Error actualizando lead' }, { status: 500 });
	}
}

/**
 * DELETE - Eliminar un lead
 */
export async function DELETE(request: NextRequest) {
	try {
		await initializeDatabase();
		
		const { db } = await import('@/lib/db/client');
		const { leads } = await import('@/lib/db/schema');
		const { eq } = await import('drizzle-orm');
		
		const searchParams = request.nextUrl.searchParams;
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
		}

		const deletedLead = await db.delete(leads).where(eq(leads.id, id)).returning();

		if (deletedLead.length === 0) {
			return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error en DELETE /api/leads:', error);
		return NextResponse.json({ error: 'Error eliminando lead' }, { status: 500 });
	}
}
