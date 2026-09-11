import type { Feature } from '@/interfaces'
import { useMapStore } from '@/stores/map'
import { usePlacesStore } from '@/stores/places'
import { storeToRefs } from 'pinia'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'SearchResults',
  setup() {
    const placesStore = usePlacesStore()
    const mapStore = useMapStore()
    const activePlace = ref('')

    const { places, isLoadingPlaces } = storeToRefs(placesStore)

    watch(places, (newPlaces) => (mapStore.setPlacesMarkers(newPlaces), { immediate: true }))

    return {
      places,
      isLoadingPlaces,
      activePlace,
      onPlaceClicked: (place: Feature) => {
        activePlace.value = place.id
        const [lng, lat] = place.center
        if (lng !== undefined && lat !== undefined)
          mapStore.map?.flyTo({
            zoom: 14,
            center: [lng, lat],
          })
      },
      getRouteDirections: (place: Feature) => {
        if (!placesStore.userLocation) return
        const [startLng, startLat] = placesStore.userLocation
        const [lng, lat] = place.center
        const start: [number, number] = [startLng, startLat]
        if (lng !== undefined && lat !== undefined) {
          const end: [number, number] = [lng, lat]
          mapStore.getRouteBetweenPoints({ start, end })
        }
      },
    }
  },
})
