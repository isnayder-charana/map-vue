import { useMap } from '@/composables'
import { usePlacesStore } from '@/stores/places'
import { storeToRefs } from 'pinia'
import { defineComponent, nextTick, onMounted, watch } from 'vue'

export default defineComponent({
  name: 'MapView',
  setup() {
    const { initMap, mapElement } = useMap()
    const placesStore = usePlacesStore()

    const { isUserLocationReady } = storeToRefs(placesStore)

    onMounted(() => {
      watch(
        isUserLocationReady,
        async (isReady) => {
          if (!isReady) return

          await nextTick()
          await initMap(placesStore.userLocationName, placesStore.userLocation)
        },
        { immediate: true },
      )
    })

    return {
      isUserLocationReady,
      mapElement,
    }
  },
})
