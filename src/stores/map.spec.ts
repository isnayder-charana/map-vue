import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { DirectionsResponse, Feature, Route } from '@/interfaces'

vi.mock('@/apis', () => ({
  directionsApi: vi.fn(),
}))

const mocks = vi.hoisted(() => {
  const map = {
    on: vi.fn(),
    fitBounds: vi.fn(),
    getLayer: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
  }

  const boundsInstance = {
    extend: vi.fn(),
  }

  const LngLatBoundsMock = vi.fn(function LngLatBoundsMock() {
    return boundsInstance
  })

  const PopupMock = vi.fn(function PopupMock() {
    return {
      setLngLat: vi.fn(() => ({
        setDOMContent: vi.fn().mockReturnThis(),
      })),
    }
  })

  const MarkerMock = vi.fn(function MarkerMock() {
    return {
      setLngLat: vi.fn(() => ({
        setPopup: vi.fn(() => ({
          addTo: vi.fn().mockReturnThis(),
        })),
      })),
      remove: vi.fn(),
    }
  })

  return {
    map,
    boundsInstance,
    LngLatBoundsMock,
    Map: vi.fn(() => map),
    PopupMock,
    MarkerMock,
  }
})

vi.mock('mapbox-gl', () => ({
  default: {
    Map: mocks.Map,
  },

  // Exports nombrados usados por map.ts:
  LngLatBounds: mocks.LngLatBoundsMock,
  Popup: mocks.PopupMock,
  Marker: mocks.MarkerMock,
}))

import { useMapStore } from './map'
import type { Map, Marker } from 'mapbox-gl'
import { directionsApi } from '@/apis'

