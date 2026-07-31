import { inject, isRef, type Ref } from 'vue'
import type { CrudApiModule } from '@/types/crud'

export const CRUD_API_KEY = 'crudApi'

/**
 * 在 Save 弹窗中取 xnTable 注入的 API 模块
 * （表格配置 api="route" 后自动 provide）
 * 通过 Proxy 延迟读取，避免 setup 时序问题
 */
export function useCrudApi(): CrudApiModule {
  const injected = inject<Ref<CrudApiModule | null> | CrudApiModule | null>(CRUD_API_KEY, null)
  if (injected == null) {
    throw new Error('[useCrudApi] 未注入 crudApi，请在 xnTable 上配置 api')
  }

  return new Proxy({} as CrudApiModule, {
    get(_target, prop, _receiver) {
      const api = isRef(injected) ? injected.value : injected
      if (!api) {
        throw new Error('[useCrudApi] crudApi 为空，请确认 xnTable 的 api 配置正确')
      }
      const value = Reflect.get(api, prop, api)
      return typeof value === 'function' ? value.bind(api) : value
    },
  })
}
