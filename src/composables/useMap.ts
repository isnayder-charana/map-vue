import { ref } from 'vue'
import { useMapStore } from '@/stores/map'
import mapboxgl from 'mapbox-gl'
import { createPlacePopupContent } from '@/utils'

export const useMap = () => {
  const mapElement = ref<HTMLDivElement>()

  const mapStore = useMapStore()

  const initMap = async (userLocationName: string, userLocation?: [number, number]) => {
    if (!mapElement.value) throw new Error('Div Element no exits')
    if (!userLocation) throw new Error('User location no exits')

    await Promise.resolve()

    const map = new mapboxgl.Map({
      container: mapElement.value, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: userLocation, // starting position [lng, lat]
      zoom: 15, // starting zoom
    })

    map.on('load', () => {
      const myLocationPopup = new mapboxgl.Popup({
        offset: [0, -35],
      })
        .setLngLat(userLocation)
        .setDOMContent(createPlacePopupContent('You are here', userLocationName))
      new mapboxgl.Marker({ color: '#0d6efd' })
        .setLngLat(userLocation)
        .setPopup(myLocationPopup)
        .addTo(map)

      mapStore.setMap(map)
    })

    return map
  }

  return {
    initMap,
    mapElement,
  }
}
