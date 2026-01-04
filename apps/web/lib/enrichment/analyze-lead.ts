/**
 * Analizador de Leads con Claude AI
 * Detecta problemas, calcula score y categoriza industria
 */

import Anthropic from '@anthropic-ai/sdk';
import type { GoogleMapsLead } from '../lead-discovery/google-maps-scraper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface LeadAnalysis {
  score: number; // 0-100
  problem_detected: string;
  insight: string;
  industry: string;
  recommended_product: 'codetix' | 'reservaspro';
}

/**
 * Analiza un lead usando Claude AI
 */
export async function analyzeLead(
  lead: GoogleMapsLead,
  productType: 'codetix' | 'reservaspro'
): Promise<LeadAnalysis> {
  try {
    const prompt = createAnalysisPrompt(lead, productType);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Parsear la respuesta de Claude
    const analysis = parseClaudeResponse(responseText);

    return {
      ...analysis,
      recommended_product: productType,
    };
  } catch (error) {
    console.error('Error analizando lead con Claude:', error);
    
    // Fallback: análisis básico sin AI
    return basicAnalysis(lead, productType);
  }
}

/**
 * Crea el prompt para Claude
 */
function createAnalysisPrompt(lead: GoogleMapsLead, productType: 'codetix' | 'reservaspro'): string {
  const productDescription = productType === 'codetix'
    ? 'Codetix es un sistema de pedidos con código QR para restaurantes y bares'
    : 'Reservaspro es un sistema de gestión de reservas para spas, salones y clínicas';

  return `Analiza este negocio para determinar si es un buen prospecto para ${productDescription}.

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${lead.company_name}
- Tipo: ${lead.business_type || 'Desconocido'}
- Ubicación: ${lead.location}
- Rating: ${lead.rating || 'N/A'} (${lead.reviews_count || 0} reseñas)
- Teléfono: ${lead.phone || 'No disponible'}
- Website: ${lead.website || 'No tiene website'}

ANÁLISIS REQUERIDO:
1. Score (0-100): Califica la probabilidad de que este negocio necesite nuestro producto
2. Problema detectado: Identifica un problema específico que podemos resolver
3. Insight: Una observación única sobre este negocio que nos ayude a personalizar el mensaje
4. Industria: Categoriza el tipo de negocio (ej: restaurante, spa, clínica dental)

CRITERIOS DE PUNTUACIÓN:
- +30 puntos: Tipo de negocio perfecto para el producto
- +20 puntos: Tiene teléfono pero NO tiene website (señal de digitalización baja)
- +15 puntos: Rating bajo (<3.5) - señal de que necesitan mejorar operaciones
- +10 puntos: Muchas reseñas (>50) - negocio activo
- +10 puntos: Ubicación en zona comercial/turística
- +15 puntos: Si menciona problemas relacionados con pedidos/reservas en reseñas

Responde SOLO con este formato JSON (sin markdown):
{
  "score": [número 0-100],
  "problem_detected": "[problema específico en 1 frase]",
  "insight": "[observación única en 1 frase]",
  "industry": "[categoría del negocio]"
}`;
}

/**
 * Parsea la respuesta de Claude
 */
function parseClaudeResponse(response: string): Omit<LeadAnalysis, 'recommended_product'> {
  try {
    // Limpiar markdown si existe
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanResponse);

    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      problem_detected: parsed.problem_detected || 'Sin problema detectado',
      insight: parsed.insight || 'Requiere más investigación',
      industry: parsed.industry || 'Desconocido',
    };
  } catch (error) {
    console.error('Error parseando respuesta de Claude:', error);
    throw error;
  }
}

/**
 * Análisis básico sin AI (fallback)
 */
function basicAnalysis(
  lead: GoogleMapsLead,
  productType: 'codetix' | 'reservaspro'
): LeadAnalysis {
  let score = 50; // Score base

  // Tiene teléfono pero no website = buena señal
  if (lead.phone && !lead.website) {
    score += 20;
  }

  // Rating bajo = necesita mejorar
  if (lead.rating && lead.rating < 3.5) {
    score += 15;
  }

  // Muchas reseñas = negocio activo
  if (lead.reviews_count && lead.reviews_count > 50) {
    score += 10;
  }

  // Tipo de negocio relevante
  const relevantTypes = productType === 'codetix'
    ? ['restaurant', 'cafe', 'bar', 'food']
    : ['spa', 'beauty_salon', 'hair_care', 'doctor', 'dentist'];

  if (relevantTypes.some(type => lead.business_type?.includes(type))) {
    score += 30;
  }

  const problem = !lead.website
    ? 'No tiene presencia digital profesional'
    : 'Podría mejorar su eficiencia operativa';

  const insight = lead.rating && lead.rating < 3.5
    ? 'Rating bajo sugiere problemas de servicio que podemos ayudar a resolver'
    : 'Negocio activo con potencial de crecimiento';

  return {
    score: Math.min(100, score),
    problem_detected: problem,
    insight,
    industry: lead.business_type || 'General',
    recommended_product: productType,
  };
}

/**
 * Analiza múltiples leads en batch
 */
export async function analyzeLeadsBatch(
  leads: Array<{
    company_name: string;
    email?: string;
    phone?: string;
    website?: string;
    location?: string;
  }>,
  productType: 'codetix' | 'reservaspro'
): Promise<Array<{
  company_name: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  score: number;
  problem_detected: string;
  insight: string;
  industry: string;
}>> {
  if (!leads || leads.length === 0) {
    return [];
  }

  const analyzed: any[] = [];

  for (const lead of leads) {
    try {
      // Convertir a formato GoogleMapsLead para el analizador
      const googleMapsLead: GoogleMapsLead = {
        company_name: lead.company_name || 'Unknown',
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        location: lead.location || '',
      };

      const analysis = await analyzeLead(googleMapsLead, productType);
      analyzed.push({
        company_name: lead.company_name,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        location: lead.location,
        score: analysis.score,
        problem_detected: analysis.problem_detected,
        insight: analysis.insight,
        industry: analysis.industry,
      });

      // Rate limiting: esperar 500ms entre llamadas a Claude
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error analizando lead ${lead.company_name}:`, error);
      
      // Usar análisis básico en caso de error
      const googleMapsLead: GoogleMapsLead = {
        company_name: lead.company_name || 'Unknown',
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        location: lead.location || '',
      };
      
      const fallback = basicAnalysis(googleMapsLead, productType);
      analyzed.push({
        company_name: lead.company_name,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        location: lead.location,
        score: fallback.score,
        problem_detected: fallback.problem_detected,
        insight: fallback.insight,
        industry: fallback.industry,
      });
    }
  }

  return analyzed;
}
