import { onMounted, ref } from 'vue'
import { getPageUiConfig } from '@/api/page-ui'
import type { ButtonListItem } from '@/types/button'
import type { SearchItem } from '@/types/search'
import { mapButtonItems, mapSearchItems } from '@/utils/page-ui'

export function usePageUi(routePath: string) {
  const searchItems = ref<SearchItem[]>([])
  const buttonItems = ref<ButtonListItem[]>([])
  const tableButtonItems = ref<ButtonListItem[]>([])
  const loading = ref(false)

  async function loadPageUi() {
    loading.value = true
    try {
      const res = await getPageUiConfig(routePath)
      searchItems.value = mapSearchItems(res.data.searchItems ?? [])
      buttonItems.value = mapButtonItems(res.data.buttons ?? [])
      tableButtonItems.value = mapButtonItems(res.data.tableButtons ?? [])
    } finally {
      loading.value = false
    }
  }

  onMounted(loadPageUi)

  return {
    searchItems,
    buttonItems,
    tableButtonItems,
    loading,
    reloadPageUi: loadPageUi,
  }
}
