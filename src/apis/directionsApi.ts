import type { DirectionsResponse } from '@/interfaces'

const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving'

export const directionsApi = async (query: string): Promise<DirectionsResponse> => {
  const params = new URLSearchParams({
    alternatives: 'false',
    geometries: 'geojson',
    overview: 'simplified',
    steps: 'false',
    access_token: import.meta.env.VITE_MAPBOX_API_KEY,
  })

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(query)}.json?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Error al obtener lugares')
  }

  return response.json()
}
