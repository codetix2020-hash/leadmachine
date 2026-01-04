/**
 * API Endpoint: CRUD de Leads
 * GET /api/leads - Listar leads con filtros y paginación
 * PUT /api/leads - Actualizar un lead
 * DELETE /api/leads - Eliminar un lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, DUMMY_USER_ID } from '@/lib/db/client';
import { leads } from '@/lib/db/schema';
import { eq, and, gte, desc, asc, sql } from 'drizzle-orm';

/**
 * GET - Obtener leads con filtros
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;

		// Parámetros de filtro
		const type = searchParams.get('type');
		const status = searchParams.get('status');
		const minScore = searchParams.get('minScore');
		const industry = searchParams.get('industry');

		// Parámetros de paginación
		const page = Number.parseInt(searchParams.get('page') || '1');
		const limit = Number.parseInt(searchParams.get('limit') || '50');
		const offset = (page - 1) * limit;

		// Construir condiciones de filtro
		const conditions = [eq(leads.user_id, DUMMY_USER_ID)];

		if (type) {
			conditions.push(eq(leads.type, type as 'codetix' | 'reservaspro'));
		}
		if (status) {
			conditions.push(
				eq(
					leads.status,
					status as 'new' | 'contacted' | 'interested' | 'call_scheduled' | 'closed' | 'lost'
				)
			);
		}
		if (minScore) {
			conditions.push(gte(leads.score, Number.parseInt(minScore)));
		}
		if (industry) {
			conditions.push(eq(leads.industry, industry));
		}

		// Obtener total para paginación
		const totalResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(leads)
			.where(and(...conditions));

		const total = totalResult[0]?.count || 0;

		// Obtener leads paginados
		const data = await db
			.select()
			.from(leads)
			.where(and(...conditions))
			.orderBy(desc(leads.score), desc(leads.created_at))
			.limit(limit)
			.offset(offset);

		return NextResponse.json({
			leads: data || [],
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('Error en GET /api/leads:', error);
		return NextResponse.json({ error: 'Error obteniendo leads' }, { status: 500 });
	}
}

/**
 * PUT - Actualizar un lead
 */
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, ...updates } = body;

		if (!id) {
			return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
		}

		// Agregar updated_at
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
