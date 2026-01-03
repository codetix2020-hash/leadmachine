/**
 * Google Maps Scraper para LEADMACHINE
 * Encuentra negocios usando Google Places API
 */

import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export interface GoogleMapsLead {
  company_name: string;
  email?: string;
  phone?: string;
  website?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews_count?: number;
  business_type?: string;
  google_maps_url?: string;
}

interface SearchParams {
  query: string;
  location: string;
  radius?: number; // en metros
  maxResults?: number;
}

/**
 * Busca negocios en Google Maps
 */
export async function searchGoogleMaps(
  params: SearchParams
): Promise<GoogleMapsLead[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY no está configurada');
  }

  try {
    const { query, location, radius = 5000, maxResults = 20 } = params;

    // 1. Geocode la ubicación
    const geocodeResponse = await client.geocode({
      params: {
        address: location,
        key: apiKey,
      },
    });

    if (geocodeResponse.data.results.length === 0) {
      throw new Error(`No se encontró la ubicación: ${location}`);
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

    // 2. Buscar lugares cercanos
    const placesResponse = await client.textSearch({
      params: {
        query: `${query} ${location}`,
        location: { lat, lng },
        radius,
        key: apiKey,
      },
    });

    const results = placesResponse.data.results.slice(0, maxResults);
    const leads: GoogleMapsLead[] = [];

    // 3. Obtener detalles de cada lugar
    for (const place of results) {
      try {
        const detailsResponse = await client.placeDetails({
          params: {
            place_id: place.place_id || '',
            fields: [
              'name',
              'formatted_phone_number',
              'website',
              'formatted_address',
              'geometry',
              'rating',
              'user_ratings_total',
              'types',
              'url',
            ],
            key: apiKey,
          },
        });

        const details = detailsResponse.data.result;

        leads.push({
          company_name: details.name || place.name || 'Sin nombre',
          phone: details.formatted_phone_number,
          website: details.website,
          location: details.formatted_address || place.formatted_address || location,
          latitude: details.geometry?.location?.lat,
          longitude: details.geometry?.location?.lng,
          rating: details.rating,
          reviews_count: details.user_ratings_total,
          business_type: details.types?.[0],
          google_maps_url: details.url,
        });

        // Rate limiting: esperar 100ms entre llamadas
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error obteniendo detalles del lugar ${place.place_id}:`, error);
      }
    }

    return leads;
  } catch (error) {
    console.error('Error en searchGoogleMaps:', error);
    throw error;
  }
}

/**
 * Busca restaurantes y bares para Codetix (sistema de pedidos QR)
 */
export async function findCodetixLeads(location: string, maxResults = 20): Promise<GoogleMapsLead[]> {
  const leads: GoogleMapsLead[] = [];

  // Buscar restaurantes
  const restaurants = await searchGoogleMaps({
    query: 'restaurantes',
    location,
    radius: 10000,
    maxResults: Math.ceil(maxResults / 2),
  });

  // Buscar bares
  const bars = await searchGoogleMaps({
    query: 'bares cafeterías',
    location,
    radius: 10000,
    maxResults: Math.ceil(maxResults / 2),
  });

  leads.push(...restaurants, ...bars);

  return leads.slice(0, maxResults);
}

/**
 * Busca spas, salones, clínicas para Reservaspro (sistema de reservas)
 */
export async function findReservasproLeads(location: string, maxResults = 20): Promise<GoogleMapsLead[]> {
  const leads: GoogleMapsLead[] = [];

  // Buscar spas
  const spas = await searchGoogleMaps({
    query: 'spa centro estético',
    location,
    radius: 10000,
    maxResults: Math.ceil(maxResults / 3),
  });

  // Buscar peluquerías
  const salons = await searchGoogleMaps({
    query: 'peluquerías salones belleza',
    location,
    radius: 10000,
    maxResults: Math.ceil(maxResults / 3),
  });

  // Buscar clínicas
  const clinics = await searchGoogleMaps({
    query: 'clínicas dentales médicas',
    location,
    radius: 10000,
    maxResults: Math.ceil(maxResults / 3),
  });

  leads.push(...spas, ...salons, ...clinics);

  return leads.slice(0, maxResults);
}
