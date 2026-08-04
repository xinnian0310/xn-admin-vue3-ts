import type { RouteRecordRaw } from 'vue-router'

const viewModules = import.meta.glob('@/views/**/{index,save}.vue')

/** 加载 views 下 index.vue，路径 /system/roles -> views/system/roles/index.vue */
export function loadIndexView(routePath: string) {
  const viewDir = routePath.replace(/^\//, '')
  const key = `/src/views/${viewDir}/index.vue`
  const loader = viewModules[key]
  if (!loader) {
    console.warn(`[view-loader] 未找到页面: views/${viewDir}/index.vue`)
    return () => import('@/views/error/NotFoundView.vue')
  }
  return loader
}

/** 加载 views 下 save.vue */
export function loadSaveView(routePath: string) {
  const basePath = routePath.replace(/\/save(\/.*)?$/, '').replace(/^\//, '')
  const key = `/src/views/${basePath}/save.vue`
  const loader = viewModules[key]
  if (!loader) {
    console.warn(`[view-loader] 未找到页面: views/${basePath}/save.vue`)
    return () => import('@/views/error/NotFoundView.vue')
  }
  return loader
}

export function hasIndexView(routePath: string): boolean {
  const viewDir = routePath.replace(/^\//, '')
  return `/src/views/${viewDir}/index.vue` in viewModules
}

export function listAvailableViews(): string[] {
  return Object.keys(viewModules).map((k) => k.replace('/src/views/', 'views/'))
}

/** 根据菜单路由记录生成 Vue Router 配置 */
export function buildRouteRecord(
  routePath: string,
  meta: Record<string, unknown> = {},
): RouteRecordRaw {
  const path = routePath.replace(/^\//, '')
  return {
    path,
    name: path.replace(/\//g, '-'),
    component: loadIndexView(routePath),
    meta: { ...meta, routePath },
  }
}

/** 生成 save 子路由 */
export function buildSaveRouteRecord(
  basePath: string,
  meta: Record<string, unknown> = {},
): RouteRecordRaw[] {
  const base = basePath.replace(/^\//, '')
  return [
    {
      path: `${base}/save/:id?`,
      name: `${base.replace(/\//g, '-')}-save`,
      component: loadSaveView(basePath),
      meta: {
        ...meta,
        hidden: true,
        title: meta.title ? `${meta.title} - 编辑` : '编辑',
        routePath: basePath,
      },
    },
  ]
}

export { viewModules }
