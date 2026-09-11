const BASE_URL = 'https://api.mapbox.com/search/geocode/v6/reverse'

interface ReverseGeocodingResponse {
  features: Array<{
    properties?: {
      place_formatted: string
    }
  }>
}

export const reverseGeocodingApi = async ([lng, lat]: [number, number]): Promise<string> => {
  const params = new URLSearchParams({
    longitude: String(lng),
    latitude: String(lat),
    language: 'en',
    access_token: import.meta.env.VITE_MAPBOX_API_KEY,
  })

  const response = await fetch(`${BASE_URL}?${params}`)

  if (!response.ok) {
    throw new Error('No se pudo obtener el nombre de la ubicación')
  }

  const data = (await response.json()) as ReverseGeocodingResponse
  const place = data.features[0]

  return place?.properties?.place_formatted ?? 'Tu ubicación actual'
}
