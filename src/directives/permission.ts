import type { App, Directive } from 'vue'
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '@/stores/permission'
import { isCodeDefined, isRegistryLoaded } from '@/utils/api-guard'

const warnedCodes = new Set<string>()

function checkPermission(el: HTMLElement, binding: { value?: string | string[] }) {
  const store = usePermissionStore()
  const value = binding.value
  if (!value) return
  const codes = Array.isArray(value) ? value : [value]

  if (import.meta.env.DEV && isRegistryLoaded()) {
    for (const code of codes) {
      if (!isCodeDefined(code) && !warnedCodes.has(code)) {
        warnedCodes.add(code)
        console.warn(`[api-guard] 按钮权限「${code}」未在「权限内容」中登记（开发提示）`)
      }
    }
  }

  const allowed = codes.some((code) => store.hasPermission(code))
  if (!allowed) {
    el.parentNode?.removeChild(el)
  }
}

export const permissionDirective: Directive = {
  mounted(el, binding) {
    checkPermission(el as HTMLElement, binding)
  },
  updated(el, binding) {
    checkPermission(el as HTMLElement, binding)
  },
}

export function setupPermissionDirective(app: App) {
  app.directive('permission', permissionDirective)
}

export function usePermission() {
  const store = usePermissionStore()
  const { roles, permissions, isSuperAdmin } = storeToRefs(store)
  return {
    hasPermission: store.hasPermission,
    hasAnyPermission: store.hasAnyPermission,
    isSuperAdmin,
    roles,
    permissions,
  }
}
