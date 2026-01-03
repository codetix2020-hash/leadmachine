import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtrado
    const type = searchParams.get('type') // 'codetix' | 'reservaspro'
    const status = searchParams.get('status') // 'new' | 'contacted' | etc
    const minScore = searchParams.get('minScore') // número
    const industry = searchParams.get('industry')
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Construir query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (type) {
      query = query.eq('type', type)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (minScore) {
      query = query.gte('score', parseInt(minScore))
    }

    if (industry) {
      query = query.eq('industry', industry)
    }

    // Ordenar por score descendente (mejores leads primero)
    query = query.order('score', { ascending: false })

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1)

    // Ejecutar query
    const { data: leads, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leads', details: error.message },
        { status: 500 }
      )
    }

    // Calcular metadata de paginación
    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        type: type || 'all',
        status: status || 'all',
        minScore: minScore || 0,
        industry: industry || 'all',
      },
    })

  } catch (error: any) {
    console.error('Error in GET /api/leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads', details: error.message },
      { status: 500 }
    )
  }
}

// PUT endpoint para actualizar un lead
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead:', error)
      return NextResponse.json(
        { error: 'Failed to update lead', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })

  } catch (error: any) {
    console.error('Error in PUT /api/leads:', error)
    return NextResponse.json(
      { error: 'Failed to update lead', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE endpoint para eliminar un lead
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lead:', error)
      return NextResponse.json(
        { error: 'Failed to delete lead', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    })

  } catch (error: any) {
    console.error('Error in DELETE /api/leads:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead', details: error.message },
      { status: 500 }
    )
  }
}

