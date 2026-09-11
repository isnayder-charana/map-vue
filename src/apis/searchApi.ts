import type { PlacesResponse } from '@/interfaces'

const BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

export const searchApi = async (query: string, proximity: string): Promise<PlacesResponse> => {
  const params = new URLSearchParams({
    limit: '5',
    language: 'en',
    access_token: import.meta.env.VITE_MAPBOX_API_KEY,
    proximity,
  })

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(query)}.json?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Error al obtener lugares')
  }

  return response.json()
}
