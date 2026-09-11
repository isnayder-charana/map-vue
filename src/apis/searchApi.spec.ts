import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchApi } from './searchApi'

describe('searchApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('consulta Mapbox con el término y los parámetros esperados', async () => {
    const responseData = { features: [] }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(responseData), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('VITE_MAPBOX_API_KEY', 'test-token')

    await expect(searchApi('Plaza de Armas', '-70.25,-18.01')).resolves.toEqual(responseData)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('Plaza%20de%20Armas'),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('limit=5'),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('proximity=-70.25%2C-18.01'),
    )
  })

  it('informa un error cuando Mapbox responde con fallo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

    await expect(searchApi('Tacna', '-70,-18')).rejects.toThrow('Error al obtener lugares')
  })
})
