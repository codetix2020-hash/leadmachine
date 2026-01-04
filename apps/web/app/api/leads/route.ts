/**
 * API Endpoint: CRUD de Leads
 * GET /api/leads - Listar leads con filtros y paginación
 * PUT /api/leads - Actualizar un lead
 * DELETE /api/leads - Eliminar un lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, DUMMY_USER_ID, initializeDatabase } from '@/lib/db/client';
import { leads } from '@/lib/db/schema';
import { eq, and, gte, desc, asc, sql } from 'drizzle-orm';

/**
 * GET - Obtener leads con filtros
 */
export async function GET(request: NextRequest) {
	await initializeDatabase();
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

		// Obtener todos los leads que cumplen condiciones (una sola query)
		const allLeads = await db
			.select()
			.from(leads)
			.where(and(...conditions));
		
		const total = allLeads.length;

		// Ordenar y paginar en memoria (más confiable que limit/offset con SQLite)
		const data = allLeads
			.sort((a, b) => {
				// Ordenar por score descendente, luego por created_at
				const scoreDiff = (b.score || 0) - (a.score || 0);
				if (scoreDiff !== 0) {
					return scoreDiff;
				}
				// Si score es igual, ordenar por fecha (más reciente primero)
				const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
				const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
				return dateB - dateA;
			})
			.slice(offset, offset + limit);

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
		console.error('Error details:', error instanceof Error ? error.stack : error);
		return NextResponse.json(
			{ 
				error: 'Error obteniendo leads',
				details: error instanceof Error ? error.message : 'Unknown error',
				leads: [], // Devolver array vacío para que UI no se rompa
				pagination: {
					total: 0,
					page: 1,
					limit: 50,
					totalPages: 0,
				}
			}, 
			{ status: 500 }
		);
	}
}

/**
 * PUT - Actualizar un lead
 */
export async function PUT(request: NextRequest) {
	await initializeDatabase();
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
	await initializeDatabase();
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
