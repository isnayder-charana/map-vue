import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Feature } from '@/interfaces'

const { searchApiMock } = vi.hoisted(() => ({ searchApiMock: vi.fn() }))

vi.mock('@/apis', () => ({
  searchApi: searchApiMock,
}))

import { usePlacesStore } from './places'

describe('usePlacesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    searchApiMock.mockReset()
  })

  it('guarda la ubicación obtenida del navegador', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { longitude: -70.25, latitude: -18.01 },
          } as GeolocationPosition),
      },
    })
    const store = usePlacesStore()

    await store.getInitialLocation()

    expect(store.userLocation).toEqual([-70.25, -18.01])
    expect(store.isLoading).toBe(false)
  })

  it('lanza un error si no hay ubicación del usuario', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_: PositionCallback, error: PositionErrorCallback) =>
          error({
            code: 1,
            message: 'Geolocation is not available',
          } as GeolocationPositionError),
      },
    })
    const store = usePlacesStore()

    await expect(store.getInitialLocation()).rejects.toThrow('Geolocation is not available')
  })

  it('limpia los resultados cuando el término está vacío', async () => {
    const store = usePlacesStore()
    store.places = [{ id: 'place-1' } as Feature]

    await expect(store.searchPlacesByTerm('')).resolves.toEqual([])

    expect(store.places).toEqual([])
    expect(searchApiMock).not.toHaveBeenCalled()
  })

  it('lanza un error si no hay ubicación del usuario al buscar lugares', async () => {
    const store = usePlacesStore()

    await expect(store.searchPlacesByTerm('plaza')).rejects.toThrow('No hay ubicación del usuario')
  })

  it('consulta y guarda los lugares cercanos', async () => {
    const places = [{ id: 'place-1' } as Feature]
    searchApiMock.mockResolvedValue({ features: places })
    const store = usePlacesStore()
    store.userLocation = [-70.25, -18.01]

    await expect(store.searchPlacesByTerm('plaza')).resolves.toEqual(places)

    expect(searchApiMock).toHaveBeenCalledWith('plaza', '-70.25,-18.01')
    expect(store.places).toEqual(places)
    expect(store.isLoadingPlaces).toBe(false)
  })

  it('llamar el getter isUserLocationReady', () => {
    const store = usePlacesStore()
    store.userLocation = [-70.25, -18.01]

    expect(store.isUserLocationReady).toBe(true)

    store.userLocation = undefined

    expect(store.isUserLocationReady).toBe(false)
  })
})
