import { computed, defineComponent, onBeforeUnmount, ref } from 'vue'
import SearchResults from '@/components/search-results/SearchResults.vue'
import { usePlacesStore } from '@/stores/places'

export default defineComponent({
  name: 'SearchBar',
  components: { SearchResults },
  setup() {
    const placesStore = usePlacesStore()
    const debounceTimeout = ref<ReturnType<typeof setTimeout>>()
    const debouncedValue = ref('')

    onBeforeUnmount(() => {
      if (debounceTimeout.value) clearTimeout(debounceTimeout.value)
    })

    return {
      debouncedValue,
      searchTerm: computed({
        get() {
          return debouncedValue.value
        },
        set(val: string) {
          if (debounceTimeout.value) clearTimeout(debounceTimeout.value)
          debounceTimeout.value = setTimeout(() => {
            debouncedValue.value = val
            placesStore.searchPlacesByTerm(val)
          }, 500)
        },
      }),
    }
  },
})