describe('useMapStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('guarda el mapa', () => {
    const store = useMapStore()
    const map = mocks.map as unknown as Map
    store.setMap(map)
    expect(store.map).toBe(map)
  })

  it('no obtiene la ruta y no puede actualizar la distancia, duración y polilinea', async () => {
    const store = useMapStore()

    const response = {
      routes: [],
      waypoints: [],
      code: 'Ok',
      uuid: 'test-route',
    } as DirectionsResponse

    vi.mocked(directionsApi).mockResolvedValue(response)

    const distanceSpy = vi.spyOn(store, 'setDistanceDuration').mockImplementation(() => {})
    const polylineSpy = vi.spyOn(store, 'setRoutePolyline').mockImplementation(() => {})

    await store.getRouteBetweenPoints({
      start: [-70.25, -18.01],
      end: [-70.3, -18.02],
    })

    expect(directionsApi).toHaveBeenCalledWith('-70.25,-18.01;-70.3,-18.02')
    expect(distanceSpy).toHaveBeenCalledWith([])
    expect(polylineSpy).not.toHaveBeenCalled()
  })

  it('obtiene la ruta y actualiza distancia, duración y polilínea', async () => {
    const store = useMapStore()

    const route = {
      distance: 1512,
      duration: 119,
      geometry: {
        type: 'LineString',
        coordinates: [
          [-70.25, -18.01],
          [-70.3, -18.02],
        ],
      },
    } as Route

    const response = {
      routes: [route],
      waypoints: [],
      code: 'Ok',
      uuid: 'test-route',
    } as DirectionsResponse

    vi.mocked(directionsApi).mockResolvedValue(response)

    const distanceSpy = vi.spyOn(store, 'setDistanceDuration').mockImplementation(() => {})
    const polylineSpy = vi.spyOn(store, 'setRoutePolyline').mockImplementation(() => {})

    await store.getRouteBetweenPoints({
      start: [-70.25, -18.01],
      end: [-70.3, -18.02],
    })

    expect(directionsApi).toHaveBeenCalledWith('-70.25,-18.01;-70.3,-18.02')
    expect(distanceSpy).toHaveBeenCalledWith([route])
    expect(polylineSpy).toHaveBeenCalledWith(route.geometry.coordinates)
  })

  it('si no hay rutas no se puede convertir en metros y segundos a kilómetros y minutos', () => {
    const store = useMapStore()

    store.setDistanceDuration()

    expect(store.distance).toBe(undefined)
    expect(store.duration).toBe(undefined)
  })

  it('convierte metros y segundos a kilómetros y minutos', () => {
    const store = useMapStore()
    const routes = [{ distance: 1512, duration: 119 }] as Route[]

    store.setDistanceDuration(routes)

    expect(store.distance).toBe(1.51)
    expect(store.duration).toBe(1)
  })

  it('no cambia los datos de viaje si no hay una ruta', () => {
    const store = useMapStore()
    store.distance = 3
    store.duration = 5

    store.setDistanceDuration([])

    expect(store.distance).toBe(3)
    expect(store.duration).toBe(5)
  })

  it('si no existe coordenadas debe salirse de la función', () => {
    const store = useMapStore()
    store.setMap(mocks.map as unknown as Map)

    store.setRoutePolyline([])

    expect(mocks.LngLatBoundsMock).not.toHaveBeenCalled()
  })

  it('crea bounds, añade las coordenadas y ajusta el mapa', () => {
    const store = useMapStore()
    store.setMap(mocks.map as unknown as Map)

    const coords = [
      [-70.25, -18.01],
      [-70.3, -18.02],
      [-70.35, -18.03],
    ]

    store.setRoutePolyline(coords)

    // Crea los bounds usando el primer punto como inicio y fin.
    expect(mocks.LngLatBoundsMock).toHaveBeenCalledWith([-70.25, -18.01], [-70.25, -18.01])

    // Recorre y añade cada punto.
    expect(mocks.boundsInstance.extend).toHaveBeenCalledTimes(3)
    expect(mocks.boundsInstance.extend).toHaveBeenNthCalledWith(1, [-70.25, -18.01])
    expect(mocks.boundsInstance.extend).toHaveBeenNthCalledWith(2, [-70.3, -18.02])
    expect(mocks.boundsInstance.extend).toHaveBeenNthCalledWith(3, [-70.35, -18.03])

    // Centra/ajusta el mapa para mostrar toda la ruta.
    expect(mocks.map.fitBounds).toHaveBeenCalledWith(mocks.boundsInstance, { padding: 300 })
  })

  it('elimina la capa y la fuente anteriores antes de crear la ruta', () => {
    const store = useMapStore()
    store.setMap(mocks.map as unknown as Map)

    // Simula que ya existe una capa llamada RouteString.
    mocks.map.getLayer.mockReturnValue({ id: 'RouteString' })

    store.setRoutePolyline([
      [-70.25, -18.01],
      [-70.3, -18.02],
    ])

    expect(mocks.map.getLayer).toHaveBeenCalledWith('RouteString')
    expect(mocks.map.removeLayer).toHaveBeenCalledWith('RouteString')
    expect(mocks.map.removeSource).toHaveBeenCalledWith('RouteString')
  })

  it('elimina los marcadores anteriores y no crea otros si no existe un mapa', () => {
    const store = useMapStore()

    const oldMarkerA = {
      remove: vi.fn(),
    } as unknown as Marker

    const oldMarkerB = {
      remove: vi.fn(),
    } as unknown as Marker

    store.markers = [oldMarkerA, oldMarkerB]

    const place = {
      id: 'place-1',
      text: 'Plaza de Armas',
      place_name: 'Tacna, Perú',
      center: [-70.25, -18.01],
    } as Feature

    // No usamos store.setMap(...):
    // así store.map permanece undefined.
    store.setPlacesMarkers([place])

    expect(oldMarkerA.remove).toHaveBeenCalledOnce()
    expect(oldMarkerB.remove).toHaveBeenCalledOnce()

    expect(store.markers).toEqual([])

    // Como no hay mapa, no debe construirse un marcador nuevo.
    expect(mocks.MarkerMock).not.toHaveBeenCalled()
  })

  it('no crea un marcador si el lugar no tiene coordenadas completas', () => {
    const store = useMapStore()
    store.setMap(mocks.map as unknown as Map)

    const placeWithoutCoordinates = {
      id: 'place-1',
      text: 'Lugar sin coordenadas',
      place_name: 'Tacna, Perú',
      center: [],
    } as Feature

    store.setPlacesMarkers([placeWithoutCoordinates])

    expect(mocks.MarkerMock).not.toHaveBeenCalled()
    expect(store.markers).toEqual([])
  })

  it('elimina los marcadores anteriores y crea lugares', () => {
    const store = useMapStore()
    store.setMap(mocks.map as unknown as Map)
    const place = {
      id: 'place-1',
      text: 'Plaza de Armas',
      place_name: 'Tacna, Perú',
      center: [-70.25, -18.01],
    } as Feature

    store.setPlacesMarkers([place])

    expect(mocks.PopupMock).toHaveBeenCalledOnce()
    expect(mocks.MarkerMock).toHaveBeenCalledOnce()
    expect(store.markers).toHaveLength(1)
  })

  it('no elimina la polilínea si no existe RouteString', () => {
    const store = useMapStore()
    store.setMap(mocks.map as unknown as Map)

    const place = {
      id: 'place-1',
      text: 'Plaza de Armas',
      place_name: 'Tacna, Perú',
      center: [-70.25, -18.01],
    } as Feature

    // Simula que no hay una polilínea previa.
    mocks.map.getLayer.mockReturnValue(undefined)

    store.setPlacesMarkers([place])

    expect(mocks.map.getLayer).toHaveBeenCalledWith('RouteString')
    expect(mocks.map.removeLayer).not.toHaveBeenCalled()
    expect(mocks.map.removeSource).not.toHaveBeenCalled()
  })

  it('crea marcadores y polyline', () => {
    const store = useMapStore()
    store.setMap(mocks.map as unknown as Map)
    const place = {
      id: 'place-1',
      text: 'Plaza de Armas',
      place_name: 'Tacna, Perú',
      center: [-70.25, -18.01],
    } as Feature

    // Simula que ya existe una capa llamada RouteString.
    mocks.map.getLayer.mockReturnValue({ id: 'RouteString' })

    store.setPlacesMarkers([place])

    expect(mocks.map.getLayer).toHaveBeenCalledWith('RouteString')
    expect(mocks.map.removeLayer).toHaveBeenCalledWith('RouteString')
    expect(mocks.map.removeSource).toHaveBeenCalledWith('RouteString')
  })
})
