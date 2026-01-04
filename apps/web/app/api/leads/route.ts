/**
 * API Endpoint: CRUD de Leads
 * GET /api/leads - Listar leads con filtros y paginación
 * PUT /api/leads - Actualizar un lead
 * DELETE /api/leads - Eliminar un lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DUMMY_USER_ID } from '@/lib/auth/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Construir query - filtrar por user_id dummy
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', DUMMY_USER_ID); // 🔓 Filtrar por user_id dummy

    // Aplicar filtros
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (minScore) query = query.gte('score', Number.parseInt(minScore));
    if (industry) query = query.eq('industry', industry);

    // Ordenar y paginar
    query = query
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      leads: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error en GET /api/leads:', error);
    return NextResponse.json(
      { error: 'Error obteniendo leads' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Error en PUT /api/leads:', error);
    return NextResponse.json(
      { error: 'Error actualizando lead' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/leads:', error);
    return NextResponse.json(
      { error: 'Error eliminando lead' },
      { status: 500 }
    );
  }
}
