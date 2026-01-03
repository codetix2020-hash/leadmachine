import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js'

const client = new Client({})

export interface GoogleMapsLead {
  name: string
  address: string
  phone?: string
  website?: string
  rating?: number
  reviewCount?: number
  lat: number
  lng: number
  placeId: string
  types?: string[]
}

export interface SearchGoogleMapsParams {
  query: string      // ej: "barberías"
  location: string   // ej: "Barcelona, Spain"
  radius?: number    // metros (default: 5000)
  maxResults?: number // default: 20
}

export async function searchGoogleMaps(params: SearchGoogleMapsParams): Promise<GoogleMapsLead[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY no está configurada')
  }

  const { query, location, radius = 5000, maxResults = 20 } = params

  try {
    console.log(`🔍 Buscando: "${query}" en ${location}...`)

    // Paso 1: Geocodificar la ubicación
    const geocodeResponse = await client.geocode({
      params: {
        address: location,
        key: apiKey,
      },
    })

    if (geocodeResponse.data.results.length === 0) {
      throw new Error(`No se pudo encontrar la ubicación: ${location}`)
    }

    const locationCoords = geocodeResponse.data.results[0].geometry.location

    console.log(`📍 Ubicación: ${locationCoords.lat}, ${locationCoords.lng}`)

    // Paso 2: Buscar lugares cercanos
    const searchResponse = await client.placesNearby({
      params: {
        location: locationCoords,
        radius,
        keyword: query,
        key: apiKey,
      },
    })

    const places = searchResponse.data.results.slice(0, maxResults)
    console.log(`✅ Encontrados ${places.length} lugares`)

    // Paso 3: Obtener detalles de cada lugar
    const leads: GoogleMapsLead[] = []

    for (const place of places) {
      try {
        const detailsResponse = await client.placeDetails({
          params: {
            place_id: place.place_id!,
            fields: [
              'name',
              'formatted_address',
              'formatted_phone_number',
              'website',
              'rating',
              'user_ratings_total',
              'geometry',
              'types',
            ],
            key: apiKey,
          },
        })

        const details = detailsResponse.data.result

        leads.push({
          name: details.name || place.name || 'Sin nombre',
          address: details.formatted_address || place.vicinity || 'Sin dirección',
          phone: details.formatted_phone_number,
          website: details.website,
          rating: details.rating,
          reviewCount: details.user_ratings_total,
          lat: details.geometry?.location.lat || place.geometry!.location.lat,
          lng: details.geometry?.location.lng || place.geometry!.location.lng,
          placeId: place.place_id!,
          types: details.types || place.types,
        })

        console.log(`  ✓ ${details.name}`)

        // Pequeña pausa para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`  ✗ Error obteniendo detalles de ${place.name}:`, error)
      }
    }

    console.log(`\n🎉 Total de leads procesados: ${leads.length}`)
    return leads

  } catch (error) {
    console.error('❌ Error en searchGoogleMaps:', error)
    throw error
  }
}

// Función helper para buscar por tipo de negocio
export async function searchByBusinessType(
  type: 'restaurant' | 'bar' | 'cafe' | 'store' | 'salon' | string,
  location: string,
  radius?: number
): Promise<GoogleMapsLead[]> {
  return searchGoogleMaps({
    query: type,
    location,
    radius,
  })
}

// Función helper para buscar negocios perfectos para CodeTix
export async function findCodetixLeads(location: string): Promise<GoogleMapsLead[]> {
  const queries = [
    'discoteca',
    'club nocturno',
    'sala de conciertos',
    'teatro',
    'eventos',
  ]

  const allLeads: GoogleMapsLead[] = []

  for (const query of queries) {
    try {
      const leads = await searchGoogleMaps({
        query,
        location,
        radius: 10000,
        maxResults: 10,
      })
      allLeads.push(...leads)
    } catch (error) {
      console.error(`Error buscando ${query}:`, error)
    }
  }

  return allLeads
}

// Función helper para buscar negocios perfectos para ReservasPro
export async function findReservasproLeads(location: string): Promise<GoogleMapsLead[]> {
  const queries = [
    'restaurante',
    'barbería',
    'peluquería',
    'spa',
    'gimnasio',
    'clínica dental',
  ]

  const allLeads: GoogleMapsLead[] = []

  for (const query of queries) {
    try {
      const leads = await searchGoogleMaps({
        query,
        location,
        radius: 10000,
        maxResults: 10,
      })
      allLeads.push(...leads)
    } catch (error) {
      console.error(`Error buscando ${query}:`, error)
    }
  }

  return allLeads
}

