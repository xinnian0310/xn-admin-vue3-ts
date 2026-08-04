import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserUiConfig,
  resetUserUiConfig,
  saveUserUiConfig,
  type UserUiConfig,
} from '@/api/user-ui-config'
import { applyUserUiPreference, type UserUiPreference } from '@/config/app'

export const useUiPreferenceStore = defineStore('uiPreference', () => {
  const preference = ref<UserUiConfig | null>(null)
  const drawerVisible = ref(false)
  const loaded = ref(false)

  function openDrawer() {
    drawerVisible.value = true
  }

  function closeDrawer() {
    drawerVisible.value = false
  }

  async function load() {
    try {
      const res = await getUserUiConfig()
      preference.value = res.data ?? null
      applyUserUiPreference(preference.value as UserUiPreference | null)
    } catch {
      preference.value = null
    } finally {
      loaded.value = true
    }
  }

  async function save(data: UserUiConfig) {
    const res = await saveUserUiConfig(data)
    preference.value = res.data
    applyUserUiPreference(preference.value as UserUiPreference)
    return res.data
  }

  async function reset() {
    await resetUserUiConfig()
    preference.value = null
    applyUserUiPreference(null)
  }

  /** 退出登录时清本地偏好并回到全局布局 */
  function clearLocal() {
    preference.value = null
    loaded.value = false
    applyUserUiPreference(null)
  }

  return {
    preference,
    drawerVisible,
    loaded,
    openDrawer,
    closeDrawer,
    load,
    save,
    reset,
    clearLocal,
  }
})
