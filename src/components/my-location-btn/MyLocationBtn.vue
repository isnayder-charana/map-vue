<template>
  <IconMapPinUserFill v-if="isBtnReady" @click="onMyLocationClicked" />
</template>

<script lang="ts">
import IconMapPinUserFill from '@/assets/svg/IconMapPinUserFill.vue'
import { useMapStore } from '@/stores/map'
import { usePlacesStore } from '@/stores/places'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'MyLocationBtn',
  components: { IconMapPinUserFill },
  setup() {
    const placesStore = usePlacesStore()
    const mapStore = useMapStore()

    return {
      isBtnReady: computed<boolean>(() => placesStore.isUserLocationReady && !!mapStore.map),
      onMyLocationClicked: () => {
        mapStore.map?.flyTo({
          center: placesStore.userLocation,
          zoom: 14,
        })
      },
    }
  },
})
</script>

<style scoped>
svg {
  position: fixed;
  top: 30px;
  right: 30px;
  cursor: pointer;
  transition: 0.5s ease;
}

svg:hover {
  filter: drop-shadow(0 0 1rem #0d6efd);
}
</style>
