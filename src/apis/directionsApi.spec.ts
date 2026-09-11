import { afterEach, describe, expect, it, vi } from 'vitest'
import { directionsApi } from './directionsApi'

describe('directionsApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('solicita una ruta de conducción con formato GeoJSON', async () => {
    const responseData = { routes: [], waypoints: [], code: 'Ok', uuid: 'route-id' }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(responseData), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('VITE_MAPBOX_API_KEY', 'test-token')

    await expect(directionsApi('-70,-18;-70.1,-18.1')).resolves.toEqual(responseData)

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('geometries=geojson'))
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('alternatives=false'))
  })

  it('informa un error cuando no se puede obtener la ruta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })))

    await expect(directionsApi('-70,-18;-70.1,-18.1')).rejects.toThrow('Error al obtener lugares')
  })
})
