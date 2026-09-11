import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY

if (!navigator.geolocation) {
  throw new Error('Tu navegador no soporta el Geolocation')
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
