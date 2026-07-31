import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const SUPER_ADMIN = 'SUPER_ADMIN'

export const usePermissionStore = defineStore('permission', () => {
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  const isSuperAdmin = computed(() => roles.value.includes(SUPER_ADMIN))

  function setAuthData(roleList: string[], permissionList: string[]) {
    roles.value = roleList
    permissions.value = permissionList
  }

  function clear() {
    roles.value = []
    permissions.value = []
  }

  function hasPermission(code: string) {
    if (isSuperAdmin.value) return true
    return permissions.value.includes(code)
  }

  function hasAnyPermission(codes: string[]) {
    return codes.some((code) => hasPermission(code))
  }

  return {
    roles,
    permissions,
    isSuperAdmin,
    setAuthData,
    clear,
    hasPermission,
    hasAnyPermission,
  }
})
