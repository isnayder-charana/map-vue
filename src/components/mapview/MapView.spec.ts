import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

const mocks = vi.hoisted(() => ({
  initMap: vi.fn(),
}))

vi.mock('@/composables', async () => {
  const { ref } = await import('vue')

  return {
    useMap: vi.fn(() => ({
      initMap: mocks.initMap,
      mapElement: ref<HTMLDivElement>(),
    })),
  }
})

import MapView from './MapView.vue'
import { usePlacesStore } from '@/stores/places'

describe('MapView', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    mocks.initMap.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('inicializa el mapa al montarse si la ubicación está lista', async () => {
    const placesStore = usePlacesStore()
    placesStore.userLocation = [-70.25, -18.01]
    placesStore.userLocationName = 'Tacna, Perú'

    mount(MapView, {
      global: {
        plugins: [pinia],
      },
    })

    await nextTick()
    await flushPromises()

    expect(mocks.initMap).toHaveBeenCalledWith('Tacna, Perú', [-70.25, -18.01])
  })

  it('inicializa el mapa cuando la ubicación llega después de montar el componente', async () => {
    const placesStore = usePlacesStore()

    mount(MapView, {
      global: {
        plugins: [pinia],
      },
    })

    expect(mocks.initMap).not.toHaveBeenCalled()

    placesStore.userLocation = [-70.25, -18.01]
    placesStore.userLocationName = 'Tacna, Perú'

    await nextTick()
    await flushPromises()

    expect(mocks.initMap).toHaveBeenCalledWith('Tacna, Perú', [-70.25, -18.01])
  })
})
