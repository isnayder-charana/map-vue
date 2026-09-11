<script lang="ts" src="./MapView.ts" />
<template>
  <div
    v-if="!isUserLocationReady"
    class="loading-map d-flex justify-content-center align-items-center"
  >
    <div class="text-center">
      <h3>Please wait</h3>
      <span>Locating...</span>
    </div>
  </div>
  <div v-show="isUserLocationReady" class="map-container" ref="mapElement"></div>
</template>

<style scoped>
.map-container {
  position: fixed;
  width: 100vw;
  height: 100vh;
}
.loading-map {
  color: white;
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
