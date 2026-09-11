import { reverseGeocodingApi, searchApi } from '@/apis'
import type { Feature } from '@/interfaces'
import { defineStore } from 'pinia'

export interface PlacesState {
  isLoading: boolean
  userLocation?: [number, number]
  isLoadingPlaces: boolean
  places: Feature[]
  userLocationName: string
}

export const usePlacesStore = defineStore('places', {
  state(): PlacesState {
    return {
      isLoading: true,
      userLocation: undefined,
      isLoadingPlaces: false,
      places: [],
      userLocationName: '',
    }
  },
  getters: {
    isUserLocationReady: (state) => !!state.userLocation,
  },
  actions: {
    async getInitialLocation() {
      return new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            this.userLocation = [coords.longitude, coords.latitude]
            try {
              this.userLocationName = await reverseGeocodingApi(this.userLocation)
            } catch {
              this.userLocationName = 'Tu ubicación actual'
            }
            this.isLoading = false
            resolve()
          },
          (err) => {
            reject(err)
          },
        )
      })
    },
    async searchPlacesByTerm(query: string): Promise<Feature[]> {
      if (query.length === 0) {
        this.places = []
        return []
      }
      if (!this.userLocation) throw new Error('No hay ubicación del usuario')

      this.isLoadingPlaces = true

      try {
        const data = await searchApi(query, this.userLocation?.join(','))
        this.places = data.features
        return data.features
      } finally {
        this.isLoadingPlaces = false
      }
    },
  },
})
