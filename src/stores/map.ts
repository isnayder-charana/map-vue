import { directionsApi } from '@/apis'
import type { Feature, Route } from '@/interfaces'
import { createPlacePopupContent } from '@/utils'
import {
  LngLatBounds,
  Marker,
  Popup,
  type GeoJSONSourceSpecification,
  type Map as MapboxMap,
} from 'mapbox-gl'
import { defineStore } from 'pinia'
import { markRaw, type Raw } from 'vue'

export type LngLat = [number, number]

export interface MapState {
  map?: Raw<MapboxMap>
  markers: Raw<Marker>[]
  distance?: number
  duration?: number
}

export const useMapStore = defineStore('map', {
  state(): MapState {
    return {
      map: undefined,
      markers: [],
      distance: undefined,
      duration: undefined,
    }
  },
  actions: {
    setMap(map: MapboxMap) {
      this.map = markRaw(map)
    },
    async getRouteBetweenPoints({ start, end }: { start: LngLat; end: LngLat }) {
      const resp = await directionsApi(`${start.join(',')};${end.join(',')}`)

      this.setDistanceDuration(resp.routes)
      if (resp.routes[0]?.geometry) {
        this.setRoutePolyline(resp.routes[0].geometry.coordinates)
      }
    },

    setDistanceDuration(routes?: Route[]) {
      if (routes) {
        const route = routes[0]
        if (route) {
          let kms = route.distance / 1000
          kms = Math.round(kms * 100)
          kms /= 100
          this.distance = kms
          this.duration = Math.floor(route.duration / 60)
        }
      }
    },

    setRoutePolyline(coords: number[][]) {
      const start = coords[0]

      if (start) {
        if (!this.map || coords.length === 0) return
        //Definir los bounds
        const bounds = new LngLatBounds([start[0]!, start[1]!], [start[0]!, start[1]!])
        //Agregamos cada punto al bounds
        for (const coord of coords) {
          const newCoord: [number, number] = [coord[0]!, coord[1]!]
          bounds.extend(newCoord)
        }

        this.map.fitBounds(bounds, {
          padding: 300,
        })

        //Polyline
        const soucerData: GeoJSONSourceSpecification = {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: coords,
                },
              },
            ],
          },
        }
        if (this.map.getLayer('RouteString')) {
          this.map.removeLayer('RouteString')
          this.map.removeSource('RouteString')
        }
        this.map.addSource('RouteString', soucerData)
        this.map.addLayer({
          id: 'RouteString',
          type: 'line',
          source: 'RouteString',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': 'black',
            'line-width': 3,
          },
        })
      }
    },

    setPlacesMarkers(places: Feature[]) {
      //Borrar marcadores
      this.markers.forEach((marker) => marker.remove())
      this.markers = []
      if (!this.map) return
      //Crear los nuevos marcadores
      for (const place of places) {
        const [lng, lat] = place.center
        if (lng !== undefined && lat !== undefined) {
          const popup = new Popup()
            .setLngLat([lng, lat])
            .setDOMContent(createPlacePopupContent(place.text, place.place_name))
          const marker = markRaw(new Marker().setLngLat([lng, lat]).setPopup(popup).addTo(this.map))

          this.markers.push(marker)
        }
      }

      //Clear polyline
      if (this.map?.getLayer('RouteString')) {
        this.map.removeLayer('RouteString')
        this.map.removeSource('RouteString')
        this.distance = undefined
        this.duration = undefined
      }
    },
  },
})
