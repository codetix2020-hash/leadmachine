import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface LeadAnalysisResult {
  score: number           // 0-100
  problemDetected: string // qué problema tienen
  insight: string         // observación clave
  industry: string
  employeeCount?: number
  recommendedProduct: 'codetix' | 'reservaspro' | 'none'
  reasoning: string
}

export async function analyzeLead(lead: {
  name: string
  website?: string
  phone?: string
  address?: string
  types?: string[]
}): Promise<LeadAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️ ANTHROPIC_API_KEY no configurada, usando análisis básico')
    return basicAnalysis(lead)
  }

  try {
    console.log(`🤖 Analizando lead: ${lead.name}...`)

    const prompt = `Analiza este negocio y dame un análisis detallado:

Nombre: ${lead.name}
${lead.website ? `Website: ${lead.website}` : ''}
${lead.phone ? `Teléfono: ${lead.phone}` : ''}
${lead.address ? `Dirección: ${lead.address}` : ''}
${lead.types ? `Tipo: ${lead.types.join(', ')}` : ''}

Tengo 2 productos:
1. **CodeTix**: Sistema de venta de entradas para eventos, discotecas, conciertos, teatros
2. **ReservasPro**: Sistema de reservas online para restaurantes, barberías, spas, clínicas

Analiza y responde en formato JSON:
{
  "score": <0-100, basado en fit con nuestros productos>,
  "problemDetected": "<problema específico que detectes, ej: 'no tienen sistema de reservas online'>",
  "insight": "<observación clave sobre el negocio>",
  "industry": "<industria específica>",
  "employeeCount": <estimación de empleados si es posible, sino null>,
  "recommendedProduct": "<codetix|reservaspro|none>",
  "reasoning": "<por qué recomiendas ese producto>"
}

Sé específico y basate en señales reales. Si no hay website, baja el score.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada de Claude')
    }

    // Extraer JSON de la respuesta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta')
    }

    const analysis: LeadAnalysisResult = JSON.parse(jsonMatch[0])

    console.log(`  ✓ Score: ${analysis.score}/100`)
    console.log(`  ✓ Producto: ${analysis.recommendedProduct}`)

    return analysis

  } catch (error) {
    console.error('❌ Error analizando con Claude:', error)
    console.log('  → Usando análisis básico como fallback')
    return basicAnalysis(lead)
  }
}

// Análisis básico sin Claude (fallback)
function basicAnalysis(lead: {
  name: string
  website?: string
  phone?: string
  address?: string
  types?: string[]
}): LeadAnalysisResult {
  let score = 30 // Base score
  let recommendedProduct: 'codetix' | 'reservaspro' | 'none' = 'none'
  let industry = 'unknown'
  let problemDetected = 'No se pudo determinar automáticamente'
  let insight = 'Análisis manual requerido'

  // Detectar industria y producto basado en tipos
  if (lead.types) {
    const typeStr = lead.types.join(' ').toLowerCase()

    // CodeTix leads
    if (typeStr.includes('night_club') || typeStr.includes('disco') || 
        typeStr.includes('theater') || typeStr.includes('event')) {
      recommendedProduct = 'codetix'
      industry = 'entertainment'
      problemDetected = 'Posiblemente venden entradas manualmente o con sistemas anticuados'
      score += 30
    }
    // ReservasPro leads
    else if (typeStr.includes('restaurant') || typeStr.includes('food') ||
             typeStr.includes('hair') || typeStr.includes('beauty') ||
             typeStr.includes('spa') || typeStr.includes('gym')) {
      recommendedProduct = 'reservaspro'
      industry = typeStr.includes('food') ? 'restaurant' : 'services'
      problemDetected = 'Probablemente gestionan reservas por teléfono o WhatsApp'
      score += 30
    }
  }

  // Ajustar score según datos disponibles
  if (lead.website) {
    score += 20
    insight = 'Tiene presencia online, buen candidato'
  } else {
    problemDetected += '. No tiene website visible'
  }

  if (lead.phone) score += 10

  return {
    score: Math.min(score, 100),
    problemDetected,
    insight,
    industry,
    employeeCount: undefined,
    recommendedProduct,
    reasoning: 'Análisis basado en categoría del negocio',
  }
}

// Función para analizar múltiples leads en batch
export async function analyzeLeadsBatch(
  leads: Array<{
    name: string
    website?: string
    phone?: string
    address?: string
    types?: string[]
  }>
): Promise<LeadAnalysisResult[]> {
  const results: LeadAnalysisResult[] = []

  console.log(`📊 Analizando ${leads.length} leads...`)

  for (let i = 0; i < leads.length; i++) {
    console.log(`\n[${i + 1}/${leads.length}]`)
    const analysis = await analyzeLead(leads[i])
    results.push(analysis)

    // Pausa para no saturar la API de Claude
    if (i < leads.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(`\n✅ Análisis completado`)
  return results
}

