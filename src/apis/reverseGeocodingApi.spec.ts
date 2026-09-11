import { afterEach, describe, expect, it, vi } from 'vitest'
import { reverseGeocodingApi } from './reverseGeocodingApi'

describe('reverseGeocodingApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('solicita el lugar con la latitud y longitud enviados como parametros', async () => {
    const responseData = {
      features: [
        {
          properties: {
            place_formatted: 'Tacna, Perú',
          },
        },
      ],
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(responseData), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('VITE_MAPBOX_API_KEY', 'test-token')

    await expect(reverseGeocodingApi([-70.25, -18.01])).resolves.toBe('Tacna, Perú')

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('longitude=-70.25'))
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('latitude=-18.01'))
  })

  it('informa un error cuando no ubica el lugar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

    await expect(reverseGeocodingApi([-70.25, -18.01])).rejects.toThrow(
      'No se pudo obtener el nombre de la ubicación',
    )
  })
})
