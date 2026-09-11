import IconMapPinUserFill from '@/assets/svg/IconMapPinUserFill.vue'
import { useMapStore } from '@/stores/map'
import { usePlacesStore } from '@/stores/places'
import { mount } from '@vue/test-utils'
import type { Map } from 'mapbox-gl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MyLocationBtn from './MyLocationBtn.vue'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => {
  const map = {
    on: vi.fn(),
    fitBounds: vi.fn(),
    getLayer: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
  }

  return {
    map,
  }
})

describe('MyLocationBtn', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the button when location is ready and map exists', () => {
    const placesStore = usePlacesStore()
    const mapStore = useMapStore()

    const map = mocks.map as unknown as Map

    placesStore.userLocation = [-70.25, -18.01]
    mapStore.map = map

    const wrapper = mount(MyLocationBtn)

    expect(wrapper.findComponent(IconMapPinUserFill).exists()).toBe(true)
  })
})
