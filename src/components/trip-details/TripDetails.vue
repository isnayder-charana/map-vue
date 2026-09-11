<template>
  <div v-if="distance" class="trip-container column">
    <div class="col">
      Distance: <strong>{{ distance }} kms</strong>
    </div>
    <div class="col">
      Duration: <strong>{{ duration }} mins.</strong>
    </div>
  </div>
</template>

<script lang="ts">
import { useMapStore } from '@/stores/map'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'TripDetails',
  setup() {
    const mapStore = useMapStore()
    const { distance, duration } = storeToRefs(mapStore)
    return {
      distance,
      duration,
    }
  },
})
</script>

<style scoped>
.trip-container {
  padding: 10px;
  position: fixed;
  bottom: 35px;
  left: 20px;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.2);
  font-size: 20px;
  width: 300px;
}

strong {
  color: #42b983;
}
</style>
