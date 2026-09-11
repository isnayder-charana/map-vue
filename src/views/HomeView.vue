<template>
  <MapView v-if="!placesStore.isLoading" />
  <SearchBar />
  <MyLocationBtn v-if="!placesStore.isLoading" />
  <TripDetails />
</template>

<script lang="ts">
import MapView from '@/components/mapview/MapView.vue'
import MyLocationBtn from '@/components/my-location-btn/MyLocationBtn.vue'
import SearchBar from '@/components/search-bar/SearchBar.vue'
import TripDetails from '@/components/trip-details/TripDetails.vue'
import { usePlacesStore } from '@/stores/places'
import { defineComponent, onMounted } from 'vue'

export default defineComponent({
  name: 'HomeView',
  components: { MapView, MyLocationBtn, SearchBar, TripDetails },
  setup() {
    const placesStore = usePlacesStore()
    onMounted(async () => {
      try {
        await placesStore.getInitialLocation()
      } catch (error) {
        console.error('No se pudo obtener la ubicación', error)
      }
    })

    return { placesStore }
  },
})
</script>
