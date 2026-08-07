import type { Router } from 'vue-router'
import { useMenuStore, collectMenuPaths } from '@/stores/menu'
import { buildRouteRecord } from '@/utils/view-loader'

const LAYOUT_NAME = 'AdminLayout'
const iframePage = () => import('@/views/common/iframe/index.vue')

let registerPromise: Promise<void> | null = null

function addDynamicRoutes(router: Router) {
  const menuStore = useMenuStore()
  const paths = collectMenuPaths(menuStore.sysRoutes)

  for (const route of paths) {
    if (!route.path) continue
    const routeName = route.path.replace(/^\//, '').replace(/\//g, '-')
    if (routeName === 'dashboard') continue
    if (!router.hasRoute(routeName)) {
      const meta = {
        title: route.title,
        icon: route.icon,
        // 未开启权限控制时不写入 meta.permission，路由守卫将跳过权限校验
        permission: route.permissionControl ? route.permission : undefined,
        affix: route.affix,
        linkUrl: route.type === 'LINK' ? route.linkUrl : undefined,
      }
      if (route.type === 'LINK') {
        const path = route.path.replace(/^\//, '')
        router.addRoute(LAYOUT_NAME, {
          path,
          name: routeName,
          component: iframePage,
          meta: { ...meta, routePath: route.path },
        })
      } else {
        router.addRoute(LAYOUT_NAME, {
          ...buildRouteRecord(route.path, meta),
          name: routeName,
        })
      }
    }
  }
}

export async function registerDynamicRoutes(router: Router) {
  const menuStore = useMenuStore()
  if (menuStore.routesRegistered) {
    return
  }

  if (registerPromise) {
    return registerPromise
  }

  registerPromise = (async () => {
    try {
      await menuStore.fetchMenus()
      addDynamicRoutes(router)
    } catch (error) {
      console.error('[route-register] 菜单加载失败，将仅使用静态路由', error)
      menuStore.markMenuLoadFailed()
    } finally {
      // 通配路由必须在动态业务路由之后挂载，否则硬刷深层页面会先被 redirect
      if (!router.hasRoute('CatchAll')) {
        router.addRoute({
          path: '/:pathMatch(.*)*',
          name: 'CatchAll',
          redirect: () => {
            const store = useMenuStore()
            return store.menuLoadFailed ? '/503' : '/404'
          },
        })
      }
      // 无论成功失败都标记完成，避免守卫反复请求 /api/auth/menus
      menuStore.markRoutesRegistered()
      registerPromise = null
    }
  })()

  return registerPromise
}

export function resetDynamicRoutes() {
  registerPromise = null
  useMenuStore().reset()
}
