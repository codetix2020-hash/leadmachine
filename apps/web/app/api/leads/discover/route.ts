/**
 * API Endpoint: Descubrir Leads
 * POST /api/leads/discover
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  searchGoogleMaps,
  findCodetixLeads,
  findReservasproLeads,
} from '@/lib/lead-discovery/google-maps-scraper';
import { analyzeLeadsBatch } from '@/lib/enrichment/analyze-lead';
import { DUMMY_USER_ID } from '@/lib/auth/constants';

// Inicializar Supabase con Service Role Key para escritura
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY no configurado');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, location, type, maxResults = 20 } = body;

    // Validación
    if (!location) {
      return NextResponse.json(
        { error: 'Location es requerido' },
        { status: 400 }
      );
    }

    if (!type || !['codetix', 'reservaspro'].includes(type)) {
      return NextResponse.json(
        { error: 'Type debe ser "codetix" o "reservaspro"' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando leads para ${type} en ${location}...`);

    // 1. Buscar leads en Google Maps
    let googleLeads;
    if (query) {
      // Búsqueda personalizada
      googleLeads = await searchGoogleMaps({
        query,
        location,
        maxResults,
      });
    } else {
      // Búsqueda predefinida según tipo
      if (type === 'codetix') {
        googleLeads = await findCodetixLeads(location, maxResults);
      } else {
        googleLeads = await findReservasproLeads(location, maxResults);
      }
    }

    console.log(`✅ Encontrados ${googleLeads.length} leads en Google Maps`);

    // 2. Analizar leads con Claude AI
    console.log('🤖 Analizando leads con Claude AI...');
    const analyzedLeads = await analyzeLeadsBatch(googleLeads, type);

    console.log('✅ Leads analizados');

    // 3. Guardar en Supabase
    if (!supabase) {
      throw new Error('Supabase no está configurado. Verifica SUPABASE_SERVICE_ROLE_KEY en .env');
    }

    console.log('💾 Guardando en Supabase...');
    const leadsToInsert = analyzedLeads.map((lead) => ({
      user_id: DUMMY_USER_ID, // 🔓 User ID dummy para desarrollo sin auth
      company_name: lead.company_name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      type: type,
      score: lead.score,
      status: 'new',
      industry: lead.industry,
      location: lead.location,
      problem_detected: lead.problem_detected,
      insight: lead.insight,
    }));

    const { data, error } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (error) {
      console.error('Error guardando en Supabase:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} leads guardados en Supabase`);

    return NextResponse.json({
      success: true,
      leads: data,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error en /api/leads/discover:', error);
    return NextResponse.json(
      {
        error: 'Error descubriendo leads',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
