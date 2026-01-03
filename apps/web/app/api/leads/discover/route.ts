import { createClient } from '@supabase/supabase-js'
import { searchGoogleMaps, findCodetixLeads, findReservasproLeads } from '@/lib/lead-discovery/google-maps-scraper'
import { analyzeLeadsBatch } from '@/lib/enrichment/analyze-lead'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, location, type } = body

    if (!query || !location || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: query, location, type' },
        { status: 400 }
      )
    }

    if (!['codetix', 'reservaspro'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be "codetix" or "reservaspro"' },
        { status: 400 }
      )
    }

    console.log(`\n🚀 Starting lead discovery...`)
    console.log(`   Query: ${query}`)
    console.log(`   Location: ${location}`)
    console.log(`   Type: ${type}\n`)

    // Paso 1: Buscar en Google Maps
    console.log('📍 Step 1: Searching Google Maps...')
    let googleLeads

    if (query === 'auto') {
      // Búsqueda automática según el tipo
      googleLeads = type === 'codetix' 
        ? await findCodetixLeads(location)
        : await findReservasproLeads(location)
    } else {
      // Búsqueda personalizada
      googleLeads = await searchGoogleMaps({
        query,
        location,
        maxResults: 20,
      })
    }

    if (googleLeads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads found for this search',
        count: 0,
        leads: [],
      })
    }

    console.log(`✅ Found ${googleLeads.length} potential leads\n`)

    // Paso 2: Analizar cada lead con Claude
    console.log('🤖 Step 2: Analyzing leads with AI...')
    const analyses = await analyzeLeadsBatch(
      googleLeads.map(lead => ({
        name: lead.name,
        website: lead.website,
        phone: lead.phone,
        address: lead.address,
        types: lead.types,
      }))
    )

    console.log('✅ Analysis complete\n')

    // Paso 3: Guardar en Supabase
    console.log('💾 Step 3: Saving to database...')
    const leadsToInsert = googleLeads.map((googleLead, index) => {
      const analysis = analyses[index]

      return {
        company_name: googleLead.name,
        email: null, // Por ahora no lo tenemos
        phone: googleLead.phone || null,
        linkedin_url: null,
        instagram_url: null,
        website: googleLead.website || null,
        type,
        score: analysis.score,
        status: 'new',
        industry: analysis.industry,
        location: googleLead.address,
        employee_count: analysis.employeeCount || null,
        problem_detected: analysis.problemDetected,
        insight: analysis.insight,
      }
    })

    const { data: insertedLeads, error: insertError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select()

    if (insertError) {
      console.error('❌ Error inserting leads:', insertError)
      return NextResponse.json(
        { error: 'Failed to save leads to database', details: insertError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Saved ${insertedLeads?.length || 0} leads to database\n`)

    // Retornar resultados
    return NextResponse.json({
      success: true,
      message: `Successfully discovered and saved ${insertedLeads?.length || 0} leads`,
      count: insertedLeads?.length || 0,
      leads: insertedLeads?.map((lead, index) => ({
        ...lead,
        googleMapsData: {
          rating: googleLeads[index].rating,
          reviewCount: googleLeads[index].reviewCount,
          lat: googleLeads[index].lat,
          lng: googleLeads[index].lng,
          placeId: googleLeads[index].placeId,
        },
        analysis: analyses[index],
      })),
    })

  } catch (error: any) {
    console.error('❌ Error in lead discovery:', error)
    return NextResponse.json(
      { 
        error: 'Lead discovery failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
